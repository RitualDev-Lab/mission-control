#!/usr/bin/env node
/**
 * RitualDev Fleet Webhook Dispatcher
 * Standalone HTTP listener for GitHub Organization Webhooks.
 *
 * Supported GitHub Events:
 * - 'watch' (action: 'started') -> Dispatches ⭐ New Star alert
 * - 'fork' -> Dispatches 🍴 New Fork alert
 * - 'release' (action: 'published') -> Dispatches 🚀 Release Published alert
 * - 'workflow_run' (action: 'completed', conclusion: 'failure') -> Dispatches 🚨 CI Failure alert
 * - 'workflow_run' (action: 'completed', conclusion: 'success', name matches release) -> Dispatches 🚀 Release Workflow Complete alert
 *
 * Usage:
 *   PORT=4040 GITHUB_WEBHOOK_SECRET=mysecret DISCORD_WEBHOOK_URL=... node scripts/webhook-dispatcher.js
 */

import http from "node:http";
import crypto from "node:crypto";
import {
  dispatchFleetAlert,
  type FleetNotificationEvent,
  type NotificationChannelsConfig,
} from "../src/lib/notifications.js";

const PORT = parseInt(process.env.PORT || "4040", 10);
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || "";
const CHANNELS: NotificationChannelsConfig = {
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
};

function verifySignature(secret: string, header: string | undefined, payload: Buffer): boolean {
  if (!secret) return true; // If no secret configured, allow (e.g. dev mode)
  if (!header) return false;

  const parts = header.split("=");
  const sigHex = parts[1];
  if (!sigHex) return false;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const digestHex = hmac.digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(sigHex, "utf8"), Buffer.from(digestHex, "utf8"));
  } catch {
    return false;
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && (req.url === "/health" || req.url === "/")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({
        status: "ok",
        service: "ritualdev-webhook-dispatcher",
        uptime: process.uptime(),
        channelsConfigured: {
          discord: !!CHANNELS.discordWebhookUrl,
          telegram: !!(CHANNELS.telegramBotToken && CHANNELS.telegramChatId),
          secretActive: !!WEBHOOK_SECRET,
        },
      })
    );
  }

  if (req.method !== "POST" || req.url !== "/webhook") {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Not Found. Post GitHub webhooks to /webhook" }));
  }

  const chunks: Buffer[] = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", async () => {
    const rawBody = Buffer.concat(chunks);
    const signature = req.headers["x-hub-signature-256"] as string | undefined;

    if (!verifySignature(WEBHOOK_SECRET, signature, rawBody)) {
      console.warn("⚠️ [dispatcher] Invalid HMAC signature received.");
      res.writeHead(401, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Invalid signature" }));
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Malformed JSON" }));
    }

    const eventName = req.headers["x-github-event"] as string;
    console.log(`📡 [dispatcher] Received GitHub event '${eventName}' action '${payload.action}' on ${payload.repository?.full_name || "unknown"}`);

    let eventToDispatch: FleetNotificationEvent | null = null;
    const repoName = payload.repository?.name || "unknown-repo";

    // 1. Star Event
    if (eventName === "watch" && payload.action === "started") {
      eventToDispatch = {
        type: "star",
        repo: repoName,
        sender: payload.sender?.login || "anonymous",
        senderAvatar: payload.sender?.avatar_url,
        totalStars: payload.repository?.stargazers_count,
        htmlUrl: payload.repository?.html_url || `https://github.com/RitualDev-Lab/${repoName}`,
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Fork Event
    else if (eventName === "fork") {
      eventToDispatch = {
        type: "fork",
        repo: repoName,
        sender: payload.forkee?.owner?.login || payload.sender?.login || "anonymous",
        senderAvatar: payload.sender?.avatar_url,
        forkUrl: payload.forkee?.html_url || `https://github.com/${payload.sender?.login}/${repoName}`,
        totalForks: payload.repository?.forks_count,
        timestamp: new Date().toISOString(),
      };
    }

    // 3. Release Event
    else if (eventName === "release" && (payload.action === "published" || payload.action === "released")) {
      eventToDispatch = {
        type: "release",
        repo: repoName,
        tagName: payload.release?.tag_name || "v0.0.0",
        releaseName: payload.release?.name || payload.release?.tag_name || "New Release",
        releaseUrl: payload.release?.html_url || `https://github.com/RitualDev-Lab/${repoName}/releases`,
        author: payload.release?.author?.login || payload.sender?.login || "ritualdev",
        isPrerelease: payload.release?.prerelease || false,
        body: payload.release?.body || "",
        timestamp: payload.release?.published_at || new Date().toISOString(),
      };
    }

    // 4. Workflow Run (CI Failure or Release Workflow Finish)
    else if (eventName === "workflow_run" && payload.action === "completed") {
      const run = payload.workflow_run;
      if (run) {
        if (run.conclusion === "failure") {
          // CI Failure across fleet!
          eventToDispatch = {
            type: "ci_failure",
            repo: repoName,
            workflowName: run.name || "Workflow",
            runNumber: run.run_number || 0,
            branch: run.head_branch || "main",
            commitSha: run.head_sha || "0000000",
            commitMessage: run.head_commit?.message || "Automated run",
            runUrl: run.html_url,
            actor: run.actor?.login || payload.sender?.login || "ci",
            timestamp: run.updated_at || new Date().toISOString(),
          };
        } else if (
          run.conclusion === "success" &&
          (run.name?.toLowerCase().includes("release") || run.name?.toLowerCase().includes("publish"))
        ) {
          eventToDispatch = {
            type: "release",
            repo: repoName,
            tagName: run.head_branch || "main",
            releaseName: `${run.name} (#${run.run_number})`,
            releaseUrl: run.html_url,
            author: run.actor?.login || "github-actions",
            body: `Automated release workflow '${run.name}' finished successfully.`,
            timestamp: run.updated_at || new Date().toISOString(),
          };
        }
      }
    }

    if (eventToDispatch) {
      console.log(`🚀 [dispatcher] Forwarding ${eventToDispatch.type} alert to configured channels...`);
      const result = await dispatchFleetAlert(CHANNELS, eventToDispatch);
      console.log(`✔ [dispatcher] Dispatched: Discord=${result.discord}, Telegram=${result.telegram}`);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ success: true, dispatched: eventToDispatch.type, result }));
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "ignored", reason: "Event does not match alerting criteria" }));
  });
});

server.listen(PORT, () => {
  console.log(`✨ RitualDev Fleet Webhook Dispatcher listening on http://0.0.0.0:${PORT}`);
  console.log(`   Discord Webhook: ${CHANNELS.discordWebhookUrl ? "Configured ✔" : "None"}`);
  console.log(`   Telegram Bot:    ${CHANNELS.telegramBotToken ? "Configured ✔" : "None"}`);
  console.log(`   Secret Verify:   ${WEBHOOK_SECRET ? "Active (HMAC-SHA256) ✔" : "Disabled"}`);
});
