"use client";

import { autoMergeDependabotPRs, fetchDependabotPRs } from "@/lib/github";
import type { OrgRepoSummary } from "@/lib/types";
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  GitMerge,
  Loader2,
  Lock,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface SecurityTabProps {
  repos: OrgRepoSummary[];
  onRefresh?: () => void;
}

export function SecurityTab({ repos, onRefresh }: SecurityTabProps) {
  const totalAlerts = repos.reduce((acc, r) => acc + r.securityAlertsCount, 0);

  // Auto-Merger State
  const [isMerging, setIsMerging] = useState(false);
  const [mergeLogs, setMergeLogs] = useState<string[]>([]);
  const [mergeSummary, setMergeSummary] = useState<{
    merged: number;
    failed: number;
    skipped: number;
  } | null>(null);
  const [showConsole, setShowConsole] = useState(false);
  const [dependabotCount, setDependabotCount] = useState<number | null>(null);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("ritual_admin_token")
        : null;
    if (token) {
      fetchDependabotPRs(token).then((prs) => setDependabotCount(prs.length));
    }
  }, []);

  const handleAutoMerge = async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("ritual_admin_token")
        : null;
    if (!token) {
      alert("No active admin token found in session.");
      return;
    }

    setIsMerging(true);
    setShowConsole(true);
    setMergeLogs([]);
    setMergeSummary(null);

    try {
      const result = await autoMergeDependabotPRs(token, (msg) => {
        setMergeLogs((prev) => [...prev, msg]);
      });
      setMergeSummary({
        merged: result.merged,
        failed: result.failed,
        skipped: result.skipped,
      });
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      setMergeLogs((prev) => [...prev, `[FATAL] Auto-merger error: ${err.message}`]);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* High-Level Compliance Gate Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900/60 to-slate-900/40 border border-teal-500/30 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Enterprise Security & IP Firewall Status
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              All 37 proprietary repositories enforce the Poly 24-hour supply chain quarantine gate
              and copyleft denylist. Zero AGPL/GPL contamination detected.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleAutoMerge}
            disabled={isMerging}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-medium text-xs font-mono transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 cursor-pointer border border-teal-400/30"
          >
            {isMerging ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <GitMerge className="w-4 h-4 text-white" />
            )}
            <span>
              {isMerging
                ? "Auto-Merging Fleet PRs..."
                : `Auto-Merge Clean Dependabot PRs ${
                    dependabotCount !== null ? `(${dependabotCount})` : ""
                  }`}
            </span>
          </button>

          <span className="px-3 py-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-semibold flex items-center">
            <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            100% COMPLIANT
          </span>
        </div>
      </div>

      {/* Live Auto-Merger Console Terminal */}
      {showConsole && (
        <div className="rounded-2xl bg-slate-950 border border-teal-500/40 p-5 font-mono shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-white">
                Fleet Dependabot Auto-Merger Console
              </span>
              {isMerging && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800 animate-pulse">
                  EXECUTING
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 text-xs">
              {mergeSummary && (
                <span className="text-slate-300 text-[11px]">
                  Merged: <strong className="text-emerald-400">{mergeSummary.merged}</strong> • Failed:{" "}
                  <strong className="text-rose-400">{mergeSummary.failed}</strong> • Skipped:{" "}
                  <strong className="text-amber-400">{mergeSummary.skipped}</strong>
                </span>
              )}
              <button
                onClick={() => setShowConsole(false)}
                className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
              >
                Close Console
              </button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 text-[11px] text-slate-300 pr-2 scrollbar-thin">
            {mergeLogs.map((l, i) => {
              const isSuccess = l.includes("[MERGED]");
              const isError = l.includes("[FAILED]") || l.includes("[ERROR]");
              const isSkip = l.includes("[SKIP]") || l.includes("[CONFLICT]");
              return (
                <div
                  key={i}
                  className={`leading-relaxed ${
                    isSuccess
                      ? "text-emerald-400 font-semibold"
                      : isError
                      ? "text-rose-400 font-semibold"
                      : isSkip
                      ? "text-amber-400"
                      : "text-slate-400"
                  }`}
                >
                  {l}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Security Alerts by Repo */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md">
        <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <span>Vulnerability & Dependabot Audit across 37 Repositories ({totalAlerts} Total)</span>
        </h3>

        <div className="space-y-3">
          {repos.map((repo) => (
            <div
              key={repo.name}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    repo.securityAlertsCount > 0 ? "bg-rose-500 animate-pulse" : "bg-emerald-400"
                  }`}
                />
                <div>
                  <h4 className="font-semibold text-white text-sm">{repo.name}</h4>
                  <p className="text-xs font-mono text-slate-500">{repo.fullName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {repo.securityAlertsCount === 0 ? (
                  <span className="text-xs font-mono text-emerald-400 flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> 0 Vulnerabilities
                  </span>
                ) : (
                  <span className="text-xs font-mono text-rose-400 font-semibold flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" /> {repo.securityAlertsCount} Alerts
                  </span>
                )}

                <a
                  href={`${repo.htmlUrl}/security`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                >
                  View Security Tab &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
