"use client";

import type { GitHubBinaryMetrics, NpmPackageMetrics, OpenVsxMetrics } from "@/lib/types";
import { Download, ExternalLink, Layers, Monitor, Puzzle, TrendingUp } from "lucide-react";
import { useState } from "react";

interface EcosystemTabProps {
  npmPackages: NpmPackageMetrics[];
  openVsx: OpenVsxMetrics[];
  binaries: GitHubBinaryMetrics[];
}

export function EcosystemTab({ npmPackages, openVsx, binaries }: EcosystemTabProps) {
  const [selectedPkg, setSelectedPkg] = useState<string>(npmPackages[0]?.package || "");

  const activePackage = npmPackages.find((p) => p.package === selectedPkg) || npmPackages[0];
  const history = activePackage?.history || [];
  const maxDownload = Math.max(...history.map((h) => h.downloads), 10);

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
      {/* 30-Day Daily Download Sparkline / Chart */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-white text-base">30-Day Ingestion Velocity (Daily Downloads)</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Daily time-series curve for active package: <strong className="text-sky-300">{activePackage?.package}</strong>
            </p>
          </div>

          {/* Package Selector */}
          <div className="flex flex-wrap gap-1.5">
            {npmPackages.map((p) => (
              <button
                key={p.package}
                onClick={() => setSelectedPkg(p.package)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
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
          <div className="h-48 w-full flex items-end space-x-1 sm:space-x-1.5 pt-4">
            {history.map((pt, idx) => {
              const heightPct = Math.max((pt.downloads / maxDownload) * 100, 4);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
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
          <div className="h-48 flex items-center justify-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-xl">
            Gathering time-series snapshots...
          </div>
        )}

        <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-3 pt-3 border-t border-slate-800/60">
          <span>{history[0]?.day || "30 days ago"}</span>
          <span className="text-slate-400">Peak: {maxDownload} downloads/day</span>
          <span>{history[history.length - 1]?.day || "Today"}</span>
        </div>
      </div>

      {/* Package Registry Table */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md">
        <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
          <Download className="w-5 h-5 text-indigo-400" />
          <span>npm Registry Multi-Package Breakdown</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-3 font-semibold">Package Name</th>
                <th className="pb-3 font-semibold">Version</th>
                <th className="pb-3 font-semibold">License</th>
                <th className="pb-3 font-semibold text-right">Last 24 Hours</th>
                <th className="pb-3 font-semibold text-right">Last 7 Days</th>
                <th className="pb-3 font-semibold text-right">Last 30 Days</th>
                <th className="pb-3 font-semibold text-right">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {npmPackages.map((pkg) => (
                <tr key={pkg.package} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-medium text-white">{pkg.package}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-sky-400 border border-slate-700">
                      v{pkg.latestVersion}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{pkg.license}</td>
                  <td className="py-3 text-right">{pkg.downloads.lastDay.toLocaleString()}</td>
                  <td className="py-3 text-right font-semibold text-sky-300">
                    {pkg.downloads.lastWeek.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-bold text-white">
                    {pkg.downloads.lastMonth.toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    <a
                      href={`https://www.npmjs.com/package/${pkg.package}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-sky-400 inline-flex items-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VS Code & Standalone Binaries Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VS Code / Open VSX */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md">
          <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
            <Puzzle className="w-5 h-5 text-purple-400" />
            <span>IDE Extension Ecosystem</span>
          </h3>

          <div className="space-y-4">
            {openVsx.map((ext) => (
              <div
                key={ext.extension}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-white text-sm">{ext.displayName}</h4>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{ext.extension}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      v{ext.version}
                    </span>
                    <span className="text-xs text-amber-400">★★★★★</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-white">
                    {ext.downloadCount.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">Open VSX Installs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Standalone Binaries Platform Distribution */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md">
          <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span>Compiled Native Binaries by OS</span>
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-xs font-mono text-slate-400 block mb-1">Windows x64</span>
              <span className="text-2xl font-bold font-mono text-white">{osTotals.windows}</span>
              <span className="text-[10px] text-slate-500 block mt-1">.zip / .exe</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-xs font-mono text-slate-400 block mb-1">macOS (arm/x64)</span>
              <span className="text-2xl font-bold font-mono text-white">{osTotals.mac}</span>
              <span className="text-[10px] text-slate-500 block mt-1">.tar.gz</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-xs font-mono text-slate-400 block mb-1">Linux (arm/x64)</span>
              <span className="text-2xl font-bold font-mono text-white">{osTotals.linux}</span>
              <span className="text-[10px] text-slate-500 block mt-1">.tar.gz</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
