"use client";

import type { OrgRepoSummary } from "@/lib/types";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Filter,
  GitFork,
  GitPullRequest,
  Lock,
  Search,
  ShieldAlert,
  Star,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

interface RadarTabProps {
  repos: OrgRepoSummary[];
}

type CategoryFilter =
  | "all"
  | "utilities"
  | "devtools"
  | "security"
  | "governance"
  | "infrastructure"
  | "mcp"
  | "private"
  | "other";

export function RadarTab({ repos }: RadarTabProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<"stars" | "prs" | "updated" | "issues">("stars");
  const [selectedRepo, setSelectedRepo] = useState<OrgRepoSummary | null>(null);

  const categories = [
    { key: "all" as CategoryFilter, label: "All Repos", count: repos.length },
    {
      key: "utilities" as CategoryFilter,
      label: "🧰 Utilities & Catalogs",
      count: repos.filter((r) => r.category === "utilities").length,
    },
    {
      key: "devtools" as CategoryFilter,
      label: "⚡ DevTools & Poly",
      count: repos.filter((r) => r.category === "devtools").length,
    },
    {
      key: "security" as CategoryFilter,
      label: "🛡️ AI Security",
      count: repos.filter((r) => r.category === "security").length,
    },
    {
      key: "governance" as CategoryFilter,
      label: "📜 Legal & FinePrint",
      count: repos.filter((r) => r.category === "governance").length,
    },
    {
      key: "infrastructure" as CategoryFilter,
      label: "🗄️ DB & Infra",
      count: repos.filter((r) => r.category === "infrastructure").length,
    },
    {
      key: "mcp" as CategoryFilter,
      label: "🧩 MCP & Shelf",
      count: repos.filter((r) => r.category === "mcp").length,
    },
    {
      key: "private" as CategoryFilter,
      label: "🔒 Private Core",
      count: repos.filter((r) => r.isPrivate).length,
    },
    {
      key: "other" as CategoryFilter,
      label: "🌐 Org & Core",
      count: repos.filter((r) => r.category === "other").length,
    },
  ];

  const filteredRepos = useMemo(() => {
    return repos
      .filter((r) => {
        const matchesSearch =
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.language.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (selectedCategory === "all") return true;
        if (selectedCategory === "private") return r.isPrivate;
        return r.category === selectedCategory;
      })
      .sort((a, b) => {
        if (sortBy === "stars") return b.stars - a.stars;
        if (sortBy === "prs") return b.openPrCount - a.openPrCount;
        if (sortBy === "issues") return b.openIssuesCount - a.openIssuesCount;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [repos, search, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 pb-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center space-x-1.5 cursor-pointer ${
              selectedCategory === cat.key
                ? "bg-sky-500 text-white font-semibold shadow-lg shadow-sky-500/20"
                : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans ${
                selectedCategory === cat.key ? "bg-sky-700 text-white" : "bg-slate-800 text-slate-500"
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Filter across ${repos.length} repositories by name, language, or keyword...`}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
          <span className="flex items-center text-slate-500">
            <Filter className="w-3.5 h-3.5 mr-1" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
          >
            <option value="stars">Most Stars</option>
            <option value="prs">Open PRs</option>
            <option value="issues">Open Issues</option>
            <option value="updated">Recent Activity</option>
          </select>
          <span className="text-slate-500">•</span>
          <span>Showing {filteredRepos.length} of {repos.length}</span>
        </div>
      </div>

      {/* Repos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRepos.map((repo) => (
          <div
            key={repo.name}
            onClick={() => setSelectedRepo(repo)}
            className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-5 hover:border-sky-500/40 transition-all cursor-pointer backdrop-blur-md group flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-white group-hover:text-sky-400 transition-colors tracking-tight truncate max-w-[180px]">
                    {repo.name}
                  </h3>
                  {repo.isPrivate && (
                    <span className="p-1 rounded bg-amber-950/60 border border-amber-800/60 text-amber-400 text-[10px]" title="Private Repository">
                      <Lock className="w-3 h-3" />
                    </span>
                  )}
                  <a
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* CI Status Badge */}
                {repo.ciStatus === "success" && (
                  <span className="flex items-center text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-medium">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                    CI PASS
                  </span>
                )}
                {repo.ciStatus === "failure" && (
                  <span className="flex items-center text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800/60 font-medium">
                    <XCircle className="w-3 h-3 mr-1 text-rose-400" />
                    CI FAIL
                  </span>
                )}
                {repo.ciStatus === "in_progress" && (
                  <span className="flex items-center text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800/60 font-medium animate-pulse">
                    CI RUNNING
                  </span>
                )}
                {repo.ciStatus === "unknown" && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {repo.language || "Code"}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                {repo.description}
              </p>
            </div>

            {/* Metrics Footer */}
            <div>
              <div className="grid grid-cols-5 gap-1.5 py-2 px-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center font-mono text-[11px] mb-3">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Stars</span>
                  <span className="text-slate-200 font-semibold">{repo.stars}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Forks</span>
                  <span className="text-slate-300 font-semibold">{repo.forks}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">PRs</span>
                  <span className={repo.openPrCount > 0 ? "text-amber-400 font-semibold" : "text-slate-400"}>
                    {repo.openPrCount}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Issues</span>
                  <span className={repo.openIssuesCount > 0 ? "text-slate-300 font-semibold" : "text-slate-400"}>
                    {repo.openIssuesCount}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Alerts</span>
                  <span className={repo.securityAlertsCount > 0 ? "text-rose-400 font-semibold" : "text-emerald-400"}>
                    {repo.securityAlertsCount}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Updated: {new Date(repo.updatedAt).toLocaleDateString()}</span>
                <span className="flex items-center text-sky-400 group-hover:translate-x-0.5 transition-transform">
                  View Drawer <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Repository Detail Drawer */}
      {selectedRepo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span>{selectedRepo.name}</span>
                  {selectedRepo.isPrivate && (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                      PRIVATE
                    </span>
                  )}
                  <a
                    href={selectedRepo.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-sky-400"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </h3>
                <p className="text-xs text-slate-400 mt-1">{selectedRepo.description}</p>
              </div>
              <button
                onClick={() => setSelectedRepo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* 5-Stat Quick Metrics Bar */}
            <div className="grid grid-cols-5 gap-2 py-2.5 px-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center font-mono text-xs mb-6">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Stars</span>
                <span className="text-white font-bold">{selectedRepo.stars}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Forks</span>
                <span className="text-slate-300 font-bold">{selectedRepo.forks}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">PRs</span>
                <span className={selectedRepo.openPrCount > 0 ? "text-amber-400 font-bold" : "text-slate-400 font-bold"}>
                  {selectedRepo.openPrCount}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Issues</span>
                <span className={selectedRepo.openIssuesCount > 0 ? "text-slate-200 font-bold" : "text-slate-400 font-bold"}>
                  {selectedRepo.openIssuesCount}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Alerts</span>
                <span className={selectedRepo.securityAlertsCount > 0 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                  {selectedRepo.securityAlertsCount}
                </span>
              </div>
            </div>

            {/* Pull Requests */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400 mb-3 flex items-center">
                <GitPullRequest className="w-4 h-4 mr-1.5 text-sky-400" />
                Open Pull Requests ({selectedRepo.prs.length})
              </h4>
              {selectedRepo.prs.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center text-xs text-slate-500 font-mono">
                  No open pull requests in this repository.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedRepo.prs.map((pr) => (
                    <a
                      key={pr.id}
                      href={pr.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 block transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-200 group-hover:text-sky-400">
                          #{pr.number} {pr.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          by {pr.author}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Open Issues */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400 mb-3 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5 text-amber-400" />
                Open Issues ({selectedRepo.issues.length})
              </h4>
              {selectedRepo.issues.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center text-xs text-slate-500 font-mono">
                  No open issues in this repository.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedRepo.issues.map((issue) => (
                    <a
                      key={issue.id}
                      href={issue.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 block transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-200 group-hover:text-amber-400">
                          #{issue.number} {issue.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          by {issue.author}
                        </span>
                      </div>
                      {issue.labels && issue.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {issue.labels.map((lbl) => (
                            <span key={lbl} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                              {lbl}
                            </span>
                          ))}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-slate-800 flex justify-between">
              <a
                href={`${selectedRepo.htmlUrl}/pulls`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono"
              >
                View PRs on GitHub &rarr;
              </a>
              <a
                href={`${selectedRepo.htmlUrl}/issues`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono"
              >
                View Issues on GitHub &rarr;
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
