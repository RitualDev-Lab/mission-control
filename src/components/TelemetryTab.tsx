"use client";

import type { TelemetryCrashLog } from "@/lib/types";
import { Activity, AlertOctagon, Bug, CheckCircle2, Cpu, ExternalLink, Terminal, XCircle } from "lucide-react";
import { useState } from "react";

interface TelemetryTabProps {
  logs: TelemetryCrashLog[];
}

export function TelemetryTab({ logs }: TelemetryTabProps) {
  const [filter, setFilter] = useState<"all" | "failures" | "success">("all");

  const totalLogs = logs.length;
  const failureCount = logs.filter(
    (l) => l.errorName.includes("FAIL") || l.errorName.includes("ERR")
  ).length;
  const healthRate =
    totalLogs > 0
      ? (((totalLogs - failureCount) / totalLogs) * 100).toFixed(1)
      : "100.0";

  // Dynamic platform distribution from live logs
  const linuxLogs = logs.filter((l) => l.os === "linux").length;
  const macLogs = logs.filter((l) => l.os === "darwin" || l.os === "mac").length;
  const winLogs = logs.filter((l) => l.os === "windows").length;
  const totalOs = Math.max(linuxLogs + macLogs + winLogs, 1);
  const linuxPct = Math.round((linuxLogs / totalOs) * 100);
  const macPct = Math.round((macLogs / totalOs) * 100);
  const winPct = Math.max(0, 100 - linuxPct - macPct);

  const filteredLogs = logs.filter((l) => {
    const isFailed = l.errorName.includes("FAIL") || l.errorName.includes("ERR");
    if (filter === "failures") return isFailed;
    if (filter === "success") return !isFailed;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards (100% Real Live Computations) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">CI & Execution Health</span>
            <Bug className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{healthRate}%</div>
          <span className="text-[11px] text-emerald-400 font-mono">
            {totalLogs - failureCount} successful / {totalLogs} total workflow runs
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">Active Runner OS Matrix</span>
            <Cpu className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-sm font-mono text-white space-y-1 mt-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Linux Runners:</span>
              <span className="text-sky-300 font-semibold">{linuxPct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">macOS Runners:</span>
              <span className="text-purple-300 font-semibold">{macPct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Windows Runners:</span>
              <span className="text-amber-300 font-semibold">{winPct}%</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">Live Telemetry Ingest</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xs font-mono text-slate-200 mt-2">
            <code className="p-1 rounded bg-slate-950 border border-slate-800 block truncate text-sky-300">
              RitualDev-Lab/ecosystem-telemetry
            </code>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-2 block">
            GitHub Actions automated 6-hour cron active
          </span>
        </div>
      </div>

      {/* Real-time Exception & CI Feed */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-white text-base">
              Real-time CI Runs & Pipeline Telemetry ({filteredLogs.length})
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex space-x-1.5">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                filter === "all"
                  ? "bg-sky-500 text-white font-semibold"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilter("failures")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                filter === "failures"
                  ? "bg-rose-500 text-white font-semibold"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Failures ({failureCount})
            </button>
            <button
              onClick={() => setFilter("success")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono cursor-pointer transition-colors ${
                filter === "success"
                  ? "bg-emerald-500 text-white font-semibold"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              Success ({totalLogs - failureCount})
            </button>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800 text-center font-mono text-xs text-slate-500">
            No executions match the selected filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const isFailed = log.errorName.includes("FAIL") || log.errorName.includes("ERR");
              return (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded border text-[10px] font-bold flex items-center space-x-1 ${
                          isFailed
                            ? "bg-rose-950 text-rose-400 border-rose-800"
                            : "bg-emerald-950 text-emerald-400 border-emerald-800"
                        }`}
                      >
                        {isFailed ? <XCircle className="w-3 h-3 mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {log.errorName}
                      </span>
                      <span className="text-slate-200 font-semibold">$ {log.command}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs mb-3 font-sans leading-relaxed">{log.message}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 border-t border-slate-800/60 pt-2">
                    <div className="flex items-center space-x-2">
                      <span>OS: <strong className="text-slate-300">{log.os} ({log.arch})</strong></span>
                      <span>•</span>
                      <span>Tool: <strong className="text-slate-300">{log.polyVersion}</strong></span>
                      <span>•</span>
                      <span>Engine: <strong className="text-slate-300">{log.runtimeVersion}</strong></span>
                    </div>

                    {log.htmlUrl && (
                      <a
                        href={log.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:text-sky-300 inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <span>View Run Logs</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
