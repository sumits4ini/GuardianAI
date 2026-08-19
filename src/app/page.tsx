"use client";

import React from "react";
import Link from "next/link";
import { 
  Shield, 
  Sparkles, 
  Navigation, 
  MapPin, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 flex flex-col items-center justify-center text-center">
        
        {/* Background glow ambient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-indigo-500/10 via-primary/15 to-cyan-500/10 blur-3xl -z-10 pointer-events-none rounded-full" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Hackathon Edition — Safety Net AI</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-tight">
          Proactive Safety Intelligence.
          <span className="block mt-1 bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
            Before Danger Occurs.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
          Most safety apps react after danger happens through an SOS button. <strong>GuardianAI</strong> uses Google Gemini AI, journey context, route deviation anomaly detection, and spatial community reports to predict and respond to safety risks earlier.
        </p>

        {/* 5-Stage Pipeline Badge */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-indigo-300">DETECT</span>
          <span>→</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-cyan-300">UNDERSTAND</span>
          <span>→</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-300">PREDICT</span>
          <span>→</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-emerald-300">RECOMMEND</span>
          <span>→</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-rose-300">ESCALATE</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25 transition-all"
          >
            <span>Launch Safety Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/journey"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
          >
            Start Safety Journey
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl w-full text-left">
          <div className="p-6 rounded-2xl glass-panel-elevated border border-slate-800 space-y-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 w-fit">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Predictive AI Risk Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Google Gemini evaluates time of night, route deviation, spatial hazard density, and check-in adherence into an explainable 0–100 risk score.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel-elevated border border-slate-800 space-y-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 w-fit">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Spatial Hazard Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live OpenStreetMap + Leaflet map with dark aesthetics, real-time hazard badges, risk perimeters, and route safety simulator.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel-elevated border border-slate-800 space-y-3">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 w-fit">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Protected SOS & Network</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dual-protected SOS trigger (**Slide** or **Hold 2s**) preventing accidental activation while immediately alerting your trusted network.
            </p>
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>GuardianAI — Predictive AI Safety Intelligence Net • Built for Hackathon</p>
      </footer>
    </div>
  );
}
