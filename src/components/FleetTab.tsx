"use client";

import { dispatchWorkflow } from "@/lib/github";
import {
  dispatchFleetAlert,
  formatDiscordPayload,
  formatTelegramMessage,
  type FleetNotificationEvent,
} from "@/lib/notifications";
import type { OrgRepoSummary, WorkflowDispatchOption } from "@/lib/types";
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Cpu,
  ExternalLink,
  GitFork,
  Layers,
  Loader2,
  MessageSquare,
  Package,
  Play,
  Rocket,
  Send,
  ShieldAlert,
  ShieldCheck,
  Star,
  Terminal,
  Zap,
} from "lucide-react";
import { useState } from "react";

interface FleetTabProps {
  repos: OrgRepoSummary[];
  onRefresh?: () => void;
}

const PRESET_DISPATCH_OPTIONS: WorkflowDispatchOption[] = [
  {
    repo: "poly",
    workflowId: "release-binaries.yml",
    workflowName: "Compile Multi-Arch Standalone Binaries",
    description: "Compiles Linux x64/arm64, macOS x64/arm64, and Windows x64 native binaries with sha256 checksums.",
    inputs: [
      {
        name: "tag_name",
        description: "Release tag (e.g. v0.6.2)",
        defaultValue: "v0.6.2",
        required: true,
      },
    ],
  },
  {
    repo: "poly",
    workflowId: "publish-npm.yml",
    workflowName: "Publish Poly to npm Registry",
    description: "Builds and publishes latest @ritualdev-lab/poly package to public npm registry.",
  },
  {
    repo: "poly",
    workflowId: "ci.yml",
    workflowName: "Poly Comprehensive CI & Sandbox Matrix",
    description: "Executes unit, integration, affected-only graph tests, and AGPL license firewall checks.",
  },
  {
    repo: "mission-control",
    workflowId: "deploy.yml",
    workflowName: "Deploy Mission Control to GitHub Pages",
    description: "Rebuilds Next.js static export and pushes live to edge at hq.ritualdev.in.",
  },
  {
    repo: "ecosystem-telemetry",
    workflowId: "telemetry-cron.yml",
    workflowName: "Run Ingestion Telemetry Cron",
    description: "Manually triggers the 6-hour registry metrics scraper across npm, Open VSX, and GitHub.",
  },
  {
    repo: "DevShelf",
    workflowId: "deploy-pages.yml",
    workflowName: "Deploy DevShelf to GitHub Pages",
    description: "Builds DevShelf directory static site and pushes live to edge at devshelf.ritualdev.in.",
  },
  {
    repo: "DevShelf",
    workflowId: "ci.yml",
    workflowName: "DevShelf CI & Catalog Validator Matrix",
    description: "Validates schema adherence, category structure, and dead link checking for all 596 utilities.",
  },
  {
    repo: "DevShelf",
    workflowId: "publish-package.yml",
    workflowName: "Publish DevShelf Package & Provenance",
    description: "Publishes latest @ritualdev-lab/devshelf npm package with Sigstore cryptographic provenance.",
  },
];

export function FleetTab({ repos, onRefresh }: FleetTabProps) {
  const [selectedRepo, setSelectedRepo] = useState<string>("poly");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("release-binaries.yml");
  const [branchRef, setBranchRef] = useState<string>("main");
  const [tagInput, setTagInput] = useState<string>("v0.6.2");
  const [isDispatching, setIsDispatching] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  // Multi-Channel Fleet Dispatcher Simulator State
  const [testEventType, setTestEventType] = useState<"star" | "fork" | "release" | "ci_failure">("star");
  const [testRepo, setTestRepo] = useState<string>("poly");
  const [customDiscordUrl, setCustomDiscordUrl] = useState<string>("");
  const [customTelegramToken, setCustomTelegramToken] = useState<string>("");
  const [customTelegramChatId, setCustomTelegramChatId] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{ success: boolean; message: string } | null>(null);

  const getMockEvent = (): FleetNotificationEvent => {
    switch (testEventType) {
      case "star":
        return {
          type: "star",
          repo: testRepo,
          sender: "octocat",
          senderAvatar: "https://avatars.githubusercontent.com/u/583231?v=4",
          totalStars: 42,
          htmlUrl: `https://github.com/RitualDev-Lab/${testRepo}`,
          timestamp: new Date().toISOString(),
        };
      case "fork":
        return {
          type: "fork",
          repo: testRepo,
          sender: "contributor-42",
          senderAvatar: "https://avatars.githubusercontent.com/u/583231?v=4",
          forkUrl: `https://github.com/contributor-42/${testRepo}`,
          totalForks: 12,
          timestamp: new Date().toISOString(),
        };
      case "release":
        return {
          type: "release",
          repo: testRepo,
          tagName: "v0.6.2",
          releaseName: "v0.6.2 Polyglot Monorepo Engine",
          releaseUrl: `https://github.com/RitualDev-Lab/${testRepo}/releases/tag/v0.6.2`,
          author: "ritualdev",
          body: "Release artifacts compiled and published to npm, PyPI, and GitHub Releases.",
          timestamp: new Date().toISOString(),
        };
      case "ci_failure":
        return {
          type: "ci_failure",
          repo: testRepo,
          workflowName: "CI Matrix & Unit Verification",
          runNumber: 142,
          branch: "main",
          commitSha: "e9a8f21c5b8d",
          commitMessage: "fix(core): improve stream buffering",
          runUrl: `https://github.com/RitualDev-Lab/${testRepo}/actions/runs/987654321`,
          actor: "dependabot[bot]",
          timestamp: new Date().toISOString(),
        };
    }
  };

  const handleTestDispatch = async () => {
    setIsSimulating(true);
    setSimResult(null);

    const mockEvent = getMockEvent();

    if (!customDiscordUrl && !(customTelegramToken && customTelegramChatId)) {
      setTimeout(() => {
        setIsSimulating(false);
        setSimResult({
          success: true,
          message: "Simulation payload validated! (Add webhook URL or bot token above to deliver live).",
        });
      }, 500);
      return;
    }

    try {
      const res = await dispatchFleetAlert(
        {
          discordWebhookUrl: customDiscordUrl.trim() || undefined,
          telegramBotToken: customTelegramToken.trim() || undefined,
          telegramChatId: customTelegramChatId.trim() || undefined,
        },
        mockEvent
      );

      if (res.errors && res.errors.length > 0) {
        setSimResult({
          success: false,
          message: res.errors.join(" | "),
        });
      } else {
        setSimResult({
          success: true,
          message: `Live notification dispatched! (Discord: ${res.discord ? "Sent" : "Skipped"}, Telegram: ${res.telegram ? "Sent" : "Skipped"})`,
        });
      }
    } catch (err: any) {
      setSimResult({
        success: false,
        message: err.message || "Failed to deliver test alert.",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  // Available workflows for selected repo
  const availableWorkflows = PRESET_DISPATCH_OPTIONS.filter((w) => w.repo === selectedRepo);
  const currentWorkflow =
    availableWorkflows.find((w) => w.workflowId === selectedWorkflow) ||
    availableWorkflows[0] ||
    PRESET_DISPATCH_OPTIONS[0];

  const handleRepoChange = (newRepo: string) => {
    setSelectedRepo(newRepo);
    const workflowsForNew = PRESET_DISPATCH_OPTIONS.filter((w) => w.repo === newRepo);
    if (workflowsForNew.length > 0) {
      setSelectedWorkflow(workflowsForNew[0].workflowId);
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("ritual_admin_token")
        : null;

    if (!token) {
      alert("No active admin token found in session.");
      return;
    }

    setIsDispatching(true);
    setResult(null);

    const inputs: Record<string, string> = {};
    if (currentWorkflow?.inputs?.some((i) => i.name === "tag_name")) {
      inputs["tag_name"] = tagInput.trim();
    }

    const res = await dispatchWorkflow(
      token,
      selectedRepo,
      currentWorkflow.workflowId,
      branchRef.trim() || "main",
      inputs
    );

    setResult(res);
    setIsDispatching(false);
    if (res.success && onRefresh) {
      setTimeout(() => onRefresh(), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-slate-900/60 border border-sky-500/30 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 shrink-0">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Fleet Operations & Release Dispatcher</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Trigger multi-architecture releases, compile native standalone binaries, dispatch automated
              tests, or deploy edge services across all 37 repositories with zero CLI context switching.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-mono font-semibold flex items-center">
            <Zap className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            ACTIONS DISPATCH ACTIVE
          </span>
        </div>
      </div>

      {/* Main Dispatch Form & Preset Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dispatch Controller Form */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md">
          <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
            <Play className="w-5 h-5 text-sky-400" />
            <span>Workflow Dispatch Cockpit</span>
          </h3>

          <form onSubmit={handleDispatch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Repository */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">
                  Target Repository
                </label>
                <select
                  value={selectedRepo}
                  onChange={(e) => handleRepoChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="poly">poly (Polyglot Monorepo CLI)</option>
                  <option value="DevShelf">DevShelf (Developer Catalog & Tools)</option>
                  <option value="AgentShield">AgentShield (AI Runtime Defense)</option>
                  <option value="mission-control">mission-control (Executive Cockpit)</option>
                  <option value="ecosystem-telemetry">ecosystem-telemetry (Scraper Cron)</option>
                  <option value="vscode-poly">vscode-poly (VS Code Extension)</option>
                  <option value="setup-poly">setup-poly (GitHub Actions Setup)</option>
                  <option value="FinePrintAI">FinePrintAI (Governance Engine)</option>
                </select>
              </div>

              {/* Branch / Git Ref */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">
                  Target Git Ref (Branch or Tag)
                </label>
                <input
                  type="text"
                  value={branchRef}
                  onChange={(e) => setBranchRef(e.target.value)}
                  placeholder="main"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Workflow Action */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Workflow Action Pipeline
              </label>
              <select
                value={currentWorkflow?.workflowId || ""}
                onChange={(e) => setSelectedWorkflow(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {availableWorkflows.map((w) => (
                  <option key={w.workflowId} value={w.workflowId}>
                    {w.workflowName} ({w.workflowId})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                {currentWorkflow?.description}
              </p>
            </div>

            {/* Dynamic Inputs (e.g. tag_name) */}
            {currentWorkflow?.inputs?.some((i) => i.name === "tag_name") && (
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">
                  Release Tag Name (e.g. v0.6.2)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="v0.6.2"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            )}

            {/* Result Message */}
            {result && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-mono flex items-start space-x-2.5 ${
                  result.success
                    ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                    : "bg-rose-950/60 border-rose-800 text-rose-300"
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <span>{result.message}</span>
                  {result.success && (
                    <a
                      href={`https://github.com/RitualDev-Lab/${selectedRepo}/actions`}
                      target="_blank"
                      rel="noreferrer"
                      className="block mt-1 text-sky-400 hover:underline"
                    >
                      View Live Actions Runner Queue &rarr;
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isDispatching}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-medium text-xs font-mono transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isDispatching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching to GitHub Runners...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>Dispatch Workflow Execution</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Quick Preset Cards */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 backdrop-blur-md">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">
              Standard Release Profiles
            </h4>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-white">Poly Binary Compilation</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono">
                    Multi-Arch
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Bun-compiled native standalone binaries for x64/arm64.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-white">npm Public Pipeline</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 font-mono">
                    Scoped
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Transpiles TypeScript and publishes package to npm registry.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-white">Pages Edge Invalidation</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                    24/7 Edge
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Deploys Next.js static bundle to Fastly edge with SSL custom domain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Automated Multi-Channel Fleet Webhook Dispatcher (Discord & Telegram) */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base">
                  Automated Fleet Webhook Dispatcher (Discord & Telegram)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  Active Broker
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Centralized real-time notification engine. Listens to GitHub organization webhooks and dispatches
                formatted alerts when repos receive stars, forks, publish releases, or experience CI failures.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-800/80 text-amber-300 border border-slate-700/80 flex items-center space-x-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Stars & Forks</span>
            </span>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-800/80 text-sky-300 border border-slate-700/80 flex items-center space-x-1.5">
              <Rocket className="w-3.5 h-3.5 text-sky-400" />
              <span>Releases</span>
            </span>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-800/80 text-rose-300 border border-slate-700/80 flex items-center space-x-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>CI Alarms</span>
            </span>
          </div>
        </div>

        {/* Live Simulator & Webhook Tester */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>Interactive Event Tester & Channel Delivery</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                  Event Trigger
                </label>
                <select
                  value={testEventType}
                  onChange={(e) => setTestEventType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="star">⭐ New Repository Star</option>
                  <option value="fork">🍴 New Repository Fork</option>
                  <option value="release">🚀 Release Workflow Finished</option>
                  <option value="ci_failure">🚨 CI Failure (38 Repos)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                  Target Repository
                </label>
                <select
                  value={testRepo}
                  onChange={(e) => setTestRepo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="poly">RitualDev-Lab/poly</option>
                  <option value="DevShelf">RitualDev-Lab/DevShelf</option>
                  <option value="MCPShelf">RitualDev-Lab/MCPShelf</option>
                  <option value="AgentShield">RitualDev-Lab/AgentShield</option>
                  <option value="mission-control">RitualDev-Lab/mission-control</option>
                  <option value="mcp-monetize">RitualDev-Lab/mcp-monetize</option>
                  <option value="poly-cloud-api">RitualDev-Lab/poly-cloud-api</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-slate-400">
                Discord Webhook URL (Optional for live delivery)
              </label>
              <input
                type="password"
                placeholder="https://discord.com/api/webhooks/..."
                value={customDiscordUrl}
                onChange={(e) => setCustomDiscordUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Telegram Bot Token
                </label>
                <input
                  type="password"
                  placeholder="123456:ABC-DEF1234..."
                  value={customTelegramToken}
                  onChange={(e) => setCustomTelegramToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Telegram Chat ID
                </label>
                <input
                  type="text"
                  placeholder="-100123456789"
                  value={customTelegramChatId}
                  onChange={(e) => setCustomTelegramChatId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {simResult && (
              <div
                className={`p-3 rounded-xl border text-xs font-mono flex items-start space-x-2 ${
                  simResult.success
                    ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
                    : "bg-rose-950/60 border-rose-800 text-rose-300"
                }`}
              >
                {simResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                )}
                <span>{simResult.message}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleTestDispatch}
              disabled={isSimulating}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs font-mono transition-all border border-slate-700 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  <span>Transmitting Dispatch Event...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span>Dispatch Simulated Test Alert</span>
                </>
              )}
            </button>
          </div>

          {/* Live Preview Pane */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>Real-Time Channel Payload Preview</span>
            </h4>

            {/* Discord Simulated Embed */}
            <div className="rounded-xl bg-[#2b2d31] border border-slate-700/80 p-4 font-sans text-xs space-y-2">
              <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                <span className="font-bold text-white">RitualDev Fleet Radar</span>
                <span className="bg-[#5865F2] text-white text-[9px] px-1 py-0.2 rounded font-mono">
                  BOT
                </span>
                <span>Today at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>

              <div
                className={`p-3 rounded-lg border-l-4 bg-[#1e1f22] space-y-2 ${
                  testEventType === "star"
                    ? "border-amber-400"
                    : testEventType === "fork"
                    ? "border-purple-400"
                    : testEventType === "release"
                    ? "border-emerald-400"
                    : "border-rose-500"
                }`}
              >
                <div className="font-bold text-white text-sm">
                  {formatDiscordPayload(getMockEvent()).embeds[0].title}
                </div>
                <div className="text-slate-300 text-xs">
                  {formatDiscordPayload(getMockEvent()).embeds[0].description}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[11px]">
                  {formatDiscordPayload(getMockEvent()).embeds[0].fields?.slice(0, 2).map((f) => (
                    <div key={f.name}>
                      <span className="text-slate-400 font-semibold block">{f.name}</span>
                      <span className="text-slate-200">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Telegram Simulated Preview */}
            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 font-mono text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] pb-1 border-b border-slate-800">
                <span>Telegram Bot Output (HTML Mode)</span>
                <span className="text-sky-400">@RitualDevFleetBot</span>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200 pt-1">
                {formatTelegramMessage(getMockEvent()).replace(/<[^>]+>/g, "")}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
