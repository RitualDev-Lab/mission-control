"use client";

import { Activity, Clock, LogOut, RefreshCw, ShieldCheck, Terminal } from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps {
  user: string;
  onRefresh: () => void;
  onLogout: () => void;
  isRefreshing: boolean;
  lastUpdated: string;
}

export function Header({ user, onRefresh, onLogout, isRefreshing, lastUpdated }: HeaderProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toUTCString().slice(17, 25) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    onLogout();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Branding & Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/40 flex items-center justify-center shadow-inner">
              <Terminal className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-base tracking-tight">RitualDev</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-400 border border-sky-800/60 font-mono font-medium">
                  MISSION CONTROL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Executive Multi-Repo Operations</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800 text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              SYSTEMS ACTIVE
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 font-mono text-[11px] flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
              {time || "Loading..."}
            </span>
          </div>
        </div>

        {/* Right: User Pill, Sync & Logout */}
        <div className="flex items-center space-x-3">
          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 transition-all hover:border-sky-500/40 disabled:opacity-50 cursor-pointer"
            title="Fetch live metrics across all registries and GitHub"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Sync Radar</span>
          </button>

          {/* Superadmin User Pill */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <ShieldCheck className={`w-4 h-4 ${user.toLowerCase() === "divyanshujethi" ? "text-emerald-400" : "text-amber-400"}`} />
            <span className="font-mono text-slate-200">{user}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
              user.toLowerCase() === "divyanshujethi"
                ? "bg-indigo-950 text-indigo-300 border-indigo-800/50"
                : "bg-amber-950 text-amber-300 border-amber-800/50"
            }`}>
              {user.toLowerCase() === "divyanshujethi" ? "ADMIN" : "GUEST"}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
