export interface OrgRepoSummary {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  openIssuesCount: number;
  openPrCount: number;
  defaultBranch: string;
  updatedAt: string;
  htmlUrl: string;
  isPrivate: boolean;
  language: string;
  category: "devtools" | "security" | "governance" | "infrastructure" | "mcp" | "other";
  ciStatus?: "success" | "failure" | "in_progress" | "unknown";
  latestCommit?: {
    message: string;
    author: string;
    date: string;
  };
  prs: RepoPullRequest[];
  issues: RepoIssue[];
  securityAlertsCount: number;
}

export interface RepoPullRequest {
  id: number;
  number: number;
  title: string;
  author: string;
  authorAvatar: string;
  htmlUrl: string;
  createdAt: string;
  draft: boolean;
}

export interface RepoIssue {
  id: number;
  number: number;
  title: string;
  author: string;
  htmlUrl: string;
  createdAt: string;
  labels: string[];
}

export interface NpmPackageMetrics {
  package: string;
  latestVersion: string;
  license: string;
  downloads: {
    lastDay: number;
    lastWeek: number;
    lastMonth: number;
  };
  history?: { day: string; downloads: number }[];
}

export interface OpenVsxMetrics {
  extension: string;
  displayName: string;
  version: string;
  downloadCount: number;
  reviewCount: number;
  averageRating: number;
}

export interface GitHubBinaryMetrics {
  repo: string;
  tag: string;
  totalDownloads: number;
  assets: {
    name: string;
    size: number;
    downloadCount: number;
    platform: "windows" | "mac" | "linux" | "other";
  }[];
}

export interface TelemetryCrashLog {
  id: string;
  timestamp: string;
  command: string;
  errorName: string;
  message: string;
  os: string;
  arch: string;
  polyVersion: string;
  runtimeVersion: string;
}

export interface MissionControlData {
  collectedAt: string;
  org: string;
  repos: OrgRepoSummary[];
  npmPackages: NpmPackageMetrics[];
  openVsx: OpenVsxMetrics[];
  binaries: GitHubBinaryMetrics[];
  telemetryLogs: TelemetryCrashLog[];
  totals: {
    totalNpmMonth: number;
    totalNpmWeek: number;
    totalOpenVsx: number;
    totalBinaryDownloads: number;
    totalStars: number;
    totalForks: number;
    totalOpenPrs: number;
    totalOpenIssues: number;
    totalSecurityAlerts: number;
    totalPublicRepos: number;
    totalPrivateRepos: number;
  };
}
