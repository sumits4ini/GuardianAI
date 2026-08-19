"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Compass, 
  MapPin, 
  FileText, 
  Sparkles, 
  User, 
  ShieldAlert,
  ShieldCheck 
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/journey", label: "Safety Journey", icon: Compass },
    { href: "/map", label: "Spatial Map", icon: MapPin },
    { href: "/reports", label: "Community Reports", icon: FileText },
    { href: "/assistant", label: "AI Safety Assistant", icon: Sparkles },
    { href: "/profile", label: "Profile & Contacts", icon: User },
  ];

  return (
    <aside className="w-60 h-[calc(100vh-4rem)] sticky top-16 border-r border-slate-800 bg-slate-950/60 p-4 hidden lg:flex flex-col justify-between">
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-2">
          Safety Hub
        </span>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 space-y-1 text-center">
        <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-indigo-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active Safety Net</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Predictive multi-signal anomaly reasoning enabled.
        </p>
      </div>
    </aside>
  );
}
