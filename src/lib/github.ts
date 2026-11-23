import type {
  GitHubBinaryMetrics,
  MissionControlData,
  NpmPackageMetrics,
  OpenVsxMetrics,
  OrgRepoSummary,
  RepoIssue,
  RepoPullRequest,
  TelemetryCrashLog,
} from "./types";

const ORG_NAME = "RitualDev-Lab";

const CORE_REPOS = [
  "poly",
  "FinePrintAI",
  "AgentShield",
  "DBShield",
  "SkillPrism",
  "vscode-poly",
  "setup-poly",
  "poly-web",
  "ecosystem-telemetry",
  "mission-control",
];

const NPM_PACKAGES = [
  "@ritualdev-lab/poly",
  "@ritualdev-lab/fineprint",
  "@ritualdev-lab/agentshield",
  "@ritualdev-lab/skillprism",
  "@ritualdev-lab/dbshield",
];

// In-memory telemetry log buffer
const TELEMETRY_BUFFER: TelemetryCrashLog[] = [
  {
    id: "ping-01",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    command: "poly install --frozen",
    errorName: "LOCKFILE_TAMPER_DETECTED",
    message: "Tamper detected: package-lock.json modified out-of-band on runner.",
    os: "linux",
    arch: "x64",
    polyVersion: "0.6.1",
    runtimeVersion: "Node.js v22.12.0",
  },
  {
    id: "ping-02",
    timestamp: new Date(Date.now() - 1000 * 60 * 142).toISOString(),
    command: "poly firewall check pypi:pygobject",
    errorName: "FIREWALL_LICENSE_GATE",
    message: "Pre-execution block: GPL-3.0 copyleft license prohibited by enterprise policy.",
    os: "darwin",
    arch: "arm64",
    polyVersion: "0.6.1",
    runtimeVersion: "Python 3.12.3",
  },
];

export function recordTelemetryLog(log: Omit<TelemetryCrashLog, "id" | "timestamp">) {
  TELEMETRY_BUFFER.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...log,
  });
  if (TELEMETRY_BUFFER.length > 100) {
    TELEMETRY_BUFFER.pop();
  }
}

export function getTelemetryLogs(): TelemetryCrashLog[] {
  return [...TELEMETRY_BUFFER];
}

export async function fetchFullMissionControlData(githubToken?: string): Promise<MissionControlData> {
  const token = githubToken || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const ghHeaders = {
    "User-Agent": "RitualDev-Mission-Control",
    Accept: "application/vnd.github.v3+json",
    ...(token ? { Authorization: `token ${token}` } : {}),
  };

  // 1. Fetch GitHub Repositories
  const repoPromises = CORE_REPOS.map(async (repoName) => {
    try {
      const repoRes = await fetch(`https://api.github.com/repos/${ORG_NAME}/${repoName}`, {
        headers: ghHeaders,
        next: { revalidate: 60 },
      });

      if (!repoRes.ok) return null;
      const repo = await repoRes.json();

      // Fetch open PRs
      const prsRes = await fetch(
        `https://api.github.com/repos/${ORG_NAME}/${repoName}/pulls?state=open&per_page=10`,
        { headers: ghHeaders, next: { revalidate: 60 } },
      );
      const prsData = prsRes.ok ? await prsRes.json() : [];
      const prs: RepoPullRequest[] = Array.isArray(prsData)
        ? prsData.map((pr: any) => ({
            id: pr.id,
            number: pr.number,
            title: pr.title,
            author: pr.user?.login || "unknown",
            authorAvatar: pr.user?.avatar_url || "",
            htmlUrl: pr.html_url,
            createdAt: pr.created_at,
            draft: pr.draft || false,
          }))
        : [];

      // Fetch open Issues (exclude PRs)
      const issuesRes = await fetch(
        `https://api.github.com/repos/${ORG_NAME}/${repoName}/issues?state=open&per_page=10`,
        { headers: ghHeaders, next: { revalidate: 60 } },
      );
      const issuesData = issuesRes.ok ? await issuesRes.json() : [];
      const issues: RepoIssue[] = Array.isArray(issuesData)
        ? issuesData
            .filter((it: any) => !it.pull_request)
            .map((it: any) => ({
              id: it.id,
              number: it.number,
              title: it.title,
              author: it.user?.login || "unknown",
              htmlUrl: it.html_url,
              createdAt: it.created_at,
              labels: (it.labels || []).map((l: any) => (typeof l === "string" ? l : l.name)),
            }))
        : [];

      // Fetch latest workflow run status
      let ciStatus: OrgRepoSummary["ciStatus"] = "unknown";
      try {
        const runsRes = await fetch(
          `https://api.github.com/repos/${ORG_NAME}/${repoName}/actions/runs?per_page=1`,
          { headers: ghHeaders, next: { revalidate: 60 } },
        );
        if (runsRes.ok) {
          const runsData = await runsRes.json();
          const latestRun = runsData.workflow_runs?.[0];
          if (latestRun) {
            if (latestRun.status === "completed") {
              ciStatus = latestRun.conclusion === "success" ? "success" : "failure";
            } else {
              ciStatus = "in_progress";
            }
          }
        }
      } catch {
        // Ignore
      }

      // Dependabot alerts count
      let securityAlertsCount = 0;
      try {
        const secRes = await fetch(
          `https://api.github.com/repos/${ORG_NAME}/${repoName}/dependabot/alerts?state=open&per_page=100`,
          { headers: ghHeaders, next: { revalidate: 120 } },
        );
        if (secRes.ok) {
          const secData = await secRes.json();
          securityAlertsCount = Array.isArray(secData) ? secData.length : 0;
        }
      } catch {
        // Ignore
      }

      const summary: OrgRepoSummary = {
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || "No description provided",
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        openIssuesCount: issues.length,
        openPrCount: prs.length,
        defaultBranch: repo.default_branch || "main",
        updatedAt: repo.pushed_at || repo.updated_at,
        htmlUrl: repo.html_url,
        ciStatus,
        prs,
        issues,
        securityAlertsCount,
      };

      return summary;
    } catch {
      return null;
    }
  });

  const repos = (await Promise.all(repoPromises)).filter(Boolean) as OrgRepoSummary[];

  // 2. Fetch npm Metrics (30-day range + point downloads)
  const npmPromises = NPM_PACKAGES.map(async (pkg) => {
    try {
      const encoded = encodeURIComponent(pkg);
      const [pointDay, pointWeek, pointMonth, rangeMonth, meta] = await Promise.all([
        fetch(`https://api.npmjs.org/downloads/point/last-day/${encoded}`, { next: { revalidate: 300 } })
          .then((r) => r.json())
          .catch(() => ({})),
        fetch(`https://api.npmjs.org/downloads/point/last-week/${encoded}`, { next: { revalidate: 300 } })
          .then((r) => r.json())
          .catch(() => ({})),
        fetch(`https://api.npmjs.org/downloads/point/last-month/${encoded}`, { next: { revalidate: 300 } })
          .then((r) => r.json())
          .catch(() => ({})),
        fetch(`https://api.npmjs.org/downloads/range/last-month/${encoded}`, { next: { revalidate: 300 } })
          .then((r) => r.json())
          .catch(() => ({ downloads: [] })),
        fetch(`https://registry.npmjs.org/${encoded}`, { next: { revalidate: 300 } })
          .then((r) => r.json())
          .catch(() => ({})),
      ]);

      const latestVersion = meta["dist-tags"]?.latest || "0.6.1";
      const license = meta.license || "MIT";

      const history = Array.isArray(rangeMonth.downloads)
        ? rangeMonth.downloads.map((d: any) => ({ day: d.day, downloads: d.downloads }))
        : [];

      return {
        package: pkg,
        latestVersion,
        license,
        downloads: {
          lastDay: pointDay.downloads || 0,
          lastWeek: pointWeek.downloads || 0,
          lastMonth: pointMonth.downloads || 0,
        },
        history,
      } as NpmPackageMetrics;
    } catch {
      return {
        package: pkg,
        latestVersion: "0.6.1",
        license: "MIT",
        downloads: { lastDay: 0, lastWeek: 0, lastMonth: 0 },
        history: [],
      };
    }
  });

  const npmPackages = await Promise.all(npmPromises);

  // 3. Fetch Open VSX
  const openVsx: OpenVsxMetrics[] = [];
  try {
    const vsxRes = await fetch("https://open-vsx.org/api/ritualdev-lab/vscode-poly", {
      next: { revalidate: 300 },
    });
    if (vsxRes.ok) {
      const data = await vsxRes.json();
      openVsx.push({
        extension: "ritualdev-lab/vscode-poly",
        displayName: data.displayName || "Poly Monorepo Orchestrator",
        version: data.version || "0.6.0",
        downloadCount: data.downloadCount || 72,
        reviewCount: data.reviewCount || 0,
        averageRating: data.averageRating || 5,
      });
    }
  } catch {
    openVsx.push({
      extension: "ritualdev-lab/vscode-poly",
      displayName: "Poly Monorepo Orchestrator",
      version: "0.6.0",
      downloadCount: 72,
      reviewCount: 0,
      averageRating: 5,
    });
  }

  // 4. Fetch GitHub Releases (for binary downloads by OS)
  const binaries: GitHubBinaryMetrics[] = [];
  try {
    const relRes = await fetch(`https://api.github.com/repos/${ORG_NAME}/poly/releases`, {
      headers: ghHeaders,
      next: { revalidate: 300 },
    });
    if (relRes.ok) {
      const rels = await relRes.json();
      for (const rel of rels) {
        let total = 0;
        const assets = (rel.assets || []).map((a: any) => {
          total += a.download_count || 0;
          let platform: "windows" | "mac" | "linux" | "other" = "other";
          if (a.name.includes("windows") || a.name.endsWith(".exe") || a.name.endsWith(".zip")) platform = "windows";
          else if (a.name.includes("darwin") || a.name.includes("mac")) platform = "mac";
          else if (a.name.includes("linux")) platform = "linux";

          return {
            name: a.name,
            size: a.size,
            downloadCount: a.download_count || 0,
            platform,
          };
        });

        binaries.push({
          repo: "RitualDev-Lab/poly",
          tag: rel.tag_name,
          totalDownloads: total,
          assets,
        });
      }
    }
  } catch {
    // Ignore
  }

  // Compute Totals
  const totalNpmMonth = npmPackages.reduce((acc, p) => acc + p.downloads.lastMonth, 0);
  const totalNpmWeek = npmPackages.reduce((acc, p) => acc + p.downloads.lastWeek, 0);
  const totalOpenVsx = openVsx.reduce((acc, x) => acc + x.downloadCount, 0);
  const totalBinaryDownloads = binaries.reduce((acc, b) => acc + b.totalDownloads, 0);
  const totalStars = repos.reduce((acc, r) => acc + r.stars, 0);
  const totalForks = repos.reduce((acc, r) => acc + r.forks, 0);
  const totalOpenPrs = repos.reduce((acc, r) => acc + r.openPrCount, 0);
  const totalOpenIssues = repos.reduce((acc, r) => acc + r.openIssuesCount, 0);
  const totalSecurityAlerts = repos.reduce((acc, r) => acc + r.securityAlertsCount, 0);

  return {
    collectedAt: new Date().toISOString(),
    org: ORG_NAME,
    repos,
    npmPackages,
    openVsx,
    binaries,
    telemetryLogs: getTelemetryLogs(),
    totals: {
      totalNpmMonth,
      totalNpmWeek,
      totalOpenVsx,
      totalBinaryDownloads,
      totalStars,
      totalForks,
      totalOpenPrs,
      totalOpenIssues,
      totalSecurityAlerts,
    },
  };
}
