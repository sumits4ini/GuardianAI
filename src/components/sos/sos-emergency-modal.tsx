"use client";

import React, { useState } from "react";
import { useGuardian } from "@/lib/store/demo-context";
import { useAuth } from "@/hooks/useAuth";
import { 
  ShieldAlert, 
  PhoneCall, 
  Users, 
  MapPin, 
  CheckCircle2, 
  Radio,
  Share2,
  Copy,
  Check,
  AlertTriangle,
  HeartHandshake
} from "lucide-react";

export function SOSEmergencyModal() {
  const { 
    sosActive, 
    sosAlert, 
    resolveSOS, 
    cancelSOS, 
    currentCoords, 
    getShareableLocationUrl 
  } = useGuardian();
  
  const { trustedContacts } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionSuccess, setResolutionSuccess] = useState(false);

  if (!sosActive) return null;

  const hasLocation = !!currentCoords && !sosAlert?.locationUnavailable;
  const shareUrl = getShareableLocationUrl(currentCoords);

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleMarkSafe = async () => {
    setIsResolving(true);
    await resolveSOS("User marked safe manually from emergency modal.");
    setIsResolving(false);
    setResolutionSuccess(true);
    setTimeout(() => {
      setResolutionSuccess(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border-2 border-rose-500 shadow-[0_0_60px_rgba(239,68,68,0.6)] p-6 overflow-hidden">
        
        {/* Emergency Beacon Pulse Header */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-rose-600/30 border border-rose-500/60 sos-active-pulse">
            <ShieldAlert className="w-10 h-10 text-rose-400 animate-bounce" />
          </div>
        </div>

        <div className="text-center mb-5">
          <span className="text-xs font-black tracking-widest uppercase bg-rose-500/20 text-rose-300 px-3.5 py-1 rounded-full border border-rose-500/50">
            EMERGENCY SOS ACTIVE
          </span>
          <h2 className="text-xl font-extrabold text-white mt-2">
            Safety Net Beacon Triggered
          </h2>
          <p className="text-xs text-rose-200/80 mt-1">
            Emergency alert broadcast is running.
          </p>
        </div>

        {/* Location Status Box */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-rose-500/40 mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Location Status
              </span>
              {hasLocation ? (
                <span className="text-xs font-mono font-bold text-white">
                  {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-300">
                  Location unavailable, but SOS is active.
                </span>
              )}
            </div>
          </div>

          {hasLocation && (
            <button
              onClick={handleCopyLink}
              className="text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 px-2.5 py-1.5 rounded-lg border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Copied!" : "Share Link"}</span>
            </button>
          )}
        </div>

        {/* Trusted Contacts Notification Status Box */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Emergency Network ({trustedContacts.length})</span>
            </span>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              DEMO NOTIFICATION
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            Emergency notification recorded for demo.
          </p>

          <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
            {trustedContacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/60 p-1.5 rounded-lg">
                <span>{c.name} ({c.relationship})</span>
                <span className="text-emerald-400 text-[10px] font-mono font-semibold">RECORDED</span>
              </div>
            ))}
          </div>
        </div>

        {/* Success Resolution Banner */}
        {resolutionSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500 text-xs text-emerald-200 text-center font-bold mb-3 animate-in fade-in">
            SOS resolved. You&apos;re marked safe.
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <a
            href="tel:112"
            className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-600/40 transition-colors"
          >
            <PhoneCall className="w-4 h-4 animate-pulse" />
            <span>Call Local Emergency (112 / 911)</span>
          </a>

          <button
            type="button"
            onClick={handleMarkSafe}
            disabled={isResolving}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isResolving ? "Resolving SOS..." : "Mark Safe — Resolve SOS Alert"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
