#!/usr/bin/env node
/**
 * RitualDev Fleet Event Poller & Automated Notifier
 * Periodically polls the GitHub API for:
 * 1. New Stars & Forks across the 38 repositories in RitualDev-Lab
 * 2. Recent CI Failures across all repositories
 * 3. Successful Release workflow completions
 *
 * Can be run via GitHub Actions on a schedule or as a local daemon.
 */

import fs from "node:fs";
import path from "node:path";
import {
  dispatchFleetAlert,
  type FleetNotificationEvent,
  type NotificationChannelsConfig,
} from "../src/lib/notifications.js";

const ORG = "RitualDev-Lab";
const STATE_FILE = path.resolve(process.cwd(), ".fleet-events-cache.json");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

const CHANNELS: NotificationChannelsConfig = {
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
};

interface CacheState {
  lastEventId?: string;
  processedRunIds: number[];
  lastCheckedAt: string;
}

function loadState(): CacheState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    }
  } catch {}
  return { processedRunIds: [], lastCheckedAt: new Date(Date.now() - 3600 * 1000).toISOString() };
}

function saveState(state: CacheState) {
  try {
    // Keep only the last 200 processed runs to avoid unbounded growth
    if (state.processedRunIds.length > 200) {
      state.processedRunIds = state.processedRunIds.slice(-200);
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch (err: any) {
    console.error("Failed to save fleet state:", err.message);
  }
}

async function githubFetch(endpoint: string) {
  const headers: Record<string, string> = {
    "User-Agent": "RitualDev-Fleet-Poller",
    Accept: "application/vnd.github.v3+json",
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `token ${GITHUB_TOKEN}`;
  }

  const res = await fetch(`https://api.github.com${endpoint}`, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function pollFleetEvents() {
  console.log(`🔍 [poller] Checking fleet events for org: ${ORG}...`);
  const state = loadState();
  const alerts: FleetNotificationEvent[] = [];

  // 1. Poll Org Activity Events (Stars & Forks)
  try {
    const events: any[] = await githubFetch(`/orgs/${ORG}/events?per_page=30`);
    if (Array.isArray(events)) {
      let newestEventId = state.lastEventId;

      for (const ev of events) {
        if (state.lastEventId && ev.id === state.lastEventId) {
          break; // reached previously processed events
        }

        if (!newestEventId) {
          newestEventId = ev.id;
        }

        const repoName = ev.repo?.name ? ev.repo.name.replace(`${ORG}/`, "") : "repo";

        if (ev.type === "WatchEvent" && ev.payload?.action === "started") {
          alerts.push({
            type: "star",
            repo: repoName,
            sender: ev.actor?.login || "anonymous",
            senderAvatar: ev.actor?.avatar_url,
            htmlUrl: `https://github.com/${ORG}/${repoName}`,
            timestamp: ev.created_at,
          });
        } else if (ev.type === "ForkEvent") {
          alerts.push({
            type: "fork",
            repo: repoName,
            sender: ev.actor?.login || "anonymous",
            senderAvatar: ev.actor?.avatar_url,
            forkUrl: ev.payload?.forkee?.html_url || `https://github.com/${ev.actor?.login}/${repoName}`,
            timestamp: ev.created_at,
          });
        }
      }

      if (events[0]?.id) {
        state.lastEventId = events[0].id;
      }
    }
  } catch (err: any) {
    console.warn(`⚠️ Could not query org events: ${err.message}`);
  }

  // 2. Poll Repos for Recent CI Failures and Releases
  try {
    const repos: any[] = await githubFetch(`/orgs/${ORG}/repos?per_page=100&type=all&sort=pushed`);
    const activeRepos = repos.slice(0, 20); // check 20 most recently active repos

    for (const repo of activeRepos) {
      try {
        const runsData = await githubFetch(`/repos/${ORG}/${repo.name}/actions/runs?per_page=5`);
        const runs = runsData?.workflow_runs || [];

        for (const run of runs) {
          if (state.processedRunIds.includes(run.id)) continue;
          state.processedRunIds.push(run.id);

          // Check if this run finished recently (within the last 2 hours)
          const runFinished = new Date(run.updated_at).getTime();
          const twoHoursAgo = Date.now() - 2 * 3600 * 1000;

          if (runFinished > twoHoursAgo) {
            if (run.conclusion === "failure") {
              alerts.push({
                type: "ci_failure",
                repo: repo.name,
                workflowName: run.name || "CI Workflow",
                runNumber: run.run_number || 0,
                branch: run.head_branch || "main",
                commitSha: run.head_sha || "0000000",
                commitMessage: run.head_commit?.message || "Automated run",
                runUrl: run.html_url,
                actor: run.actor?.login || "developer",
                timestamp: run.updated_at,
              });
            } else if (
              run.conclusion === "success" &&
              (run.name?.toLowerCase().includes("release") || run.name?.toLowerCase().includes("publish"))
            ) {
              alerts.push({
                type: "release",
                repo: repo.name,
                tagName: run.head_branch || "main",
                releaseName: `${run.name} (#${run.run_number})`,
                releaseUrl: run.html_url,
                author: run.actor?.login || "github-actions",
                body: `Automated release workflow '${run.name}' finished successfully.`,
                timestamp: run.updated_at,
              });
            }
          }
        }
      } catch {
        // Continue to next repo
      }
    }
  } catch (err: any) {
    console.warn(`⚠️ Could not query repo workflow runs: ${err.message}`);
  }

  state.lastCheckedAt = new Date().toISOString();
  saveState(state);

  console.log(`📊 [poller] Detected ${alerts.length} new fleet events to dispatch.`);

  for (const alert of alerts) {
    console.log(`🚀 Dispatching ${alert.type} alert on ${alert.repo}...`);
    const res = await dispatchFleetAlert(CHANNELS, alert);
    console.log(`   Result: Discord=${res.discord}, Telegram=${res.telegram}`);
  }

  return { dispatchedCount: alerts.length };
}

// Run immediately if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  pollFleetEvents()
    .then((r) => {
      console.log(`✔ Finished. Dispatched ${r.dispatchedCount} alerts.`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Fatal poller error:", err);
      process.exit(1);
    });
}
