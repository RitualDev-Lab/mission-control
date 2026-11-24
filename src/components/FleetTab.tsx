"use client";

import { dispatchWorkflow } from "@/lib/github";
import type { OrgRepoSummary, WorkflowDispatchOption } from "@/lib/types";
import {
  AlertCircle,
  CheckCircle2,
  Cpu,
  ExternalLink,
  Layers,
  Loader2,
  Package,
  Play,
  Rocket,
  ShieldCheck,
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
    </div>
  );
}
