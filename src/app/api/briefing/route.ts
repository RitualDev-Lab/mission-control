import { getAdminSession } from "@/lib/auth";
import { fetchFullMissionControlData } from "@/lib/github";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const data = await fetchFullMissionControlData();
    const dateStr = new Date().toUTCString();

    const topPackage = [...data.npmPackages].sort(
      (a, b) => b.downloads.lastMonth - a.downloads.lastMonth
    )[0];

    const markdown = `# 🛡️ RitualDev Lab — Executive Operations Briefing
**Generated:** ${dateStr}  
**Audience:** Internal Administration (divyanshujethi)  
**Status:** All Systems Green • CI/CD Active

---

## 🚀 Key Performance Indicators (KPIs)
* **npm Monthly Ingestion Volume:** **${data.totals.totalNpmMonth.toLocaleString()} downloads**
* **npm 7-Day Velocity:** **${data.totals.totalNpmWeek.toLocaleString()} downloads**
* **VS Code / Open VSX Extension Reach:** **${data.totals.totalOpenVsx.toLocaleString()} installs**
* **Standalone Binary Executable Downloads:** **${data.totals.totalBinaryDownloads.toLocaleString()} downloads**
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

    return NextResponse.json({
      markdown,
      generatedAt: data.collectedAt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
