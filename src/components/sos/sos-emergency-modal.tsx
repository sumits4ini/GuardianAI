"use client";

import React, { useState } from "react";
import { useGuardian } from "@/lib/store/demo-context";
import { 
  ShieldAlert, 
  PhoneCall, 
  Users, 
  MapPin, 
  CheckCircle2, 
  X, 
  AlertTriangle,
  Radio,
  ExternalLink
} from "lucide-react";

export function SOSEmergencyModal() {
  const { sosActive, sosDetails, cancelSOS, currentCoords, userProfile } = useGuardian();
  const [isConfirmingDeactivate, setIsConfirmingDeactivate] = useState(false);

  if (!sosActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border-2 border-rose-500 shadow-[0_0_50px_rgba(239,68,68,0.6)] p-6 overflow-hidden">
        
        {/* Emergency Beacon Glow Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-rose-600/30 border border-rose-500/60 sos-active-pulse">
            <ShieldAlert className="w-10 h-10 text-rose-400 animate-bounce" />
          </div>
        </div>

        <div className="text-center mb-6">
          <span className="text-xs font-black tracking-widest uppercase bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full border border-rose-500/40">
            EMERGENCY SOS BROADCAST ACTIVE
          </span>
          <h2 className="text-xl font-extrabold text-white mt-2">
            Safety Alert Dispatched
          </h2>
          <p className="text-xs text-rose-200/80 mt-1">
            Your live GPS location and distress beacon have been transmitted to your trusted safety network.
          </p>
        </div>

        {/* GPS Live Ping Box */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-rose-500/30 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <MapPin className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Live Coordinates</span>
              <span className="text-xs font-mono font-bold text-white">
                {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
            <Radio className="w-3 h-3 animate-ping" />
            LIVE TRANSMIT
          </span>
        </div>

        {/* Notified Contacts Status */}
        <div className="mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            Notified Trusted Contacts ({userProfile.contacts.length})
          </span>

          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {userProfile.contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs"
              >
                <div>
                  <span className="font-semibold text-white block">{contact.name}</span>
                  <span className="text-[10px] text-slate-400">{contact.relationship} • {contact.phone}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ALERTED</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Direct Call to Emergency Services */}
        <div className="space-y-2">
          <a
            href="tel:112"
            className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-600/40 transition-colors"
          >
            <PhoneCall className="w-5 h-5 animate-pulse" />
            <span>Call Local Emergency (112 / 911)</span>
          </a>

          {/* Safe Deactivate Button */}
          {!isConfirmingDeactivate ? (
            <button
              type="button"
              onClick={() => setIsConfirmingDeactivate(true)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              I am Safe — Deactivate SOS Alert
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-2 animate-in fade-in">
              <span className="text-xs font-bold text-white block text-center">
                Confirm: Are you safe to cancel the broadcast?
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={cancelSOS}
                  className="py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  Yes, Cancel SOS
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDeactivate(false)}
                  className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Keep Active
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
