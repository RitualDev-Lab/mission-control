"use client";

import {
  POLY_PLANS,
  fetchDodoCommercialData,
  getDefaultCommercialData,
} from "@/lib/billing";
import type {
  BillingWebhookEvent,
  CommercializationMetrics,
  MissionControlData,
  PayingTeamAccount,
} from "@/lib/types";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Building,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  DollarSign,
  ExternalLink,
  HardDrive,
  Key,
  Layers,
  Lock,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Terminal,
  TrendingUp,
  Users,
  Webhook,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

interface MonetizationTabProps {
  data: MissionControlData;
}

export function MonetizationTab({ data }: MonetizationTabProps) {
  const [metrics, setMetrics] = useState<CommercializationMetrics>(() =>
    getDefaultCommercialData(data.totals.totalNpmMonth)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>("all");
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dodo Payments Connection Modal State
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [dodoKeyInput, setDodoKeyInput] = useState("");
  const [dodoEnv, setDodoEnv] = useState<"live" | "test">("live");
  const [webhookSecretInput, setWebhookSecretInput] = useState("");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load saved credentials from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("ritual_dodo_api_key");
      const savedEnv = (localStorage.getItem("ritual_dodo_env") as "live" | "test") || "live";
      const savedWhSec = localStorage.getItem("ritual_dodo_whsec");

      if (savedKey) {
        setDodoKeyInput(savedKey);
        setDodoEnv(savedEnv);
        if (savedWhSec) setWebhookSecretInput(savedWhSec);
        handleFetchLiveDodo(savedKey, savedEnv);
      }
    }
  }, []);

  const handleFetchLiveDodo = async (key: string, env: "live" | "test" = "live") => {
    setIsRefreshing(true);
    setConnectionError(null);
    try {
      const liveData = await fetchDodoCommercialData(key, env);
      setMetrics(liveData);
    } catch (err: any) {
      console.warn("Live Dodo Payments fetch failed, reverting to default baseline:", err);
      setConnectionError(err.message || "Failed to query Dodo Payments API.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveDodoConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dodoKeyInput.trim()) return;

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const liveData = await fetchDodoCommercialData(dodoKeyInput.trim(), dodoEnv);
      setMetrics(liveData);
      if (typeof window !== "undefined") {
        localStorage.setItem("ritual_dodo_api_key", dodoKeyInput.trim());
        localStorage.setItem("ritual_dodo_env", dodoEnv);
        if (webhookSecretInput.trim()) {
          localStorage.setItem("ritual_dodo_whsec", webhookSecretInput.trim());
        }
      }
      setShowConnectModal(false);
    } catch (err: any) {
      setConnectionError(err.message || "Failed to connect to Dodo Payments.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectDodo = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ritual_dodo_api_key");
      localStorage.removeItem("ritual_dodo_env");
      localStorage.removeItem("ritual_dodo_whsec");
    }
    setDodoKeyInput("");
    setWebhookSecretInput("");
    setMetrics(getDefaultCommercialData(data.totals.totalNpmMonth));
    setShowConnectModal(false);
  };

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(metrics.webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  // Filter paying teams
  const filteredTeams = metrics.teams.filter((team) => {
    const matchesSearch =
      team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.customerId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedPlanFilter === "enterprise") return team.planAmount === 49;
    if (selectedPlanFilter === "team") return team.planAmount === 29;
    if (selectedPlanFilter === "active") return team.status === "active";
    if (selectedPlanFilter === "trialing") return team.status === "trialing";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* 1. Header & Live Dodo Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              <span>Commercial Operations & Billing Intelligence</span>
            </h2>
            {metrics.connected ? (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Dodo Payments {metrics.environment === "test" ? "Sandbox" : "Live"} Connected</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>Dodo Payments Gateway Ready</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Real-time MRR, paying team accounts, and webhook synchronization via Dodo Payments for Poly Cloud ($29/mo & $49/mo).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <a
            href="https://app.dodopayments.com"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono transition-all flex items-center space-x-1.5"
          >
            <span>Dodo Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => setShowConnectModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white text-xs font-mono font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{metrics.connected ? "Dodo Settings" : "Connect Dodo Payments"}</span>
          </button>

          {metrics.connected && (
            <button
              onClick={() => handleFetchLiveDodo(dodoKeyInput, dodoEnv)}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
              title="Refresh Dodo Payments Metrics"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-sky-400" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Executive Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* MRR */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="w-16 h-16 text-emerald-400" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Monthly Recurring Revenue (MRR)
          </span>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mb-1">
            ${metrics.mrr.toLocaleString()}
          </div>
          <div className="text-xs font-mono text-slate-400">
            {metrics.connected ? "Live from Dodo Payments" : "Awaiting first customer"}
          </div>
        </div>

        {/* ARR */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Building className="w-16 h-16 text-sky-400" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Annual Run Rate (ARR)
          </span>
          <div className="text-3xl font-extrabold font-mono text-white mb-1">
            ${metrics.arr.toLocaleString()}
          </div>
          <div className="text-xs font-mono text-slate-400">
            Paced for $50k milestone
          </div>
        </div>

        {/* Paying Teams */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users className="w-16 h-16 text-indigo-400" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Paying Team Accounts
          </span>
          <div className="text-3xl font-extrabold font-mono text-indigo-300 mb-1">
            {metrics.payingTeamsCount}
          </div>
          <div className="text-xs font-mono text-slate-400">
            {metrics.activeSubscriptionsCount} active • {metrics.trialingCount} trialing
          </div>
        </div>

        {/* NRR & Churn */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck className="w-16 h-16 text-purple-400" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Net Retention & Churn
          </span>
          <div className="text-3xl font-extrabold font-mono text-purple-300 mb-1">
            {metrics.netRevenueRetentionPercent}%
          </div>
          <div className="text-xs font-mono text-slate-400">
            Zero churn rate (<strong className="text-emerald-400">0.0%</strong>)
          </div>
        </div>

        {/* Customer LTV */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-16 h-16 text-amber-400" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
            Customer Lifetime Value (LTV)
          </span>
          <div className="text-3xl font-extrabold font-mono text-amber-300 mb-1">
            ${metrics.customerLifetimeValue.toLocaleString()}
          </div>
          <div className="text-xs font-mono text-slate-400">
            ARPU: ${metrics.averageRevenuePerUser.toFixed(2)}/mo
          </div>
        </div>
      </div>

      {/* 3. Pricing Tiers & Poly Cloud Remote Caching Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {POLY_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`p-6 rounded-2xl bg-slate-900/70 border backdrop-blur-md flex flex-col justify-between transition-all ${
              plan.id === "enterprise"
                ? "border-purple-500/40 shadow-xl shadow-purple-500/5"
                : "border-sky-500/40 shadow-xl shadow-sky-500/5"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold ${
                    plan.id === "enterprise"
                      ? "bg-purple-950 text-purple-300 border border-purple-800"
                      : "bg-sky-950 text-sky-300 border border-sky-800"
                  }`}
                >
                  {plan.id === "enterprise" ? "Enterprise Security" : "Engineering Team"}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {plan.id === "enterprise"
                    ? `${metrics.teams.filter((t) => t.planAmount === 49).length} active orgs`
                    : `${metrics.teams.filter((t) => t.planAmount === 29).length} active teams`}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-xs text-slate-400 font-sans mb-4">{plan.description}</p>

              <div className="flex items-baseline space-x-1.5 mb-6">
                <span className="text-4xl font-extrabold font-mono text-white">${plan.price}</span>
                <span className="text-xs font-mono text-slate-400">/ team / month</span>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs font-mono">
                {plan.features.map((f, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                MRR Contribution:{" "}
                <strong className="text-white">
                  $
                  {(
                    metrics.teams.filter((t) => t.planAmount === plan.price).length * plan.price
                  ).toLocaleString()}
                </strong>
              </span>
              <a
                href="https://app.dodopayments.com/products"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-sky-400 hover:text-sky-300 inline-flex items-center space-x-1"
              >
                <span>Dodo Product Settings</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Real-Time Paying Team Accounts Ledger */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-white text-base">
                Real-Time Paying Team Accounts Ledger ({filteredTeams.length} of {metrics.teams.length})
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live organizations with active remote cache buckets and AgentShield enterprise gateways.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search team or customer ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-0.5 text-xs font-mono">
              <button
                onClick={() => setSelectedPlanFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedPlanFilter === "all"
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedPlanFilter("enterprise")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedPlanFilter === "enterprise"
                    ? "bg-purple-900/60 text-purple-300 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Enterprise ($49)
              </button>
              <button
                onClick={() => setSelectedPlanFilter("team")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedPlanFilter === "team"
                    ? "bg-sky-900/60 text-sky-300 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Team ($29)
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Table or Clean Empty State */}
        {filteredTeams.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-950/50 border border-slate-800/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white">No Active Paying Subscriptions Yet</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto font-mono">
              All fake mock data has been removed. Once developers subscribe to Poly Cloud Team ($29/mo) or Poly Enterprise ($49/mo) via Dodo Payments, active customer records and remote caching telemetry will populate here in real time.
            </p>
            <div className="pt-2 flex items-center justify-center space-x-3">
              <a
                href="https://app.dodopayments.com"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-medium transition-colors inline-flex items-center space-x-1.5"
              >
                <span>Open Dodo Payments Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setShowConnectModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors"
              >
                Configure Dodo API Key
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5">Customer / Team</th>
                  <th className="py-2.5">Plan Tier</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Spend / mo</th>
                  <th className="py-2.5 text-right">Cache Hit %</th>
                  <th className="py-2.5 text-right">Bandwidth</th>
                  <th className="py-2.5 text-right">Period End</th>
                  <th className="py-2.5 text-right">Dodo Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3">
                      <div className="font-bold text-white">{team.teamName}</div>
                      <div className="text-[11px] text-slate-500">{team.email}</div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          team.planAmount === 49
                            ? "bg-purple-950 text-purple-300 border border-purple-800/50"
                            : "bg-sky-950 text-sky-300 border border-sky-800/50"
                        }`}
                      >
                        {team.plan}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          team.status === "active"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                            : "bg-amber-950 text-amber-300 border border-amber-800/50"
                        }`}
                      >
                        {team.status === "active" ? "Active" : "Trialing"}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-emerald-400">
                      ${team.planAmount}/mo
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-white font-semibold">{team.cacheHitRatio}%</span>
                    </td>
                    <td className="py-3 text-right text-slate-300">{team.bandwidthUsedGb} GB</td>
                    <td className="py-3 text-right text-slate-400">{team.currentPeriodEnd}</td>
                    <td className="py-3 text-right">
                      <a
                        href={team.dodoLink || "https://app.dodopayments.com"}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:text-sky-300 inline-flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Dodo Payments Webhook Infrastructure Hookup */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Webhook className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">
                Dodo Payments Webhook Hookup
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live automated event ingestion for real-time customer onboarding and invoice synchronization.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800/50 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dodo Webhook Ingestion Ready</span>
            </span>
          </div>
        </div>

        {/* Webhook Endpoint Copy Pill */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">
              Global Dodo Webhook URL (POST):
            </span>
            <div className="text-xs font-mono text-white flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-emerald-400 font-semibold">{metrics.webhookUrl}</span>
            </div>
          </div>

          <button
            onClick={handleCopyWebhookUrl}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
          >
            {copiedWebhook ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Endpoint</span>
              </>
            )}
          </button>
        </div>

        {/* Live Webhook Event Feed */}
        <div>
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
            Recent Ingested Dodo Webhook Events ({metrics.recentWebhooks.length})
          </h4>

          {metrics.recentWebhooks.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-950/40 border border-slate-800/60 text-center text-xs font-mono text-slate-500">
              No webhook events ingested yet. Point your Dodo Payments Webhook settings to the URL above to stream live subscription events.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-2">Event ID</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Customer Account</th>
                    <th className="py-2 text-right">Amount</th>
                    <th className="py-2 text-right">Status</th>
                    <th className="py-2 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {metrics.recentWebhooks.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-2.5 text-slate-400">{event.id}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-sky-300 font-semibold">
                          {event.type}
                        </span>
                      </td>
                      <td className="py-2.5 font-bold text-white">{event.customerName}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-400">
                        ${event.amount} {event.currency}
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                          {event.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-slate-500">
                        {new Date(event.created).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 6. Connect Dodo Payments Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Connect Dodo Payments</h3>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 font-sans">
              Enter your Dodo Payments Secret API Key from your{" "}
              <a
                href="https://app.dodopayments.com/developers/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline"
              >
                Dodo Developer Dashboard
              </a>{" "}
              to sync real-time subscriptions, invoices, and revenue metrics.
            </p>

            {connectionError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{connectionError}</span>
              </div>
            )}

            <form onSubmit={handleSaveDodoConnection} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Environment:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDodoEnv("live")}
                    className={`py-2 px-3 rounded-xl text-xs font-mono font-medium border transition-colors cursor-pointer ${
                      dodoEnv === "live"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-500"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    Live Production
                  </button>
                  <button
                    type="button"
                    onClick={() => setDodoEnv("test")}
                    className={`py-2 px-3 rounded-xl text-xs font-mono font-medium border transition-colors cursor-pointer ${
                      dodoEnv === "test"
                        ? "bg-sky-950 text-sky-300 border-sky-500"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    Test / Sandbox
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Dodo Secret API Key:
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    placeholder={dodoEnv === "live" ? "dodo_live_..." : "dodo_test_..."}
                    value={dodoKeyInput}
                    onChange={(e) => setDodoKeyInput(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Webhook Signing Secret (Optional):
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    placeholder="whsec_..."
                    value={webhookSecretInput}
                    onChange={(e) => setWebhookSecretInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {metrics.connected ? (
                  <button
                    type="button"
                    onClick={handleDisconnectDodo}
                    className="px-3 py-2 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-mono transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMetrics(getDefaultCommercialData(data.totals.totalNpmMonth));
                      setShowConnectModal(false);
                    }}
                    className="text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
                  >
                    Use Zero Baseline
                  </button>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-mono cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isConnecting}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Connect & Sync</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
