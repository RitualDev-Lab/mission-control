import type { TelemetryCrashLog } from "@/lib/types";
import { Activity, AlertOctagon, Bug, Cpu, Terminal } from "lucide-react";

interface TelemetryTabProps {
  logs: TelemetryCrashLog[];
}

export function TelemetryTab({ logs }: TelemetryTabProps) {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">Crash & Exception Rate</span>
            <Bug className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">0.02%</div>
          <span className="text-[11px] text-emerald-400 font-mono">99.98% Healthy Executions</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">Top User Platforms</span>
            <Cpu className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-sm font-mono text-white space-y-1 mt-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Linux x64:</span>
              <span className="text-sky-300 font-semibold">58%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">macOS arm64:</span>
              <span className="text-purple-300 font-semibold">27%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Windows x64:</span>
              <span className="text-amber-300 font-semibold">15%</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">Ingestion Endpoint</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xs font-mono text-slate-200 mt-2">
            <code className="p-1 rounded bg-slate-950 border border-slate-800 block truncate">
              POST /api/telemetry
            </code>
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-2 block">
            Listening for opt-in anonymous CLI pings
          </span>
        </div>
      </div>

      {/* Real-time Exception Feed */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md">
        <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-sky-400" />
          <span>Real-time CLI Telemetry & Crash Stream ({logs.length} Logged)</span>
        </h3>

        {logs.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-800 text-center font-mono text-xs text-slate-500">
            No runtime crashes or exceptions reported. CLI running smoothly across all nodes.
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold">
                      {log.errorName}
                    </span>
                    <span className="text-slate-300 font-semibold">$ {log.command}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-slate-400 text-xs mb-3 font-sans">{log.message}</p>

                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 border-t border-slate-800/60 pt-2">
                  <span>OS: <strong className="text-slate-300">{log.os} ({log.arch})</strong></span>
                  <span>•</span>
                  <span>Poly: <strong className="text-slate-300">v{log.polyVersion}</strong></span>
                  <span>•</span>
                  <span>Runtime: <strong className="text-slate-300">{log.runtimeVersion}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
