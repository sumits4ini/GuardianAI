"use client";

import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DemoControllerBar } from "@/components/demo/demo-controller-bar";
import { AIChat } from "@/components/ai/AIChat";
import { RiskAnalysis } from "@/components/ai/RiskAnalysis";
import { AIRecommendation } from "@/components/ai/AIRecommendation";
import { SOSEmergencyModal } from "@/components/sos/sos-emergency-modal";
import { useGuardian } from "@/lib/store/demo-context";
import { Sparkles } from "lucide-react";

export default function AssistantPage() {
  const { riskAssessment } = useGuardian();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-16 lg:pb-0 transition-colors duration-200">
      <Navbar />
      <DemoControllerBar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Safety Intelligence Assistant</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time distress analysis, tactical guidance & emergency escalation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <AIChat />
            </div>

            <div className="lg:col-span-5 space-y-6">
              <AIRecommendation recommendedAction={riskAssessment.recommendedAction} />
              <RiskAnalysis assessment={riskAssessment} />
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
      <SOSEmergencyModal />
    </div>
  );
}
