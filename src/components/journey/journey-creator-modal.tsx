"use client";

import React, { useState } from "react";
import { PRESET_JOURNEYS, DEFAULT_CENTER } from "@/lib/store/mock-data";
import { useGuardian } from "@/lib/store/demo-context";
import { MapPin, Navigation, Clock, ShieldCheck, X, Sparkles, Compass } from "lucide-react";

interface JourneyCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JourneyCreatorModal({ isOpen, onClose }: JourneyCreatorModalProps) {
  const { startJourney, currentCoords } = useGuardian();

  const [originName, setOriginName] = useState("Current Location (Campus Quad)");
  const [destName, setDestName] = useState("North Student Hostel Complex");
  const [destLat, setDestLat] = useState(37.7792);
  const [destLng, setDestLng] = useState(-122.4158);
  const [durationMins, setDurationMins] = useState(20);
  const [checkInIntervalMins, setCheckInIntervalMins] = useState(10);
  const [isStarting, setIsStarting] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_JOURNEYS[0]) => {
    setOriginName(preset.origin.name);
    setDestName(preset.destination.name);
    setDestLat(preset.destination.coords.lat);
    setDestLng(preset.destination.coords.lng);
    setDurationMins(preset.defaultDurationMins);
    setCheckInIntervalMins(preset.checkInIntervalMins);
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStarting(true);

    const originCoords = {
      lat: currentCoords.lat,
      lng: currentCoords.lng,
    };
    const destCoords = {
      lat: destLat,
      lng: destLng,
    };

    await startJourney(originName, originCoords, destName, destCoords, durationMins, checkInIntervalMins);
    setIsStarting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel-elevated p-6 border border-slate-700 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Start Safety Journey
            </h2>
            <p className="text-xs text-slate-400">
              Proactive AI corridor monitoring & scheduled check-ins
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Recommended Route Presets
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
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-indigo-400" />
                  <span>To: {preset.destination.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleStart} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Starting Point
            </label>
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
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Destination
            </label>
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

          {/* Sliders for Duration and Check-in Interval */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] text-slate-400">Est. Duration</span>
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
                <span className="text-[11px] text-slate-400">Check-in Rate</span>
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isStarting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-500 hover:to-primary/90 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isStarting ? "Initializing AI Safety Net..." : "Activate Safety Journey"}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
