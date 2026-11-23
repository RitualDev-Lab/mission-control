"use client";

import { BriefingTab } from "@/components/BriefingTab";
import { EcosystemTab } from "@/components/EcosystemTab";
import { Header } from "@/components/Header";
import { KpiGrid } from "@/components/KpiGrid";
import { RadarTab } from "@/components/RadarTab";
import { SecurityTab } from "@/components/SecurityTab";
import { TelemetryTab } from "@/components/TelemetryTab";
import type { MissionControlData } from "@/lib/types";
import {
  Activity,
  AlertTriangle,
  Download,
  FileText,
  Layers,
  Radio,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TabKey = "radar" | "ecosystem" | "security" | "telemetry" | "briefing";

export default function MissionControlDashboard() {
  const router = useRouter();
  const [data, setData] = useState<MissionControlData | null>(null);
  const [user, setUser] = useState<string>("divyanshujethi");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("radar");
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    try {
      // 1. Verify session
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        router.push("/login");
        return;
      }
      const meData = await meRes.json();
      if (meData?.session?.user) {
        setUser(meData.session.user);
      }

      // 2. Fetch Radar
      const radarRes = await fetch("/api/radar");
      if (!radarRes.ok) {
        throw new Error("Failed to load telemetry radar.");
      }
      const radarData = await radarRes.json();
      setData(radarData);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load telemetry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 2 minutes
    const interval = setInterval(() => fetchData(false), 120000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center font-mono space-y-3">
          <div className="w-10 h-10 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 tracking-wider uppercase">Connecting to Mission Control Radar...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center font-mono">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-white mb-2">Connection Error</h2>
          <p className="text-xs text-slate-400 mb-4">{error || "Unable to retrieve organization telemetry."}</p>
          <button
            onClick={() => fetchData(true)}
            className="px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "radar" as TabKey, label: "Code Radar", count: data.repos.length, icon: Radio },
    { key: "ecosystem" as TabKey, label: "Registries & Downloads", count: data.totals.totalNpmMonth, icon: Download },
    { key: "security" as TabKey, label: "Security & IP Gate", count: data.totals.totalSecurityAlerts, icon: ShieldCheck },
    { key: "telemetry" as TabKey, label: "CLI Crashes & Pings", count: data.telemetryLogs.length, icon: Activity },
    { key: "briefing" as TabKey, label: "AI Executive Briefing", icon: FileText },
  ];

  return (
    <div className="min-h-screen pb-16">
      {/* Top Header */}
      <Header
        user={user}
        onRefresh={() => fetchData(true)}
        isRefreshing={refreshing}
        lastUpdated={data.collectedAt}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* KPI Grid */}
        <KpiGrid data={data} />

        {/* Navigation Tabs */}
        <div className="border-b border-slate-800">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-mono text-xs transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-slate-800/90 text-sky-400 border border-slate-700 shadow-lg shadow-sky-500/5 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-sky-400" : "text-slate-500"}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans ${
                        isActive
                          ? "bg-sky-950 text-sky-300 border border-sky-800/60"
                          : "bg-slate-800/80 text-slate-500"
                      }`}
                    >
                      {tab.count.toLocaleString()}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "radar" && <RadarTab repos={data.repos} />}
          {activeTab === "ecosystem" && (
            <EcosystemTab
              npmPackages={data.npmPackages}
              openVsx={data.openVsx}
              binaries={data.binaries}
            />
          )}
          {activeTab === "security" && <SecurityTab repos={data.repos} />}
          {activeTab === "telemetry" && <TelemetryTab logs={data.telemetryLogs} />}
          {activeTab === "briefing" && <BriefingTab />}
        </div>
      </main>
    </div>
  );
}
