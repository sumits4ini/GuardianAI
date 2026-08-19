"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DemoControllerBar } from "@/components/demo/demo-controller-bar";
import { SafetyScore } from "@/components/dashboard/SafetyScore";
import { SafetyStatus } from "@/components/dashboard/SafetyStatus";
import { JourneyCard } from "@/components/dashboard/JourneyCard";
import { RiskFactors } from "@/components/dashboard/RiskFactors";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SOSButton } from "@/components/safety/SOSButton";
import { CheckInButton } from "@/components/safety/CheckInButton";
import { SafetyMap } from "@/components/map/SafetyMap";
import { SOSEmergencyModal } from "@/components/sos/sos-emergency-modal";
import { useGuardian } from "@/lib/store/demo-context";
import { Play, Navigation, ShieldCheck, Compass, MapPin } from "lucide-react";

export default function DashboardPage() {
  const {
    activeJourney,
    overallSafetyState,
    riskAssessment,
    isEvaluatingRisk,
    evaluateRisk,
    communityReports,
    performCheckIn,
    extendJourney,
    completeJourney,
    cancelJourney,
    triggerSOS,
  } = useGuardian();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-16 lg:pb-0">
      <Navbar />
      <DemoControllerBar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 space-y-5">
          
          {/* Section 1: SAFETY STATUS */}
          <SafetyStatus
            level={riskAssessment.riskLevel}
            escalation={riskAssessment.escalationLevel}
            isJourneyActive={!!activeJourney}
            overallState={overallSafetyState}
          />

          {/* Section 2: PRIMARY SAFETY ACTIONS HUB (Mobile & Desktop Top Hub) */}
          <div className="p-4 rounded-2xl glass-panel-elevated border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Primary Safety Actions
              </span>
              <span className="text-[10px] text-indigo-400 font-medium">
                {activeJourney ? "Corridor Tracking Active" : "Standby Net"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <CheckInButton
                onCheckIn={performCheckIn}
                lastCheckIn={activeJourney?.lastCheckIn}
                disabled={!activeJourney}
              />

              {!activeJourney ? (
                <Link
                  href="/journey"
                  className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/25 border border-indigo-500/40 transition-all active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>START SAFETY JOURNEY</span>
                </Link>
              ) : (
                <Link
                  href="/journey"
                  className="py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all"
                >
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>MANAGE ACTIVE JOURNEY</span>
                </Link>
              )}
            </div>
          </div>

          {/* Main Dashboard 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column (5 Cols): Risk Score, Active Journey Card, Risk Signals, SOS Beacon */}
            <div className="lg:col-span-5 space-y-6">
              
              <SafetyScore
                score={riskAssessment.riskScore}
                level={riskAssessment.riskLevel}
                confidence={riskAssessment.confidence}
                isEvaluating={isEvaluatingRisk}
                onRefresh={() => evaluateRisk()}
              />

              {activeJourney ? (
                <JourneyCard
                  journey={activeJourney}
                  onCheckIn={performCheckIn}
                  onComplete={completeJourney}
                  onCancel={cancelJourney}
                  onExtend={extendJourney}
                  onTriggerSOS={() => triggerSOS("manual_hold")}
                />
              ) : (
                <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">No Active Journey</h3>
                      <p className="text-[11px] text-slate-400">Activate corridor protection for your commute</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Set your destination and expected arrival time. GuardianAI will watch your route in real time.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/journey"
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Journey</span>
                    </Link>
                    <Link
                      href="/map"
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Explore Map</span>
                    </Link>
                  </div>
                </div>
              )}

              <RiskFactors
                signals={riskAssessment.signals}
                reasoning={riskAssessment.reasoning}
              />

              {/* Emergency SOS Beacon Button */}
              <SOSButton />
            </div>

            {/* Right Column (7 Cols): Spatial Map & Area Feed */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="h-[400px] w-full">
                <SafetyMap />
              </div>

              <RecentActivity reports={communityReports} />

            </div>

          </div>

        </main>
      </div>

      <MobileNav />
      <SOSEmergencyModal />
    </div>
  );
}
