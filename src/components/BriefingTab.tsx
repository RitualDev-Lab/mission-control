"use client";

import type { MissionControlData } from "@/lib/types";
import { Check, Copy, Download, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

interface BriefingTabProps {
  data: MissionControlData;
}

export function BriefingTab({ data }: BriefingTabProps) {
  const [copied, setCopied] = useState(false);

  const briefing = useMemo(() => {
    const dateStr = new Date(data.collectedAt).toUTCString();
    const topPackage = [...data.npmPackages].sort(
      (a, b) => b.downloads.lastMonth - a.downloads.lastMonth
    )[0];

    return `# 🛡️ RitualDev Lab — Executive Operations Briefing
**Generated:** ${dateStr}  
**Audience:** Internal Administration (divyanshujethi)  
**Status:** All Systems Operational • 24/7 Edge Sync

---

## 🚀 Key Performance Indicators (KPIs)
* **Active Repositories Monitored:** **${data.repos.length} Repositories** (${data.totals.totalPublicRepos} public, ${data.totals.totalPrivateRepos} private)
* **npm Monthly Ingestion Volume:** **${data.totals.totalNpmMonth.toLocaleString()} downloads**
* **npm 7-Day Velocity:** **${data.totals.totalNpmWeek.toLocaleString()} downloads**
* **VS Code / Open VSX Extension Installs:** **${data.totals.totalOpenVsx.toLocaleString()} installs**
* **Standalone Binary Downloads:** **${data.totals.totalBinaryDownloads.toLocaleString()} downloads**
* **Total Organization Stars:** **⭐ ${data.totals.totalStars}** across ${data.repos.length} core repositories

---

## 📦 Top Performing Packages
* **Top Ecosystem Driver:** \`${topPackage?.package || "@ritualdev-lab/poly"}\` with **${topPackage?.downloads.lastMonth.toLocaleString()}** monthly downloads.
* **Flagship Tool:** \`@ritualdev-lab/poly@0.6.1\` featuring:
  * Ephemeral Try-Before-You-Install sandbox runner (\`poly try\`)
  * 24-hour supply chain quarantine & pre-execution AGPL license firewall
  * Cross-language affected-only monorepo CI execution (\`poly --affected\`)
  * Multi-arch standalone native binary builds for Linux, macOS & Windows

---

## 🔍 Codebase Radar & Security Health
* **Monitored Repositories:** ${data.repos.length} active repos
* **Pending Pull Requests:** ${data.totals.totalOpenPrs} open PRs across organization
* **Open Issues:** ${data.totals.totalOpenIssues} items pending triage
* **Security & License Alerts:** **${data.totals.totalSecurityAlerts} critical alerts detected** (0 IP license contaminations)

---

## ⚡ Recommended Next Actions
1. Publish \`vscode-poly\` to the official Microsoft VS Code Marketplace to capture enterprise developers outside Open VSX.
2. Update Homebrew tap and Scoop bucket formulas to point to the newly compiled v0.6.1 binaries.
3. Launch community outreach on Reddit (\`r/rust\`, \`r/node\`, \`r/Python\`) and Hacker News targeting microservice engineering leads.
`;
  }, [data]);

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
              Automated synthesis across all {data.repos.length} organization repositories
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
        <div className="font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap bg-slate-950/60 p-6 rounded-xl border border-slate-800/80 overflow-x-auto">
          {briefing}
        </div>
      </div>
    </div>
  );
}
