/**
 * RitualDev Mission Control - Multi-Channel Fleet Event Dispatcher
 * Formats and dispatches automated alerts to Telegram & Discord for:
 * 1. New Stars & Forks across any of the 38 repositories.
 * 2. Successful Release Workflows (binaries, npm, PyPI, VS Code).
 * 3. CI Failures across any repository in the RitualDev-Lab fleet.
 */

export type FleetEventType = "star" | "fork" | "release" | "ci_failure";

export interface StarEvent {
  type: "star";
  repo: string;
  sender: string;
  senderAvatar?: string;
  totalStars?: number;
  htmlUrl: string;
  timestamp?: string;
}

export interface ForkEvent {
  type: "fork";
  repo: string;
  sender: string;
  senderAvatar?: string;
  forkUrl: string;
  totalForks?: number;
  timestamp?: string;
}

export interface ReleaseEvent {
  type: "release";
  repo: string;
  tagName: string;
  releaseName: string;
  releaseUrl: string;
  author: string;
  isPrerelease?: boolean;
  body?: string;
  timestamp?: string;
}

export interface CIFailureEvent {
  type: "ci_failure";
  repo: string;
  workflowName: string;
  runNumber: number;
  branch: string;
  commitSha: string;
  commitMessage: string;
  runUrl: string;
  actor: string;
  failedStep?: string;
  timestamp?: string;
}

export type FleetNotificationEvent = StarEvent | ForkEvent | ReleaseEvent | CIFailureEvent;

export interface NotificationChannelsConfig {
  discordWebhookUrl?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
}

export interface DiscordEmbed {
  title: string;
  description: string;
  url?: string;
  color: number;
  author?: {
    name: string;
    icon_url?: string;
    url?: string;
  };
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
}

export interface DiscordWebhookPayload {
  username: string;
  avatar_url?: string;
  content?: string;
  embeds: DiscordEmbed[];
}

/**
 * Formats a Discord embed for any fleet event.
 */
export function formatDiscordPayload(event: FleetNotificationEvent): DiscordWebhookPayload {
  const ts = event.timestamp || new Date().toISOString();
  const orgIcon = "https://avatars.githubusercontent.com/u/197170196?s=200&v=4"; // RitualDev-Lab org avatar

  switch (event.type) {
    case "star": {
      return {
        username: "RitualDev Fleet Radar",
        avatar_url: orgIcon,
        embeds: [
          {
            title: `⭐ New Star on RitualDev-Lab/${event.repo}`,
            url: event.htmlUrl,
            description: `**[@${event.sender}](https://github.com/${event.sender})** just starred [**${event.repo}**](${event.htmlUrl})!`,
            color: 0xffd700, // Gold
            author: {
              name: `@${event.sender}`,
              icon_url: event.senderAvatar || orgIcon,
              url: `https://github.com/${event.sender}`,
            },
            fields: [
              {
                name: "Repository",
                value: `[RitualDev-Lab/${event.repo}](${event.htmlUrl})`,
                inline: true,
              },
              {
                name: "Total Stars",
                value: event.totalStars !== undefined ? `⭐ ${event.totalStars}` : "⭐ +1",
                inline: true,
              },
            ],
            footer: {
              text: "RitualDev Lab Fleet Intelligence • hq.ritualdev.in",
              icon_url: orgIcon,
            },
            timestamp: ts,
          },
        ],
      };
    }

    case "fork": {
      return {
        username: "RitualDev Fleet Radar",
        avatar_url: orgIcon,
        embeds: [
          {
            title: `🍴 New Fork of RitualDev-Lab/${event.repo}`,
            url: event.forkUrl,
            description: `**[@${event.sender}](https://github.com/${event.sender})** created a fork of [**${event.repo}**](${event.forkUrl})!`,
            color: 0x9b59b6, // Amethyst Purple
            author: {
              name: `@${event.sender}`,
              icon_url: event.senderAvatar || orgIcon,
              url: `https://github.com/${event.sender}`,
            },
            fields: [
              {
                name: "Parent Repo",
                value: `RitualDev-Lab/${event.repo}`,
                inline: true,
              },
              {
                name: "Fork Link",
                value: `[View Fork](${event.forkUrl})`,
                inline: true,
              },
              {
                name: "Total Forks",
                value: event.totalForks !== undefined ? `🍴 ${event.totalForks}` : "🍴 +1",
                inline: true,
              },
            ],
            footer: {
              text: "RitualDev Lab Fleet Intelligence • hq.ritualdev.in",
              icon_url: orgIcon,
            },
            timestamp: ts,
          },
        ],
      };
    }

    case "release": {
      return {
        username: "RitualDev Release Dispatcher",
        avatar_url: orgIcon,
        embeds: [
          {
            title: `🚀 Release Published: ${event.repo} ${event.tagName}`,
            url: event.releaseUrl,
            description: `Successfully published release **[${event.tagName}](${event.releaseUrl})** for **RitualDev-Lab/${event.repo}**.\n\n${
              event.body ? (event.body.length > 280 ? `${event.body.slice(0, 277)}...` : event.body) : "All release artifacts and packages distributed to registries."
            }`,
            color: 0x2ecc71, // Emerald Green
            author: {
              name: `RitualDev Release Engine`,
              icon_url: orgIcon,
              url: `https://github.com/RitualDev-Lab/${event.repo}`,
            },
            fields: [
              {
                name: "Version Tag",
                value: `\`${event.tagName}\``,
                inline: true,
              },
              {
                name: "Repository",
                value: `[${event.repo}](${event.releaseUrl})`,
                inline: true,
              },
              {
                name: "Published By",
                value: `@${event.author}`,
                inline: true,
              },
            ],
            footer: {
              text: "RitualDev Lab Fleet Intelligence • hq.ritualdev.in",
              icon_url: orgIcon,
            },
            timestamp: ts,
          },
        ],
      };
    }

    case "ci_failure": {
      return {
        username: "RitualDev CI Sentinel",
        avatar_url: orgIcon,
        embeds: [
          {
            title: `🚨 CI Failure: ${event.repo} (${event.workflowName})`,
            url: event.runUrl,
            description: `Automated workflow **${event.workflowName}** failed on branch \`${event.branch}\`! Action required to maintain fleet green status.`,
            color: 0xe74c3c, // Crimson Red
            author: {
              name: `CI Sentinel • Run #${event.runNumber}`,
              icon_url: orgIcon,
              url: event.runUrl,
            },
            fields: [
              {
                name: "Repository",
                value: `[RitualDev-Lab/${event.repo}](https://github.com/RitualDev-Lab/${event.repo})`,
                inline: true,
              },
              {
                name: "Branch",
                value: `\`${event.branch}\``,
                inline: true,
              },
              {
                name: "Triggered By",
                value: `@${event.actor}`,
                inline: true,
              },
              {
                name: "Commit",
                value: `\`${event.commitSha.slice(0, 7)}\` - ${event.commitMessage.slice(0, 60)}`,
                inline: false,
              },
              {
                name: "Failed Run URL",
                value: `[Inspect Logs on GitHub Actions](${event.runUrl})`,
                inline: false,
              },
            ],
            footer: {
              text: "RitualDev Lab CI Sentinel • hq.ritualdev.in",
              icon_url: orgIcon,
            },
            timestamp: ts,
          },
        ],
      };
    }
  }
}

/**
 * Formats a Telegram HTML message for any fleet event.
 */
export function formatTelegramMessage(event: FleetNotificationEvent): string {
  switch (event.type) {
    case "star":
      return (
        `⭐ <b>New Star on RitualDev-Lab/${event.repo}</b>\n\n` +
        `👤 User: <a href="https://github.com/${event.sender}">@${event.sender}</a>\n` +
        `📦 Repo: <a href="${event.htmlUrl}">RitualDev-Lab/${event.repo}</a>\n` +
        (event.totalStars !== undefined ? `🌟 Total Stars: <b>${event.totalStars}</b>\n` : "") +
        `\n<a href="${event.htmlUrl}">View on GitHub</a> • <i>hq.ritualdev.in</i>`
      );

    case "fork":
      return (
        `🍴 <b>New Fork of RitualDev-Lab/${event.repo}</b>\n\n` +
        `👤 Forked by: <a href="https://github.com/${event.sender}">@${event.sender}</a>\n` +
        `📦 Target Repo: <a href="${event.forkUrl}">${event.sender}/${event.repo}</a>\n` +
        (event.totalForks !== undefined ? `🍴 Total Forks: <b>${event.totalForks}</b>\n` : "") +
        `\n<a href="${event.forkUrl}">Inspect Fork</a> • <i>hq.ritualdev.in</i>`
      );

    case "release":
      return (
        `🚀 <b>Release Published: ${event.repo} ${event.tagName}</b>\n\n` +
        `🏷️ Tag: <code>${event.tagName}</code>\n` +
        `📦 Repository: <a href="${event.releaseUrl}">RitualDev-Lab/${event.repo}</a>\n` +
        `👤 Author: @${event.author}\n` +
        `\n🔗 <a href="${event.releaseUrl}">Download Artifacts & Release Notes</a>\n` +
        `<i>RitualDev Mission Control</i>`
      );

    case "ci_failure":
      return (
        `🚨 <b>CI Failure Alert: RitualDev-Lab/${event.repo}</b>\n\n` +
        `⚡ Workflow: <b>${event.workflowName}</b> (Run #${event.runNumber})\n` +
        `🌿 Branch: <code>${event.branch}</code>\n` +
        `👤 Actor: @${event.actor}\n` +
        `📝 Commit: <code>${event.commitSha.slice(0, 7)}</code> - ${escapeHtml(event.commitMessage.slice(0, 60))}\n` +
        `\n⚠️ <a href="${event.runUrl}">Inspect Failed Run Logs on GitHub</a>\n` +
        `<i>Fleet CI Sentinel • hq.ritualdev.in</i>`
      );
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Dispatches payload to Discord Webhook.
 */
export async function sendDiscordWebhook(
  webhookUrl: string,
  event: FleetNotificationEvent
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const payload = formatDiscordPayload(event);
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok || res.status === 204) {
      return { success: true, status: res.status };
    } else {
      const errText = await res.text().catch(() => "Unknown error");
      return { success: false, status: res.status, error: errText };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to deliver Discord webhook." };
  }
}

/**
 * Dispatches payload to Telegram Bot API.
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  event: FleetNotificationEvent
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const text = formatTelegramMessage(event);
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) {
      return { success: true, status: res.status };
    } else {
      return { success: false, status: res.status, error: data.description || "Telegram API error" };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to deliver Telegram message." };
  }
}

/**
 * Dispatches to all configured channels (Discord and/or Telegram).
 */
export async function dispatchFleetAlert(
  channels: NotificationChannelsConfig,
  event: FleetNotificationEvent
): Promise<{ discord?: boolean; telegram?: boolean; errors?: string[] }> {
  const result: { discord?: boolean; telegram?: boolean; errors?: string[] } = {};
  const errors: string[] = [];

  const promises: Promise<void>[] = [];

  if (channels.discordWebhookUrl) {
    promises.push(
      sendDiscordWebhook(channels.discordWebhookUrl, event).then((res) => {
        result.discord = res.success;
        if (!res.success && res.error) {
          errors.push(`Discord error: ${res.error}`);
        }
      })
    );
  }

  if (channels.telegramBotToken && channels.telegramChatId) {
    promises.push(
      sendTelegramMessage(channels.telegramBotToken, channels.telegramChatId, event).then((res) => {
        result.telegram = res.success;
        if (!res.success && res.error) {
          errors.push(`Telegram error: ${res.error}`);
        }
      })
    );
  }

  await Promise.all(promises);
  if (errors.length > 0) result.errors = errors;
  return result;
}
