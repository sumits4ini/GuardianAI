"use client";

import React from "react";
import Link from "next/link";
import { 
  Shield, 
  Sparkles, 
  MapPin, 
  AlertTriangle, 
  ArrowRight, 
  Navigation, 
  CheckCircle2, 
  Radio, 
  Lock, 
  EyeOff, 
  TrendingUp, 
  Activity, 
  Clock, 
  ShieldAlert, 
  Compass, 
  Users 
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base tracking-tight text-white flex items-center gap-1">
                <span>Guardian</span>
                <span className="text-indigo-400">AI</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Predictive Safety Intelligence</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5"
            >
              <span>Launch Safety Net</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold shadow-sm animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hackathon Safety Net Edition</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Predict risk. Stay connected. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-teal-300">
              Act sooner.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Most safety apps react only <em>after</em> danger strikes. <br />
            <strong>GuardianAI</strong> combines journey context, temporal risk, route deviation, and community signals to identify potential risks <em>earlier</em>.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Activity className="w-4 h-4" />
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/map"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Explore Safety Map</span>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-400 border-t border-slate-900">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-PII AI Reasoning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Server-Side Gemini 1.5 Flash</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Deterministic Baseline Fallback</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Anonymous Community Reports</span>
            </div>
          </div>

        </div>
      </section>

      {/* 5-Step Core Architecture Flow: DETECT -> UNDERSTAND -> PREDICT -> RECOMMEND -> ESCALATE */}
      <section className="py-16 bg-slate-900/40 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400">
              The Safety Intelligence Pipeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              How GuardianAI Protects Your Journey
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              A proactive safety net moving from early signal detection to tactical emergency escalation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            
            {/* Step 1: Detect */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                01
              </div>
              <h3 className="text-sm font-bold text-white">DETECT</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Monitors spatio-temporal telemetry: late night hours, unexpected stationary stops, and corridor deviations.
              </p>
            </div>

            {/* Step 2: Understand */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                02
              </div>
              <h3 className="text-sm font-bold text-white">UNDERSTAND</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Cross-references active nearby community hazard reports, recency, and street lighting ratings.
              </p>
            </div>

            {/* Step 3: Predict */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                03
              </div>
              <h3 className="text-sm font-bold text-white">PREDICT</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Calculates explainable Risk Score (0-100) and predicts whether travel corridor hazards are increasing.
              </p>
            </div>

            {/* Step 4: Recommend */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                04
              </div>
              <h3 className="text-sm font-bold text-white">RECOMMEND</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Suggests practical de-escalation actions: stay on main boulevards, check in with contacts, or re-orient.
              </p>
            </div>

            {/* Step 5: Escalate */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs border border-rose-500/30">
                05
              </div>
              <h3 className="text-sm font-bold text-white">ESCALATE</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Arms one-tap press-and-hold Emergency SOS beacon with automated live coordinate broadcast to trusted contacts.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Problem vs Solution Comparison */}
      <section className="py-16 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Why Reactive Safety Apps Fall Short
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Comparing traditional panic buttons with GuardianAI&apos;s proactive intelligence net.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Traditional Reactive Apps */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 opacity-90">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Traditional Safety Apps (Reactive)</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✗</span>
                  <span>Waits for danger to occur before taking any action.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✗</span>
                  <span>Relies solely on the user pressing a panic button during high stress.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✗</span>
                  <span>Ignores corridor context, time of day, and environmental hazards.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✗</span>
                  <span>No route deviation detection or automated check-in timers.</span>
                </li>
              </ul>
            </div>

            {/* GuardianAI Proactive */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/40 space-y-4 shadow-xl shadow-indigo-500/10">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>GuardianAI (Proactive Intelligence)</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Detects hazards early through ambient telemetry and community reports.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Identifies corridor deviations and unexpected stationary stops.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Explains <em>why</em> risk changed with causal signals, not raw numbers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Continuous 2-second press-and-hold SOS with anti-accidental safety locks.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-slate-900/30 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              End-to-End Safety Intelligence Features
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Built for reliability, privacy, and explainability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="p-2.5 w-fit rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Explainable Risk Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deterministic baseline scoring (0-100) augmented with Gemini 1.5 Flash reasoning. Never fabricates reports.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="p-2.5 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Corridor Journey Planner</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated check-in countdown timers, overdue arrival alarms, and intelligent detour detection.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="p-2.5 w-fit rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Press-and-Hold SOS Beacon</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prevents accidental clicks with 2-second hold. Instantly shares live GPS coordinates with emergency network.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="p-2.5 w-fit rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Spatial Hotspot Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clusters community reports into hazard hotspots with multi-layer filtering (Category, Severity, Time).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="p-2.5 w-fit rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">AI Safety Assistant</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Context-aware tactical guidance for situations like being followed, feeling unsafe, or getting lost.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="p-2.5 w-fit rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Privacy Anonymization</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Public reports are strictly anonymous with coordinate fuzzing to safeguard user home and work locations.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 text-center max-w-4xl mx-auto px-4 sm:px-6 space-y-5">
        <h2 className="text-3xl font-black text-white">
          Experience GuardianAI in Action
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Explore the live interactive dashboard with built-in hackathon demo controls.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <span>Open Live Safety Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-8 bg-slate-950 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-300">GuardianAI</span>
            <span>— Hackathon Safety Net Prototype</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
            <Link href="/map" className="hover:text-slate-300 transition-colors">Safety Map</Link>
            <Link href="/reports" className="hover:text-slate-300 transition-colors">Community Reports</Link>
            <Link href="/assistant" className="hover:text-slate-300 transition-colors">AI Assistant</Link>
          </div>

          <p className="text-[10px] text-slate-600">
            Advisory system • Does not replace official 911 / 112 emergency services.
          </p>
        </div>
      </footer>

    </div>
  );
}
