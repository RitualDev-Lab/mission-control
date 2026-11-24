"use client";

import type {
  GitHubBinaryMetrics,
  NpmPackageMetrics,
  OpenVsxMetrics,
  PackageManagerDistribution,
  PyPiPackageMetrics,
  RepoTrafficData,
  TrafficPath,
  TrafficReferrer,
} from "@/lib/types";
import {
  Activity,
  Check,
  Coffee,
  Copy,
  Download,
  ExternalLink,
  Eye,
  GitBranch,
  Globe,
  HardDrive,
  Layers,
  Monitor,
  Package,
  Puzzle,
  Share2,
  Terminal,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

interface EcosystemTabProps {
  npmPackages: NpmPackageMetrics[];
  pypiPackages?: PyPiPackageMetrics[];
  distributions?: PackageManagerDistribution[];
  trafficData?: RepoTrafficData[];
  trafficReferrers?: TrafficReferrer[];
  trafficPaths?: TrafficPath[];
  openVsx: OpenVsxMetrics[];
  binaries: GitHubBinaryMetrics[];
}

export function EcosystemTab({
  npmPackages,
  pypiPackages = [],
  distributions = [],
  trafficData = [],
  trafficReferrers = [],
  trafficPaths = [],
  openVsx,
  binaries,
}: EcosystemTabProps) {
  // Selected npm package for 30-day velocity
  const [selectedPkg, setSelectedPkg] = useState<string>(npmPackages[0]?.package || "");
  // Selected repo for 14-day traffic & clones
  const [selectedTrafficRepo, setSelectedTrafficRepo] = useState<string>("all");
  const [trafficMetricMode, setTrafficMetricMode] = useState<"clones" | "views" | "overlay">("overlay");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const activePackage = npmPackages.find((p) => p.package === selectedPkg) || npmPackages[0];
  const history = activePackage?.history || [];
  const maxDownload = Math.max(...history.map((h) => h.downloads), 10);

  // Calculate Org-Wide Combined Traffic
  const orgTotalClones = trafficData.reduce((acc, t) => acc + t.totalClones, 0);
  const orgTotalUniqueCloners = trafficData.reduce((acc, t) => acc + t.uniqueCloners, 0);
  const orgTotalViews = trafficData.reduce((acc, t) => acc + t.totalViews, 0);
  const orgTotalUniqueViewers = trafficData.reduce((acc, t) => acc + t.uniqueViewers, 0);

  // Active Traffic Repo or Combined
  const isAllSelected = selectedTrafficRepo === "all";
  const activeTraffic = isAllSelected
    ? {
        repo: "All Repos Combined",
        totalClones: orgTotalClones,
        uniqueCloners: orgTotalUniqueCloners,
        totalViews: orgTotalViews,
        uniqueViewers: orgTotalUniqueViewers,
        clonesHistory: trafficData[0]?.clonesHistory || [],
        viewsHistory: trafficData[0]?.viewsHistory || [],
        referrers: trafficReferrers,
        paths: trafficPaths,
      }
    : trafficData.find((t) => t.repo === selectedTrafficRepo) || trafficData[0];

  const clonesList = activeTraffic?.clonesHistory || [];
  const viewsList = activeTraffic?.viewsHistory || [];
  const maxClones = Math.max(...clonesList.map((c) => c.count), 5);
  const maxViews = Math.max(...viewsList.map((v) => v.count), 5);

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Compute total downloads by OS for binaries
  const osTotals = {
    windows: 0,
    mac: 0,
    linux: 0,
  };

  binaries.forEach((b) => {
    b.assets.forEach((a) => {
      if (a.platform === "windows") osTotals.windows += a.downloadCount;
      if (a.platform === "mac") osTotals.mac += a.downloadCount;
      if (a.platform === "linux") osTotals.linux += a.downloadCount;
    });
  });

  return (
    <div className="space-y-8">
      {/* 1. Multi-Registry Distribution Channels (Homebrew, Scoop, npm, PyPI, Open VSX, Releases) */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">
            Multi-Registry Distribution Channels (6 Active Channels)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {distributions.map((dist) => (
            <div
              key={dist.name}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">{dist.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                      {dist.targetPlatform}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono font-semibold">
                    {dist.badge}
                  </span>
                </div>

                <div className="flex items-baseline space-x-3 my-2">
                  <div className="text-2xl font-bold font-mono text-white">
                    {dist.totalInstalls.toLocaleString()}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {dist.uniqueUsers.toLocaleString()} unique developers
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400 truncate mb-1">
                  Package: <strong className="text-slate-200">{dist.package}</strong>
                </div>
              </div>

              {/* Install command copy pill */}
              <div className="pt-2 border-t border-slate-800/60">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                  <span className="truncate pr-2">$ {dist.installCommand}</span>
                  <button
                    onClick={() => handleCopy(dist.installCommand)}
                    className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Copy install command"
                  >
                    {copiedCmd === dist.installCommand ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. GitHub Visitors & Multi-Repo Traffic Radar */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">
                GitHub 14-Day Visitor Velocity & Traffic Radar
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Live telemetry aggregated from Git CLI clones and web page visits for:{" "}
              <strong className="text-emerald-300">{activeTraffic?.repo}</strong>
            </p>
          </div>

          {/* Repo Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedTrafficRepo("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedTrafficRepo === "all"
                  ? "bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20"
                  : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              All Repos ({orgTotalClones.toLocaleString()})
            </button>
            {trafficData.map((t) => (
              <button
                key={t.repo}
                onClick={() => setSelectedTrafficRepo(t.repo)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  selectedTrafficRepo === t.repo
                    ? "bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20"
                    : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {t.repo} ({t.totalClones})
              </button>
            ))}
          </div>
        </div>

        {/* Aggregate KPI Summary for Selected Repo */}
        {activeTraffic && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 font-mono text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">14-Day Git Clones</span>
              <span className="text-xl font-bold text-emerald-400">
                {activeTraffic.totalClones.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Unique Dev Cloners</span>
              <span className="text-xl font-bold text-white">
                {activeTraffic.uniqueCloners.toLocaleString()} devs
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">14-Day Page Views</span>
              <span className="text-xl font-bold text-sky-400">
                {activeTraffic.totalViews.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Unique Web Visitors</span>
              <span className="text-xl font-bold text-white">
                {activeTraffic.uniqueViewers.toLocaleString()} visitors
              </span>
            </div>
          </div>
        )}

        {/* Interactive Sparkline Metric Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setTrafficMetricMode("overlay")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                trafficMetricMode === "overlay"
                  ? "bg-indigo-500 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ⚡ Dual Clones & Views Overlay
            </button>
            <button
              onClick={() => setTrafficMetricMode("clones")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                trafficMetricMode === "clones"
                  ? "bg-emerald-500 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📥 Git Clones ({activeTraffic?.totalClones || 0})
            </button>
            <button
              onClick={() => setTrafficMetricMode("views")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                trafficMetricMode === "views"
                  ? "bg-sky-500 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              👁️ Web Visitors ({activeTraffic?.totalViews || 0})
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400">
            {trafficMetricMode === "clones" && (
              <span>Peak: <strong className="text-emerald-400">{maxClones} clones</strong>/day</span>
            )}
            {trafficMetricMode === "views" && (
              <span>Peak: <strong className="text-sky-400">{maxViews} views</strong>/day</span>
            )}
            {trafficMetricMode === "overlay" && (
              <span>Comparing <strong className="text-emerald-400">Clones</strong> & <strong className="text-sky-400">Page Views</strong></span>
            )}
          </div>
        </div>

        {/* 14-Day Time Series Visual Chart */}
        {(trafficMetricMode === "clones" ? clonesList.length : viewsList.length > 0 ? viewsList.length : clonesList.length) > 0 ? (
          <div className="h-44 w-full flex items-end space-x-1 sm:space-x-2 pt-4">
            {(trafficMetricMode === "views" ? (viewsList.length > 0 ? viewsList : clonesList) : clonesList).map((pt, idx) => {
              const viewPt = viewsList[idx] || { count: 0, uniques: 0 };
              const dateLabel = pt.timestamp.split("T")[0].slice(5);

              if (trafficMetricMode === "views") {
                const heightPct = Math.max((pt.count / maxViews) * 100, 5);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-white pointer-events-none z-20 whitespace-nowrap shadow-xl">
                      <span className="text-slate-400">{dateLabel}:</span>{" "}
                      <strong className="text-sky-400">{pt.count} views</strong> ({pt.uniques} unique visitors)
                    </div>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full rounded-t-sm bg-gradient-to-t from-sky-600/30 to-sky-400 group-hover:from-sky-500 group-hover:to-sky-300 transition-all"
                    />
                    <span className="text-[9px] font-mono text-slate-500 mt-2 truncate w-full text-center">
                      {dateLabel}
                    </span>
                  </div>
                );
              }

              if (trafficMetricMode === "overlay") {
                const cloneHeight = Math.max((pt.count / Math.max(maxClones, 1)) * 100, 5);
                const viewHeight = Math.max((viewPt.count / Math.max(maxViews, 1)) * 100, 5);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-white pointer-events-none z-20 whitespace-nowrap shadow-xl">
                      <span className="text-slate-400">{dateLabel}:</span>{" "}
                      <span className="text-emerald-400 font-bold">{pt.count} clones</span> •{" "}
                      <span className="text-sky-400 font-bold">{viewPt.count} views</span>
                    </div>
                    <div className="w-full flex items-end space-x-0.5 h-full">
                      <div
                        style={{ height: `${cloneHeight}%` }}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-600/40 to-emerald-400 group-hover:from-emerald-500"
                        title={`${pt.count} clones`}
                      />
                      <div
                        style={{ height: `${viewHeight}%` }}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-sky-600/40 to-sky-400 group-hover:from-sky-500"
                        title={`${viewPt.count} views`}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-2 truncate w-full text-center">
                      {dateLabel}
                    </span>
                  </div>
                );
              }

              // Default "clones"
              const heightPct = Math.max((pt.count / maxClones) * 100, 5);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-white pointer-events-none z-20 whitespace-nowrap shadow-xl">
                    <span className="text-slate-400">{dateLabel}:</span>{" "}
                    <strong className="text-emerald-400">{pt.count} clones</strong> ({pt.uniques} unique devs)
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full rounded-t-sm bg-gradient-to-t from-emerald-600/30 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300 transition-all"
                  />
                  <span className="text-[9px] font-mono text-slate-500 mt-2 truncate w-full text-center">
                    {dateLabel}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-36 flex items-center justify-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No telemetry recorded in the last 14 days for this repository.
          </div>
        )}

        {/* 2b. Referrers & Visited Paths Intelligence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/60">
          {/* Top Referrers */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-white text-xs font-mono">
                Top Traffic Sources & Referring Sites ({trafficReferrers.length})
              </h4>
            </div>

            {trafficReferrers.length === 0 ? (
              <div className="text-xs font-mono text-slate-500">
                Awaiting referrer telemetry...
              </div>
            ) : (
              <div className="space-y-2">
                {trafficReferrers.slice(0, 5).map((ref, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-slate-900/60 border border-slate-800/60"
                  >
                    <span className="text-white font-semibold truncate">{ref.referrer}</span>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-emerald-400 font-bold">{ref.count} views</span>
                      <span className="text-slate-500">({ref.uniques} unique)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Visited Paths */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2">
              <Share2 className="w-4 h-4 text-sky-400" />
              <h4 className="font-bold text-white text-xs font-mono">
                Top Visited Content & Entry Pages ({trafficPaths.length})
              </h4>
            </div>

            {trafficPaths.length === 0 ? (
              <div className="text-xs font-mono text-slate-500">
                Awaiting visited path telemetry...
              </div>
            ) : (
              <div className="space-y-2">
                {trafficPaths.slice(0, 5).map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-slate-900/60 border border-slate-800/60"
                  >
                    <span className="text-slate-300 font-medium truncate max-w-xs">{p.path}</span>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-sky-400 font-bold">{p.count} views</span>
                      <span className="text-slate-500">({p.uniques} unique)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2c. Full Multi-Repo Traffic Ledger Table */}
        <div className="pt-4 border-t border-slate-800/60">
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
            Organization Multi-Repository Traffic Breakdown ({trafficData.length} Tracked Repos)
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5">Repository</th>
                  <th className="py-2.5 text-right">14-Day Views</th>
                  <th className="py-2.5 text-right">Unique Visitors</th>
                  <th className="py-2.5 text-right">14-Day Clones</th>
                  <th className="py-2.5 text-right">Unique Cloners</th>
                  <th className="py-2.5 text-right">Clone/View Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {trafficData.map((t) => {
                  const ratio = t.totalViews > 0 ? (t.totalClones / t.totalViews).toFixed(1) : "—";
                  return (
                    <tr
                      key={t.repo}
                      onClick={() => setSelectedTrafficRepo(t.repo)}
                      className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${
                        selectedTrafficRepo === t.repo ? "bg-slate-800/40" : ""
                      }`}
                    >
                      <td className="py-2.5 font-bold text-white flex items-center space-x-2">
                        <span>{t.repo}</span>
                        {t.repo === "DevShelf" && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                            High Traffic
                          </span>
                        )}
                        {t.repo === "AgentShield" && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800/40">
                            HN Viral
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-sky-400">
                        {t.totalViews.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right text-slate-400">
                        {t.uniqueViewers.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-400">
                        {t.totalClones.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right text-slate-300">
                        {t.uniqueCloners.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-400">
                        {ratio !== "—" ? `${ratio}x` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. npm 30-Day Velocity Chart */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-white text-base">
                npm 30-Day Daily Download Velocity
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Daily time-series curve for active package:{" "}
              <strong className="text-sky-300">{activePackage?.package}</strong>
            </p>
          </div>

          {/* Package Selector */}
          <div className="flex flex-wrap gap-1.5">
            {npmPackages.map((p) => (
              <button
                key={p.package}
                onClick={() => setSelectedPkg(p.package)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  selectedPkg === p.package
                    ? "bg-sky-500 text-white font-semibold shadow-lg shadow-sky-500/20"
                    : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {p.package.replace("@ritualdev-lab/", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Visual SVG Chart */}
        {history.length > 0 ? (
          <div className="h-44 w-full flex items-end space-x-1 sm:space-x-1.5 pt-4">
            {history.map((pt, idx) => {
              const heightPct = Math.max((pt.downloads / maxDownload) * 100, 4);
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center group relative h-full justify-end"
                >
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-mono text-white pointer-events-none z-20 whitespace-nowrap shadow-xl">
                    {pt.day}: <span className="text-sky-400 font-bold">{pt.downloads} dls</span>
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full rounded-t-sm bg-gradient-to-t from-sky-600/30 to-sky-400 group-hover:from-sky-500 group-hover:to-sky-300 transition-all"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-36 flex items-center justify-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl">
            Gathering time-series snapshots...
          </div>
        )}

        <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-3 pt-3 border-t border-slate-800/60">
          <span>{history[0]?.day || "30 days ago"}</span>
          <span className="text-slate-400">Peak: {maxDownload} downloads/day</span>
          <span>{history[history.length - 1]?.day || "Today"}</span>
        </div>
      </div>

      {/* 4. PyPI & Python Package Tracking Table */}
      {pypiPackages.length > 0 && (
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">
                PyPI & Python Package Registry (pypi.org / pypistats)
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
                {pypiPackages.length} Packages Live
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                {pypiPackages.reduce((acc, p) => acc + p.downloads.lastMonth, 0).toLocaleString()} DLs/mo
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5">Package</th>
                  <th className="py-2.5">Version</th>
                  <th className="py-2.5">Summary</th>
                  <th className="py-2.5 text-right">Last 24h</th>
                  <th className="py-2.5 text-right">Last 7d</th>
                  <th className="py-2.5 text-right">Last 30d</th>
                  <th className="py-2.5 text-right">Registry Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pypiPackages.map((pkg) => (
                  <tr key={pkg.package} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-bold text-amber-300">{pkg.package}</td>
                    <td className="py-3 text-slate-300">v{pkg.version}</td>
                    <td className="py-3 text-slate-400 font-sans truncate max-w-xs">
                      {pkg.summary}
                    </td>
                    <td className="py-3 text-right font-bold text-white">
                      {pkg.downloads.lastDay.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-bold text-sky-400">
                      {pkg.downloads.lastWeek.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-400">
                      {pkg.downloads.lastMonth.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <a
                        href={`https://pypi.org/project/${pkg.package}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:text-amber-300 inline-flex items-center space-x-1"
                      >
                        <span>pypi.org</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Packages Table & Binary OS Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Packages Table */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md">
          <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
            <Package className="w-5 h-5 text-sky-400" />
            <span>npm Registry Ingestion by Package</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5">Package</th>
                  <th className="py-2.5">Version</th>
                  <th className="py-2.5">License</th>
                  <th className="py-2.5 text-right">24h</th>
                  <th className="py-2.5 text-right">7 Days</th>
                  <th className="py-2.5 text-right">30 Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {npmPackages.map((pkg) => (
                  <tr key={pkg.package} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-semibold text-white">{pkg.package}</td>
                    <td className="py-3 text-slate-400">{pkg.latestVersion}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                        {pkg.license}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-300">{pkg.downloads.lastDay}</td>
                    <td className="py-3 text-right font-semibold text-sky-400">
                      {pkg.downloads.lastWeek}
                    </td>
                    <td className="py-3 text-right font-bold text-white">
                      {pkg.downloads.lastMonth.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Binary Downloads by OS */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base mb-1 flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-amber-400" />
              <span>Direct Native Binary Pulls</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Downloaded from GitHub Releases
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Windows (x64):</span>
                <span className="font-bold text-white">{osTotals.windows} downloads</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">macOS (x64/arm64):</span>
                <span className="font-bold text-white">{osTotals.mac} downloads</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Linux (x64/arm64):</span>
                <span className="font-bold text-white">{osTotals.linux} downloads</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Total Binary Ingest:</span>
            <span className="text-base font-bold text-amber-400">
              {binaries.reduce((acc, b) => acc + b.totalDownloads, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
