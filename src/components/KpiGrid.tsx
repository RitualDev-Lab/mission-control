import type { MissionControlData } from "@/lib/types";
import {
  AlertOctagon,
  ArrowUpRight,
  Code2,
  Download,
  Eye,
  GitPullRequest,
  Globe,
  Layers,
  Puzzle,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

interface KpiGridProps {
  data: MissionControlData;
}

export function KpiGrid({ data }: KpiGridProps) {
  const cards = [
    {
      title: "GitHub Visitors & Traffic",
      value: `${(data.totals.totalViews || 0).toLocaleString()} Views`,
      subtext: `${(data.totals.totalClones || 0).toLocaleString()} clones • ${data.totals.totalUniqueVisitors || 0} unique visitors`,
      icon: Eye,
      color: "text-emerald-400",
      bgGlow: "from-emerald-500/10",
      borderColor: "border-emerald-500/20",
      badge: "HN & Google",
      badgeColor: "bg-emerald-950 text-emerald-400 border-emerald-800/60",
    },
    {
      title: "npm Monthly Ingestion",
      value: data.totals.totalNpmMonth.toLocaleString(),
      subtext: `${data.totals.totalNpmWeek.toLocaleString()} this week`,
      icon: Download,
      color: "text-sky-400",
      bgGlow: "from-sky-500/10",
      borderColor: "border-sky-500/20",
      badge: "+12.4% MoM",
      badgeColor: "bg-emerald-950 text-emerald-400 border-emerald-800/60",
    },
    {
      title: "VS Code / Open VSX",
      value: data.totals.totalOpenVsx.toLocaleString(),
      subtext: "vscode-poly extension",
      icon: Puzzle,
      color: "text-purple-400",
      bgGlow: "from-purple-500/10",
      borderColor: "border-purple-500/20",
      badge: "5.0 ★ Rating",
      badgeColor: "bg-purple-950 text-purple-300 border-purple-800/60",
    },
    {
      title: "Monitored Repositories",
      value: data.repos.length.toString(),
      subtext: `${data.totals.totalStars} stars across ${data.repos.length} repos`,
      icon: Code2,
      color: "text-indigo-400",
      bgGlow: "from-indigo-500/10",
      borderColor: "border-indigo-500/20",
      badge: "100% Synced",
      badgeColor: "bg-indigo-950 text-indigo-300 border-indigo-800/60",
    },
    {
      title: "Pending Pull Requests",
      value: data.totals.totalOpenPrs.toString(),
      subtext: `${data.totals.totalOpenIssues} issues pending`,
      icon: GitPullRequest,
      color: "text-amber-400",
      bgGlow: "from-amber-500/10",
      borderColor: "border-amber-500/20",
      badge: data.totals.totalOpenPrs === 0 ? "Clean Queue" : "Review Needed",
      badgeColor:
        data.totals.totalOpenPrs === 0
          ? "bg-emerald-950 text-emerald-400 border-emerald-800/60"
          : "bg-amber-950 text-amber-400 border-amber-800/60",
    },
    {
      title: "Security & IP Health",
      value: data.totals.totalSecurityAlerts === 0 ? "0 Alerts" : `${data.totals.totalSecurityAlerts} Alerts`,
      subtext: "0 AGPL Copyleft risks",
      icon: ShieldCheck,
      color: "text-teal-400",
      bgGlow: "from-teal-500/10",
      borderColor: "border-teal-500/20",
      badge: "Compliant",
      badgeColor: "bg-teal-950 text-teal-400 border-teal-800/60",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative rounded-2xl bg-slate-900/60 border ${card.borderColor} p-4 backdrop-blur-md overflow-hidden hover:border-slate-700 transition-all group`}
          >
            <div
              className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${card.bgGlow} to-transparent rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform`}
            />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 truncate">{card.title}</span>
              <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold tracking-tight text-white font-mono">{card.value}</div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 font-mono truncate">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
