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
    completeJourney,
    riskAssessment,
    isEvaluatingRisk,
    evaluateRisk,
  } = useGuardian();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-16 lg:pb-0">
      <Navbar />
      <DemoControllerBar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Safety Journey Net</h1>
              <p className="text-xs text-slate-400">Proactive corridor tracking and route anomaly monitoring</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              {activeJourney ? (
                <div className="space-y-4">
                  <JourneyCard
                    journey={activeJourney}
                    onCheckIn={performCheckIn}
                    onComplete={completeJourney}
                  />
                  <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Journey Monitoring Status
                    </h3>
                    <p className="text-xs text-slate-300">
                      GPS coordinates are evaluated every 10 seconds against the expected corridor. Anomaly alerts are triggered automatically if route deviations or unexpected stops occur.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl glass-panel-elevated border border-slate-800">
                  <JourneyForm
                    currentCoords={currentCoords}
                    onSubmit={startJourney}
                  />
                </div>
              )}
            </div>

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
