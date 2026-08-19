"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PRESET_JOURNEYS } from "@/lib/store/mock-data";
import { Coordinates } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { MapPin, Navigation, Compass, ShieldCheck, AlertTriangle, UserPlus } from "lucide-react";

interface JourneyFormProps {
  currentCoords: Coordinates;
  onSubmit: (
    originName: string,
    originCoords: Coordinates,
    destName: string,
    destCoords: Coordinates,
    durationMins: number,
    checkInIntervalMins: number
  ) => Promise<void>;
}

export function JourneyForm({ currentCoords, onSubmit }: JourneyFormProps) {
  const { trustedContacts } = useAuth();

  const [originName, setOriginName] = useState("Current Location (Campus Quad)");
  const [destName, setDestName] = useState("North Student Hostel Complex");
  const [destLat, setDestLat] = useState(37.7792);
  const [destLng, setDestLng] = useState(-122.4158);
  const [durationMins, setDurationMins] = useState(20);
  const [checkInIntervalMins, setCheckInIntervalMins] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSelectPreset = (preset: typeof PRESET_JOURNEYS[0]) => {
    setOriginName(preset.origin.name);
    setDestName(preset.destination.name);
    setDestLat(preset.destination.coords.lat);
    setDestLng(preset.destination.coords.lng);
    setDurationMins(preset.defaultDurationMins);
    setCheckInIntervalMins(preset.checkInIntervalMins);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(
      originName,
      { lat: currentCoords.lat, lng: currentCoords.lng },
      destName,
      { lat: destLat, lng: destLng },
      durationMins,
      checkInIntervalMins
    );
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Zero Contacts Recommendation Banner */}
      {trustedContacts.length === 0 && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold block">Recommended Safety Step</span>
              <span className="text-[11px] text-amber-200/80">
                You currently have 0 trusted contacts. Add at least one contact so they can receive automated high-risk or SOS alerts.
              </span>
            </div>
          </div>
          <Link
            href="/profile"
            className="text-[11px] font-bold px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded border border-amber-500/40 whitespace-nowrap"
          >
            Add Contact
          </Link>
        </div>
      )}

      {/* Preset Routes */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
          Preset Routes
        </span>
        <div className="grid grid-cols-1 gap-2">
          {PRESET_JOURNEYS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-left p-2.5 rounded-xl bg-slate-900/80 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                  {preset.name}
                </span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  ~{preset.defaultDurationMins}m
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Origin Point</label>
          <div className="relative">
            <input
              type="text"
              value={originName}
              onChange={(e) => setOriginName(e.target.value)}
              required
              className="w-full px-3 py-2 pl-9 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Navigation className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Destination</label>
          <div className="relative">
            <input
              type="text"
              value={destName}
              onChange={(e) => setDestName(e.target.value)}
              required
              className="w-full px-3 py-2 pl-9 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <MapPin className="w-4 h-4 text-rose-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-slate-400">Duration</span>
              <span className="text-xs font-bold text-white font-mono">{durationMins} mins</span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={durationMins}
              onChange={(e) => setDurationMins(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-slate-400">Check-in</span>
              <span className="text-xs font-bold text-indigo-300 font-mono">Every {checkInIntervalMins}m</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={5}
              value={checkInIntervalMins}
              onChange={(e) => setCheckInIntervalMins(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all mt-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{loading ? "Activating Safety Net..." : "Activate Safety Journey"}</span>
        </button>
      </form>
    </div>
  );
}
