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

export interface TriagerItem {
  id: number;
  number: number;
  title: string;
  repo: string;
  isPR: boolean;
  author: string;
  authorAvatar: string;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
  state: string;
  commentsCount: number;
  labels: { name: string; color: string }[];
  isDependabot: boolean;
  ageDays: number;
  isStale: boolean;
}

export interface WorkflowDispatchOption {
  repo: string;
  workflowId: string;
  workflowName: string;
  description: string;
  inputs?: {
    name: string;
    description: string;
    defaultValue?: string;
    required?: boolean;
  }[];
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

export interface WorkflowRunTelemetry {
  id: string;
  repo: string;
  name: string;
  headBranch: string;
  headSha: string;
  status: "completed" | "in_progress" | "queued";
  conclusion: "success" | "failure" | "cancelled" | "neutral" | null;
  createdAt: string;
  htmlUrl: string;
  event: string;
  runNumber: number;
}

export interface RepoTrafficSummary {
  viewsCount: number;
  uniquesCount: number;
  clonesCount: number;
  clonesUniques: number;
}

export interface TrafficReferrer {
  referrer: string;
  count: number;
  uniques: number;
}

export interface TrafficPath {
  path: string;
  title: string;
  count: number;
  uniques: number;
}

export interface OrgActivityEvent {
  id: string;
  type: string;
  actor: string;
  actorAvatar: string;
  repo: string;
  action?: string;
  createdAt: string;
  url?: string;
  detail?: string;
}

export interface StargazerItem {
  user: string;
  avatarUrl: string;
  repo: string;
  starredAt: string;
  profileUrl: string;
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
  htmlUrl?: string;
  status?: string;
}

export interface RepoTrafficData {
  repo: string;
  totalClones: number;
  uniqueCloners: number;
  totalViews: number;
  uniqueViewers: number;
  clonesHistory: { timestamp: string; count: number; uniques: number }[];
  viewsHistory: { timestamp: string; count: number; uniques: number }[];
  referrers?: TrafficReferrer[];
  paths?: TrafficPath[];
}

export interface PyPiPackageMetrics {
  package: string;
  version: string;
  summary: string;
  downloads: {
    lastDay: number;
    lastWeek: number;
    lastMonth: number;
  };
}

export interface PackageManagerDistribution {
  name: "Homebrew" | "Scoop" | "npm" | "PyPI" | "Open VSX" | "GitHub Releases";
  package: string;
  installCommand: string;
  totalInstalls: number;
  uniqueUsers: number;
  targetPlatform: "macOS / Linux" | "Windows" | "Node.js / Multi" | "Python" | "VS Code IDE" | "Native Multi-Arch";
  badge: string;
}

export interface PayingTeamAccount {
  id: string;
  customerId: string;
  teamName: string;
  email: string;
  plan: "Poly Cloud Team" | "Poly Enterprise Security";
  planAmount: 29 | 49;
  currency: string;
  status: "active" | "trialing" | "past_due" | "canceled";
  currentPeriodEnd: string;
  createdAt: string;
  seats: number;
  cacheHitRatio: number; // e.g. 88.4%
  bandwidthUsedGb: number; // e.g. 42.6 GB
  cachedArtifactsCount: number; // e.g. 18,420
  dodoLink?: string;
  stripeLink?: string;
}

export interface BillingWebhookEvent {
  id: string;
  type:
    | "subscription.created"
    | "subscription.active"
    | "subscription.updated"
    | "subscription.cancelled"
    | "payment.succeeded"
    | "payment.failed"
    | "customer.subscription.created"
    | "invoice.payment_succeeded";
  created: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  status: "processed" | "delivered" | "failed";
}

export interface CommercializationMetrics {
  provider: "dodo" | "sandbox";
  connected: boolean;
  environment?: "live" | "test";
  apiKeyMasked?: string;
  webhookUrl: string;
  webhookSecretConfigured: boolean;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Run Rate (MRR * 12)
  payingTeamsCount: number;
  activeSubscriptionsCount: number;
  trialingCount: number;
  churnRatePercent: number;
  netRevenueRetentionPercent: number;
  averageRevenuePerUser: number; // ARPU
  customerLifetimeValue: number; // LTV
  mrrGrowthMoM: number;
  teams: PayingTeamAccount[];
  recentWebhooks: BillingWebhookEvent[];
}

export interface MissionControlData {
  collectedAt: string;
  org: string;
  repos: OrgRepoSummary[];
  npmPackages: NpmPackageMetrics[];
  pypiPackages: PyPiPackageMetrics[];
  distributions: PackageManagerDistribution[];
  openVsx: OpenVsxMetrics[];
  binaries: GitHubBinaryMetrics[];
  telemetryLogs: TelemetryCrashLog[];
  workflowRuns: WorkflowRunTelemetry[];
  traffic: RepoTrafficSummary;
  trafficData: RepoTrafficData[];
  trafficReferrers?: TrafficReferrer[];
  trafficPaths?: TrafficPath[];
  orgEvents?: OrgActivityEvent[];
  stargazers?: StargazerItem[];
  billing?: CommercializationMetrics;
  totals: {
    totalNpmMonth: number;
    totalNpmWeek: number;
    totalPyPiMonth: number;
    totalOpenVsx: number;
    totalBinaryDownloads: number;
    totalStars: number;
    totalForks: number;
    totalOpenPrs: number;
    totalOpenIssues: number;
    totalSecurityAlerts: number;
    totalPublicRepos: number;
    totalPrivateRepos: number;
    totalClones: number;
    totalViews: number;
    totalUniqueVisitors: number;
    totalUniqueCloners: number;
  };
}
