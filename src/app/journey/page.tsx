"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DemoControllerBar } from "@/components/demo/demo-controller-bar";
import { JourneyForm } from "@/components/safety/JourneyForm";
import { JourneyCard } from "@/components/dashboard/JourneyCard";
import { SafetyScore } from "@/components/dashboard/SafetyScore";
import { SOSButton } from "@/components/safety/SOSButton";
import { SOSEmergencyModal } from "@/components/sos/sos-emergency-modal";
import { useGuardian } from "@/lib/store/demo-context";
import { Compass, ShieldCheck } from "lucide-react";

export default function JourneyPage() {
  const {
    activeJourney,
    currentCoords,
    startJourney,
    performCheckIn,
    extendJourney,
    completeJourney,
    cancelJourney,
    triggerSOS,
    riskAssessment,
    isEvaluatingRisk,
    evaluateRisk,
  } = useGuardian();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-16 lg:pb-0 transition-colors duration-200">
      <Navbar />
      <DemoControllerBar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400">
              <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Personal Safety Journey</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Proactive corridor tracking, expected arrival monitoring & check-in</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column (7 Cols): Active Journey Card or Start Journey Form */}
            <div className="lg:col-span-7 space-y-6">
              {activeJourney ? (
                <div className="space-y-4">
                  <JourneyCard
                    journey={activeJourney}
                    onCheckIn={performCheckIn}
                    onComplete={completeJourney}
                    onCancel={cancelJourney}
                    onExtend={extendJourney}
                    onTriggerSOS={() => triggerSOS("manual_hold")}
                  />

                  <div className="p-4 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Active Corridor Protection Active</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Your starting location is logged. If your expected arrival time passes without a check-in, GuardianAI alerts you before escalating.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl glass-panel-elevated border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Plan & Start Safety Journey</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Choose destination and expected arrival. GPS location is captured as starting point when available.
                    </p>
                  </div>

                  <JourneyForm
                    currentCoords={currentCoords}
                    onSubmit={startJourney}
                  />
                </div>
              )}
            </div>

            {/* Right Column (5 Cols): Risk Score & SOS Beacon */}
            <div className="lg:col-span-5 space-y-6">
              <SafetyScore
                score={riskAssessment.riskScore}
                level={riskAssessment.riskLevel}
                confidence={riskAssessment.confidence}
                isEvaluating={isEvaluatingRisk}
                onRefresh={() => evaluateRisk()}
              />

              <SOSButton />
            </div>

          </div>
        </main>
      </div>

      <MobileNav />
      <SOSEmergencyModal />
    </div>
  );
}
