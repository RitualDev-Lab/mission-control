"use client";

import { closeIssueOrPr, fetchTriagerItems, mergeSinglePullRequest } from "@/lib/github";
import type { TriagerItem } from "@/lib/types";
import {
  AlertCircle,
  Archive,
  CheckCircle,
  Clock,
  ExternalLink,
  Filter,
  GitMerge,
  GitPullRequest,
  Inbox,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  Tag,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface TriagerTabProps {
  onRefresh?: () => void;
}

type FilterCategory = "all" | "prs" | "issues" | "dependabot" | "community" | "stale";
type SortOption = "newest" | "oldest" | "comments" | "updated";

export function TriagerTab({ onRefresh }: TriagerTabProps) {
  const [items, setItems] = useState<TriagerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>("all");
  const [selectedSort, setSelectedSort] = useState<SortOption>("newest");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadItems = async (isSync = false) => {
    if (isSync) setRefreshing(true);
    else setLoading(true);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("ritual_admin_token")
        : null;

    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const data = await fetchTriagerItems(token);
      setItems(data);
    } catch (err: any) {
      console.error("Failed to load triager items:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleMerge = async (item: TriagerItem) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("ritual_admin_token")
        : null;
    if (!token) return;

    setActionLoadingId(item.id);
    setActionNotice(null);

    const res = await mergeSinglePullRequest(token, item.repo, item.number);
    setActionNotice(res.message);
    setActionLoadingId(null);

    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (onRefresh) onRefresh();
    }
  };

  const handleClose = async (item: TriagerItem) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("ritual_admin_token")
        : null;
    if (!token) return;

    setActionLoadingId(item.id);
    setActionNotice(null);

    const res = await closeIssueOrPr(token, item.repo, item.number);
    setActionNotice(res.message);
    setActionLoadingId(null);

    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (onRefresh) onRefresh();
    }
  };

  // Filter and Sort
  const filteredItems = useMemo(() => {
    return items
      .filter((i) => {
        // Search
        const matchesSearch =
          i.title.toLowerCase().includes(search.toLowerCase()) ||
          i.repo.toLowerCase().includes(search.toLowerCase()) ||
          i.author.toLowerCase().includes(search.toLowerCase()) ||
          i.labels.some((l) => l.name.toLowerCase().includes(search.toLowerCase()));

        if (!matchesSearch) return false;

        // Category Filter
        if (selectedFilter === "prs") return i.isPR;
        if (selectedFilter === "issues") return !i.isPR;
        if (selectedFilter === "dependabot") return i.isDependabot;
        if (selectedFilter === "community") return !i.isDependabot;
        if (selectedFilter === "stale") return i.isStale;
        return true;
      })
      .sort((a, b) => {
        if (selectedSort === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (selectedSort === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (selectedSort === "comments") {
          return b.commentsCount - a.commentsCount;
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [items, search, selectedFilter, selectedSort]);

  const counts = {
    all: items.length,
    prs: items.filter((i) => i.isPR).length,
    issues: items.filter((i) => !i.isPR).length,
    dependabot: items.filter((i) => i.isDependabot).length,
    community: items.filter((i) => !i.isDependabot).length,
    stale: items.filter((i) => i.isStale).length,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-slate-900/40 border border-emerald-500/30 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Consolidated Fleet Issue & PR Triager</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Unified queue aggregating community bug reports, feature requests, and pull requests
              across all 37 repositories with 1-click triage and resolution.
            </p>
          </div>
        </div>

        <button
          onClick={() => loadItems(true)}
          disabled={refreshing}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-200 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${refreshing ? "animate-spin" : ""}`} />
          <span>Sync Queue</span>
        </button>
      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-sky-950/60 border border-sky-800 text-xs font-mono text-sky-300 flex items-center justify-between">
          <span>{actionNotice}</span>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              selectedFilter === "all"
                ? "bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            All Items ({counts.all})
          </button>
          <button
            onClick={() => setSelectedFilter("prs")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              selectedFilter === "prs"
                ? "bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Pull Requests ({counts.prs})
          </button>
          <button
            onClick={() => setSelectedFilter("issues")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              selectedFilter === "issues"
                ? "bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Issues ({counts.issues})
          </button>
          <button
            onClick={() => setSelectedFilter("dependabot")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              selectedFilter === "dependabot"
                ? "bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Dependabot Bot ({counts.dependabot})
          </button>
          <button
            onClick={() => setSelectedFilter("community")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              selectedFilter === "community"
                ? "bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Human / Community ({counts.community})
          </button>
          <button
            onClick={() => setSelectedFilter("stale")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              selectedFilter === "stale"
                ? "bg-amber-500 text-white font-semibold shadow-lg shadow-amber-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Stale &gt;14d ({counts.stale})
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter across items by title, repo, author, or label..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-mono text-slate-500">Sort:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as SortOption)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="comments">Most Comments</option>
              <option value="updated">Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Triager Items List */}
      {loading ? (
        <div className="p-12 text-center font-mono">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading consolidated organization items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center font-mono text-xs text-slate-500">
          No items match the selected filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-500 px-1">
            Showing {filteredItems.length} of {items.length} items
          </div>

          {filteredItems.map((item) => {
            const isLoadingThis = actionLoadingId === item.id;
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* PR or Issue Badge */}
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1 ${
                        item.isPR
                          ? "bg-purple-950 text-purple-300 border border-purple-800"
                          : "bg-sky-950 text-sky-300 border border-sky-800"
                      }`}
                    >
                      {item.isPR ? (
                        <>
                          <GitPullRequest className="w-3 h-3 mr-1" /> PR
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 mr-1" /> Issue
                        </>
                      )}
                    </span>

                    {/* Repo Pill */}
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-semibold">
                      {item.repo}
                    </span>

                    <span className="text-slate-500 font-mono">#{item.number}</span>

                    {item.isStale && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 text-[9px] font-semibold">
                        STALE ({item.ageDays}d)
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <a
                    href={item.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-sans font-semibold text-white text-sm hover:text-emerald-400 block truncate transition-colors"
                  >
                    {item.title}
                  </a>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>{item.author}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{item.ageDays === 0 ? "today" : `${item.ageDays}d ago`}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3 text-slate-500" />
                      <span>{item.commentsCount} comments</span>
                    </span>

                    {item.labels.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex flex-wrap gap-1">
                          {item.labels.slice(0, 3).map((lbl, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-300"
                            >
                              {lbl.name}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-2 shrink-0">
                  {item.isPR && (
                    <button
                      onClick={() => handleMerge(item)}
                      disabled={isLoadingThis}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-950"
                      title="Squash & Merge PR"
                    >
                      {isLoadingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <GitMerge className="w-3.5 h-3.5" />
                      )}
                      <span>Merge</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleClose(item)}
                    disabled={isLoadingThis}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800 border border-slate-800 text-slate-400 text-xs transition-colors cursor-pointer"
                    title={item.isPR ? "Close PR" : "Close Issue"}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={item.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Open on GitHub"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
