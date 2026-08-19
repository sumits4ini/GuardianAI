import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { RiskLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskColor(level: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  glow: string;
  badge: string;
} {
  switch (level) {
    case 'SAFE':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      };
    case 'MODERATE':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-500/10',
        text: 'text-orange-400',
        border: 'border-orange-500/30',
        glow: 'shadow-[0_0_20px_rgba(249,115,22,0.25)]',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      };
    case 'CRITICAL':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        glow: 'shadow-[0_0_25px_rgba(239,68,68,0.35)]',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
      };
    default:
      return {
        bg: 'bg-slate-800/40',
        text: 'text-slate-300',
        border: 'border-slate-700',
        glow: '',
        badge: 'bg-slate-800 text-slate-300 border-slate-700',
      };
  }
}

export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score <= 25) return 'SAFE';
  if (score <= 50) return 'MODERATE';
  if (score <= 75) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatTimeRemaining(targetIsoTime: string): string {
  const target = new Date(targetIsoTime).getTime();
  const now = new Date().getTime();
  const diffMs = target - now;

  if (diffMs <= 0) return "Due now";

  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'}`;

  const hours = Math.floor(diffMins / 60);
  const remainingMins = diffMins % 60;
  return `${hours}h ${remainingMins}m`;
}

export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Invalid time';
  }
}
