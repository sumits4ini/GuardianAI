"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Compass, 
  MapPin, 
  FileText, 
  Sparkles 
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/journey", label: "Journey", icon: Compass },
    { href: "/map", label: "Map", icon: MapPin },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/assistant", label: "AI", icon: Sparkles },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 lg:hidden px-2 py-1.5 flex items-center justify-around">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive ? "text-indigo-400 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
