"use client";

import type {
  GitHubBinaryMetrics,
  NpmPackageMetrics,
  OpenVsxMetrics,
  PackageManagerDistribution,
  PyPiPackageMetrics,
  RepoTrafficData,
} from "@/lib/types";
import {
  Activity,
  Check,
  Coffee,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  GitBranch,
  Layers,
  Monitor,
  Package,
  Puzzle,
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
  openVsx: OpenVsxMetrics[];
  binaries: GitHubBinaryMetrics[];
}

export function EcosystemTab({
  npmPackages,
  pypiPackages = [],
  distributions = [],
  trafficData = [],
  openVsx,
  binaries,
}: EcosystemTabProps) {
  // Selected npm package for 30-day velocity
  const [selectedPkg, setSelectedPkg] = useState<string>(npmPackages[0]?.package || "");
  // Selected repo for 14-day traffic & clones
  const [selectedTrafficRepo, setSelectedTrafficRepo] = useState<string>(
    trafficData[0]?.repo || "poly"
  );
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const activePackage = npmPackages.find((p) => p.package === selectedPkg) || npmPackages[0];
  const history = activePackage?.history || [];
  const maxDownload = Math.max(...history.map((h) => h.downloads), 10);

  // Active Traffic Repo
  const activeTraffic =
    trafficData.find((t) => t.repo === selectedTrafficRepo) || trafficData[0];
  const clonesList = activeTraffic?.clonesHistory || [];
  const maxClones = Math.max(...clonesList.map((c) => c.count), 5);

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

      {/* 2. 14-Day Clone & Visitor Velocity Curve (GitHub Traffic API) */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">
                14-Day Git Clone & Developer Visitor Velocity (GitHub Traffic API)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Live telemetry aggregated from Git CLI operations and web visits for:{" "}
              <strong className="text-emerald-300">{activeTraffic?.repo}</strong>
            </p>
          </div>

          {/* Repo Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
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
              <span className="text-slate-500 text-[10px] uppercase block">14-Day Clones</span>
              <span className="text-lg font-bold text-emerald-400">
                {activeTraffic.totalClones.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Unique Cloners</span>
              <span className="text-lg font-bold text-white">
                {activeTraffic.uniqueCloners.toLocaleString()} devs
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">14-Day Views</span>
              <span className="text-lg font-bold text-sky-400">
                {activeTraffic.totalViews.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Unique Visitors</span>
              <span className="text-lg font-bold text-white">
                {activeTraffic.uniqueViewers.toLocaleString()} visitors
              </span>
            </div>
          </div>
        )}

        {/* 14-Day Time Series SVG Chart */}
        {clonesList.length > 0 ? (
          <div className="h-44 w-full flex items-end space-x-1 sm:space-x-2 pt-4">
            {clonesList.map((pt, idx) => {
              const heightPct = Math.max((pt.count / maxClones) * 100, 5);
              const dateLabel = pt.timestamp.split("T")[0].slice(5);
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center group relative h-full justify-end"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-white pointer-events-none z-20 whitespace-nowrap shadow-xl">
                    <span className="text-slate-400">{dateLabel}:</span>{" "}
                    <strong className="text-emerald-400">{pt.count} clones</strong> (
                    {pt.uniques} unique)
                  </div>
                  {/* Bar */}
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
            No Git clones recorded in the last 14 days for this repository.
          </div>
        )}
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
                  {/* Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-mono text-white pointer-events-none z-20 whitespace-nowrap shadow-xl">
                    {pt.day}: <span className="text-sky-400 font-bold">{pt.downloads} dls</span>
                  </div>
                  {/* Bar */}
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
          <div className="flex items-center space-x-2 mb-4">
            <Package className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">
              PyPI & Python Package Registry (pypi.org / pypistats)
            </h3>
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
