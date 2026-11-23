"use client";

import { Check, Copy, Download, FileText, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function BriefingTab() {
  const [briefing, setBriefing] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/briefing")
      .then((res) => res.json())
      .then((data) => {
        setBriefing(data.markdown || "No briefing available.");
        setLoading(false);
      })
      .catch(() => {
        setBriefing("Failed to load briefing.");
        setLoading(false);
      });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(briefing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([briefing], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RitualDev-Executive-Briefing-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">AI Executive Briefing & Board Summary</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Automated synthesis of multi-repo health, registry adoption & velocity
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors border border-slate-700 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Markdown"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-mono font-medium transition-colors shadow-lg shadow-sky-500/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .md</span>
          </button>
        </div>
      </div>

      {/* Rendered Briefing Content */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8 backdrop-blur-md">
        {loading ? (
          <div className="h-64 flex items-center justify-center font-mono text-xs text-slate-500">
            Synthesizing organization data...
          </div>
        ) : (
          <div className="font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap bg-slate-950/60 p-6 rounded-xl border border-slate-800/80 overflow-x-auto">
            {briefing}
          </div>
        )}
      </div>
    </div>
  );
}
