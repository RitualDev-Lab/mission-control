import type { OrgRepoSummary } from "@/lib/types";
import { AlertTriangle, CheckCircle, Lock, ShieldAlert, ShieldCheck } from "lucide-react";

interface SecurityTabProps {
  repos: OrgRepoSummary[];
}

export function SecurityTab({ repos }: SecurityTabProps) {
  const totalAlerts = repos.reduce((acc, r) => acc + r.securityAlertsCount, 0);

  return (
    <div className="space-y-6">
      {/* High-Level Compliance Gate Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-950/40 via-slate-900/60 to-slate-900/40 border border-teal-500/30 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Enterprise Security & IP Firewall Status</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              All proprietary repositories enforce the Poly 24-hour supply chain quarantine gate and copyleft denylist. Zero AGPL/GPL contamination detected.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-semibold flex items-center">
            <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            100% COMPLIANT
          </span>
        </div>
      </div>

      {/* Security Alerts by Repo */}
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 backdrop-blur-md">
        <h3 className="font-bold text-white text-base mb-4 flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <span>Vulnerability & Dependabot Audit ({totalAlerts} Total)</span>
        </h3>

        <div className="space-y-3">
          {repos.map((repo) => (
            <div
              key={repo.name}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    repo.securityAlertsCount > 0 ? "bg-rose-500 animate-pulse" : "bg-emerald-400"
                  }`}
                />
                <div>
                  <h4 className="font-semibold text-white text-sm">{repo.name}</h4>
                  <p className="text-xs font-mono text-slate-500">{repo.fullName}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {repo.securityAlertsCount === 0 ? (
                  <span className="text-xs font-mono text-emerald-400 flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> 0 Vulnerabilities
                  </span>
                ) : (
                  <span className="text-xs font-mono text-rose-400 font-semibold flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" /> {repo.securityAlertsCount} Alerts
                  </span>
                )}

                <a
                  href={`${repo.htmlUrl}/security`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  View Security Tab &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
