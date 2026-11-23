"use client";

import type {
  GitHubBinaryMetrics,
  MissionControlData,
  OrgActivityEvent,
  OrgRepoSummary,
  StargazerItem,
} from "@/lib/types";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  Flame,
  GitBranch,
  GitCommit,
  GitFork,
  GitPullRequest,
  Globe,
  Layers,
  MessageSquare,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useState } from "react";

interface AdminIntelligenceTabProps {
  data: MissionControlData;
}

export function AdminIntelligenceTab({ data }: AdminIntelligenceTabProps) {
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedRepoFilter, setSelectedRepoFilter] = useState<string>("all");

  const orgEvents = data.orgEvents || [];
  const stargazers = data.stargazers || [];
  const repos = data.repos || [];

  // Filter org events
  const filteredEvents = orgEvents.filter((ev) => {
    if (selectedEventType !== "all" && ev.type !== selectedEventType) return false;
    if (selectedRepoFilter !== "all" && ev.repo !== selectedRepoFilter) return false;
    return true;
  });

  // Calculate unique actors in events
  const uniqueActors = Array.from(new Set(orgEvents.map((e) => e.actor)));

  // Binary downloads
  const binaries = data.binaries || [];
  const totalBinaryDownloads = data.totals.totalBinaryDownloads || 0;

  return (
    <div className="space-y-8">
      {/* 1. Header & Live Telemetry Pill */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Activity className="w-6 h-6 text-sky-400" />
              <span>Organization Audit & Community Intelligence</span>
            </h2>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>Live GitHub Org Stream</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Real-time audit log of git commits, pull requests, stargazers, and release downloads across all 37 RitualDev-Lab repositories.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="https://github.com/orgs/RitualDev-Lab/people"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-all flex items-center space-x-1.5"
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Org Members</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </a>
          <a
            href="https://github.com/RitualDev-Lab"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono font-semibold transition-all flex items-center space-x-1.5 shadow-lg shadow-sky-500/20"
          >
            <span>GitHub Org</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 2. Top Administrative Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stars */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Star className="w-16 h-16 text-amber-400" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Community Stargazers
          </span>
          <div className="text-3xl font-extrabold font-mono text-amber-300 mb-1">
            {data.totals.totalStars} Stars
          </div>
          <div className="text-xs font-mono text-slate-400">
            {stargazers.length} recent starrers tracked
          </div>
        </div>

        {/* Total Forks & Dependents */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <GitFork className="w-16 h-16 text-indigo-400" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Forks & Cloned Codebases
          </span>
          <div className="text-3xl font-extrabold font-mono text-indigo-300 mb-1">
            {data.totals.totalForks} Forks
          </div>
          <div className="text-xs font-mono text-slate-400">
            {data.totals.totalClones.toLocaleString()} git clones in 14d
          </div>
        </div>

        {/* Active Org Contributors */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="w-16 h-16 text-emerald-400" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Active Event Actors
          </span>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mb-1">
            {uniqueActors.length} Active
          </div>
          <div className="text-xs font-mono text-slate-400">
            Includes bots & maintainers
          </div>
        </div>

        {/* Binary Distribution */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Layers className="w-16 h-16 text-purple-400" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Poly Release Binaries
          </span>
          <div className="text-3xl font-extrabold font-mono text-purple-300 mb-1">
            {totalBinaryDownloads} Downloads
          </div>
          <div className="text-xs font-mono text-slate-400">
            Across Linux, macOS, & Windows
          </div>
        </div>
      </div>

      {/* 3. Community Stargazers Radar (Who is starring our repos) */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">
              Recent Community Stargazers ({stargazers.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Tracked across AgentShield, DevShelf, poly, & MCPShelf
          </span>
        </div>

        {stargazers.length === 0 ? (
          <div className="p-6 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No stargazers telemetry retrieved yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {stargazers.map((s, idx) => (
              <a
                key={idx}
                href={s.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col items-center text-center space-y-2 group"
              >
                <img
                  src={s.avatarUrl}
                  alt={s.user}
                  className="w-10 h-10 rounded-full border border-slate-700 group-hover:scale-105 transition-transform"
                />
                <div className="w-full truncate">
                  <div className="font-mono text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                    {s.user}
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-amber-400 border border-amber-900/40 font-mono mt-1 inline-block">
                    ★ {s.repo}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-500">
                  {new Date(s.starredAt).toLocaleDateString()}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* 4. Live Organization Audit Stream (GitHub Org Events) */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-white text-base">
                Organization Real-Time Activity & Audit Stream ({filteredEvents.length} Events)
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live event stream of git commits, issues, PR merges, comments, and actions across all 37 repos.
            </p>
          </div>

          {/* Event Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => setSelectedEventType("all")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedEventType === "all"
                  ? "bg-sky-600 text-white font-semibold"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setSelectedEventType("PushEvent")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedEventType === "PushEvent"
                  ? "bg-sky-600 text-white font-semibold"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              Pushes
            </button>
            <button
              onClick={() => setSelectedEventType("PullRequestEvent")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedEventType === "PullRequestEvent"
                  ? "bg-sky-600 text-white font-semibold"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              PRs
            </button>
            <button
              onClick={() => setSelectedEventType("IssueCommentEvent")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedEventType === "IssueCommentEvent"
                  ? "bg-sky-600 text-white font-semibold"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              }`}
            >
              Comments
            </button>
          </div>
        </div>

        {/* Audit Stream Table */}
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No events match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5">Actor</th>
                  <th className="py-2.5">Type</th>
                  <th className="py-2.5">Repository</th>
                  <th className="py-2.5">Activity Detail</th>
                  <th className="py-2.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <img
                          src={ev.actorAvatar}
                          alt={ev.actor}
                          className="w-5 h-5 rounded-full border border-slate-700"
                        />
                        <span className="font-semibold text-white">{ev.actor}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          ev.type === "PushEvent"
                            ? "bg-sky-950 text-sky-300 border border-sky-800/50"
                            : ev.type === "PullRequestEvent"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800/50"
                            : ev.type === "IssuesEvent"
                            ? "bg-purple-950 text-purple-300 border border-purple-800/50"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {ev.type.replace("Event", "")}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-sky-400">
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center space-x-1"
                      >
                        <span>{ev.repo}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    </td>
                    <td className="py-3 text-slate-300 max-w-md truncate font-sans text-xs">
                      {ev.detail}
                    </td>
                    <td className="py-3 text-right text-slate-500 whitespace-nowrap">
                      {new Date(ev.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
