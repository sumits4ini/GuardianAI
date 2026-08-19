"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Radio, Sparkles, Users, MapPin, Compass, User } from "lucide-react";
import { useGuardian } from "@/lib/store/demo-context";

export function Navbar() {
  const pathname = usePathname();
  const { isDemoMode, toggleDemoMode } = useGuardian();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/journey", label: "Journey" },
    { href: "/map", label: "Safety Map" },
    { href: "/reports", label: "Reports" },
    { href: "/assistant", label: "AI Assistant" },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/80 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-primary to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-400 animate-pulse-glow" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                GuardianAI
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                PROACTIVE AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Predictive Safety Intelligence Net
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleDemoMode()}
            className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              isDemoMode
                ? "bg-indigo-950/60 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                : "bg-slate-900/60 border-slate-700 text-slate-400"
            }`}
            title="Toggle Demo Simulation Bar"
          >
            <Radio className={`w-3.5 h-3.5 ${isDemoMode ? "text-indigo-400 animate-pulse" : ""}`} />
            <span className="text-[11px] font-medium">Demo Mode</span>
          </button>

          <Link
            href="/profile"
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 transition-colors"
            title="User Profile & Trusted Contacts"
          >
            <User className="w-4 h-4 text-slate-300" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
