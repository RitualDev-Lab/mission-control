"use client";

import { BriefingTab } from "@/components/BriefingTab";
import { EcosystemTab } from "@/components/EcosystemTab";
import { FleetTab } from "@/components/FleetTab";
import { Header } from "@/components/Header";
import { KpiGrid } from "@/components/KpiGrid";
import { RadarTab } from "@/components/RadarTab";
import { SecurityTab } from "@/components/SecurityTab";
import { TelemetryTab } from "@/components/TelemetryTab";
import { TriagerTab } from "@/components/TriagerTab";
import { fetchFullMissionControlData } from "@/lib/github";
import type { MissionControlData } from "@/lib/types";
import {
  Activity,
  AlertTriangle,
  Calculator,
  Download,
  FileText,
  Inbox,
  KeyRound,
  Lock,
  Radio,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useEffect, useState } from "react";

type TabKey =
  | "radar"
  | "fleet"
  | "triager"
  | "security"
  | "ecosystem"
  | "telemetry"
  | "briefing"
  | "monetization";

export default function MissionControlDashboard() {
  const [data, setData] = useState<MissionControlData | null>(null);
  const [user, setUser] = useState<string>("divyanshujethi");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("radar");
  const [error, setError] = useState<string | null>(null);

  // Authentication State
  const [tokenInput, setTokenInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkAuthAndLoad = async (overrideToken?: string, isSync = false) => {
    if (isSync) setRefreshing(true);
    const token =
      overrideToken ||
      (typeof window !== "undefined" ? localStorage.getItem("ritual_admin_token") : null);

    if (!token) {
      setLoading(false);
      setIsAuthenticated(false);
      return;
    }

    try {
      // Verify token belongs to divyanshujethi or ritual-dev-git (or specifically provided ghp token)
      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!userRes.ok) {
        throw new Error("Invalid GitHub token or expired credentials.");
      }

      const userData = await userRes.json();
      const login = (userData.login || "").toLowerCase();
      // Authorized Superadmins: divyanshujethi and Ritual-Dev-Git
      const ALLOWED_LOGINS = ["divyanshujethi", "ritual-dev-git"];
      const isAllowed = ALLOWED_LOGINS.includes(login);

      if (!isAllowed) {
        throw new Error(
          `Unauthorized user (${userData.login}). Access restricted strictly to 'divyanshujethi' and RitualDev admin.`
        );
      }

      setUser(userData.login);
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("ritual_admin_token", token);
      }

      // Fetch All 37 Organization Repositories & Real Registry/Actions Telemetry
      const fullData = await fetchFullMissionControlData(token);
      setData(fullData);
      setError(null);
    } catch (err: any) {
      setAuthError(err.message || "Failed to authenticate with GitHub API.");
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setLoading(true);
    setAuthError(null);
    checkAuthAndLoad(tokenInput.trim());
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ritual_admin_token");
    }
    setIsAuthenticated(false);
    setData(null);
  };

  // If Not Authenticated -> Show Admin Login Screen
  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="relative">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-black/80">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 border border-sky-500/30 mb-4 shadow-inner">
                  <Terminal className="w-7 h-7 text-sky-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  RitualDev <span className="text-sky-400">Mission Control</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Executive Operations Cockpit (hq.ritualdev.in)
                </p>
              </div>

              <div className="mb-6 p-3.5 rounded-xl bg-sky-950/40 border border-sky-800/60 text-xs text-sky-300 flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Superadmin Protected Gate</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Restricted strictly to organization administrator <code className="text-sky-300 font-mono">divyanshujethi</code> and authorized RitualDev operations credentials.
                  </p>
                </div>
              </div>

              {authError && (
                <div className="mb-6 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 font-mono">
                    GitHub Personal Access Token (PAT)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                    />
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !tokenInput.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-xs transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Unlock Superadmin Cockpit</span>
                </button>
              </form>

              <div className="mt-8 text-center border-t border-slate-800/80 pt-4">
                <span className="text-[11px] text-slate-500 font-mono">
                  RitualDev Lab • 24/7 Edge Static Export
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h2 className="text-base font-bold text-white mb-2">Radar Query Error</h2>
          <p className="text-xs text-slate-400 mb-4">{error || "Unable to retrieve organization telemetry."}</p>
          <button
            onClick={() => checkAuthAndLoad(undefined, true)}
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
    { key: "fleet" as TabKey, label: "Release Dispatcher", icon: Rocket },
    { key: "triager" as TabKey, label: "Issue Triager", count: data.totals.totalOpenIssues, icon: Inbox },
    { key: "security" as TabKey, label: "Security & IP Gate", count: data.totals.totalSecurityAlerts, icon: ShieldCheck },
    { key: "ecosystem" as TabKey, label: "Registries & Downloads", count: data.totals.totalNpmMonth, icon: Download },
    { key: "telemetry" as TabKey, label: "Live CI & Telemetry", count: data.telemetryLogs.length, icon: Activity },
    { key: "monetization" as TabKey, label: "Revenue & Conversion", icon: Calculator },
    { key: "briefing" as TabKey, label: "AI Executive Briefing", icon: FileText },
  ];

  return (
    <div className="min-h-screen pb-16">
      {/* Top Header */}
      <Header
        user={user}
        onRefresh={() => checkAuthAndLoad(undefined, true)}
        onLogout={handleLogout}
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
          {activeTab === "fleet" && (
            <FleetTab
              repos={data.repos}
              onRefresh={() => checkAuthAndLoad(undefined, true)}
            />
          )}
          {activeTab === "triager" && (
            <TriagerTab onRefresh={() => checkAuthAndLoad(undefined, true)} />
          )}
          {activeTab === "security" && (
            <SecurityTab
              repos={data.repos}
              onRefresh={() => checkAuthAndLoad(undefined, true)}
            />
          )}
          {activeTab === "ecosystem" && (
            <EcosystemTab
              npmPackages={data.npmPackages}
              openVsx={data.openVsx}
              binaries={data.binaries}
            />
          )}
          {activeTab === "telemetry" && <TelemetryTab logs={data.telemetryLogs} />}
          {activeTab === "briefing" && <BriefingTab data={data} />}
          {activeTab === "monetization" && (
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8 backdrop-blur-md space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Ecosystem Monetization & Revenue Modeling</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Simulation based on {data.totals.totalNpmMonth.toLocaleString()} active monthly package downloads
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Conservative (1% Conversion)
                  </span>
                  <div className="text-3xl font-bold font-mono text-emerald-400 mb-2">
                    ${Math.round(data.totals.totalNpmMonth * 0.01 * 29).toLocaleString()}{" "}
                    <span className="text-xs text-slate-500 font-normal">/ month</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {Math.round(data.totals.totalNpmMonth * 0.01)} teams on Poly Cloud Team plan ($29/mo)
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 text-center border-sky-500/40 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-sky-500 text-slate-950 text-[10px] font-bold font-mono">
                    TARGET
                  </div>
                  <span className="text-xs font-mono text-sky-400 uppercase tracking-wider block mb-1">
                    Moderate (3% Conversion)
                  </span>
                  <div className="text-3xl font-bold font-mono text-white mb-2">
                    ${Math.round(data.totals.totalNpmMonth * 0.03 * 29).toLocaleString()}{" "}
                    <span className="text-xs text-slate-500 font-normal">/ month</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {Math.round(data.totals.totalNpmMonth * 0.03)} teams on Poly Cloud Team plan ($29/mo)
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                  <span className="text-xs font-mono text-purple-400 uppercase tracking-wider block mb-1">
                    Enterprise Tier (5% Conversion)
                  </span>
                  <div className="text-3xl font-bold font-mono text-purple-400 mb-2">
                    ${Math.round(data.totals.totalNpmMonth * 0.05 * 49).toLocaleString()}{" "}
                    <span className="text-xs text-slate-500 font-normal">/ month</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {Math.round(data.totals.totalNpmMonth * 0.05)} organizations on Enterprise Security plan ($49/mo)
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Direct Checkout Billing Endpoint:</span>
                <a
                  href="https://poly.ritualdev.in#cloud"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  https://poly.ritualdev.in#cloud &rarr;
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
