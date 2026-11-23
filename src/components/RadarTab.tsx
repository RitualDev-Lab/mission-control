"use client";

import type { OrgRepoSummary, RepoIssue, RepoPullRequest } from "@/lib/types";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GitFork,
  GitPullRequest,
  Search,
  ShieldAlert,
  Star,
  XCircle,
} from "lucide-react";
import { useState } from "react";

interface RadarTabProps {
  repos: OrgRepoSummary[];
}

export function RadarTab({ repos }: RadarTabProps) {
  const [search, setSearch] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<OrgRepoSummary | null>(null);

  const filteredRepos = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter repositories..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span>Tracking {repos.length} Repositories</span>
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
                  <h3 className="font-semibold text-white group-hover:text-sky-400 transition-colors tracking-tight">
                    {repo.name}
                  </h3>
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
                    CI IDLE
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                {repo.description}
              </p>
            </div>

            {/* Metrics Footer */}
            <div>
              <div className="grid grid-cols-4 gap-2 py-2.5 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center font-mono text-[11px] mb-3">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Stars</span>
                  <span className="text-slate-200 font-semibold">{repo.stars}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">PRs</span>
                  <span className={repo.openPrCount > 0 ? "text-amber-400 font-semibold" : "text-slate-200"}>
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

      {/* Repository Detail Modal / Drawer */}
      {selectedRepo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span>{selectedRepo.name}</span>
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

            {/* Pending Pull Requests */}
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
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400 mb-3 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5 text-purple-400" />
                Open Issues ({selectedRepo.issues.length})
              </h4>
              {selectedRepo.issues.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center text-xs text-slate-500 font-mono">
                  Clean issue tracker — 0 open issues.
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
                        <span className="text-xs font-medium text-slate-200 group-hover:text-purple-400">
                          #{issue.number} {issue.title}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          {issue.labels.slice(0, 2).map((l, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400"
                            >
                              {l}
                            </span>
                          ))}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
