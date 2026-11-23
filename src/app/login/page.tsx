"use client";

import { AlertTriangle, CheckCircle, KeyRound, Lock, ShieldCheck, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid authentication token");
      setLoading(false);
    }
  };

  const handleOAuthLogin = () => {
    window.location.href = "/api/auth/github";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Glow Effects */}
        <div className="relative">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card */}
          <div className="relative bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-black/80">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 border border-sky-500/30 mb-4 shadow-inner">
                <Terminal className="w-7 h-7 text-sky-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                RitualDev <span className="text-sky-400">Mission Control</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 font-mono">
                Executive Multi-Repo Operations & Ecosystem Cockpit
              </p>
            </div>

            {/* Access Restriction Notice */}
            <div className="mb-6 p-3.5 rounded-xl bg-sky-950/40 border border-sky-800/60 text-xs text-sky-300 flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white">Superadmin Protected Gate</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Restricted strictly to organization administrator: <code className="text-sky-300 font-mono">divyanshujethi</code>.
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Primary Action: Sign in with GitHub */}
            <div className="space-y-4">
              <button
                onClick={handleOAuthLogin}
                className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-white font-medium text-sm transition-all shadow-lg hover:shadow-sky-500/10 cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>Sign in with GitHub OAuth</span>
              </button>

              <div className="relative flex items-center justify-center my-6">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] font-mono uppercase tracking-wider text-slate-500 absolute">
                  or direct token
                </span>
              </div>

              {/* Secondary Option: Direct PAT Token */}
              <form onSubmit={handleTokenSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    GitHub Personal Access Token (PAT)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                    />
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !token.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-xs transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{loading ? "Verifying Credentials..." : "Unlock Mission Control"}</span>
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center border-t border-slate-800/80 pt-4">
              <span className="text-[11px] text-slate-500 font-mono">
                RitualDev Lab HQ • Version 1.0.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
