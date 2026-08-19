"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DemoControllerBar } from "@/components/demo/demo-controller-bar";
import { ReportForm } from "@/components/reports/ReportForm";
import { ReportCard } from "@/components/reports/ReportCard";
import { SOSEmergencyModal } from "@/components/sos/sos-emergency-modal";
import { useGuardian } from "@/lib/store/demo-context";
import { ReportCategory, ReportSeverity } from "@/types";
import { FileText } from "lucide-react";

export default function ReportsPage() {
  const { communityReports, addCommunityReport, currentCoords } = useGuardian();
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filteredReports = filterCategory === "all"
    ? communityReports
    : communityReports.filter((r) => r.category === filterCategory);

  const handleAddReport = async (
    category: ReportCategory,
    description: string,
    approxLocation: string,
    severity?: ReportSeverity
  ) => {
    await addCommunityReport({
      category,
      description,
      approximateLocationName: approxLocation,
      severity,
      latitude: currentCoords.lat + (Math.random() - 0.5) * 0.002,
      longitude: currentCoords.lng + (Math.random() - 0.5) * 0.002,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-16 lg:pb-0 transition-colors duration-200">
      <Navbar />
      <DemoControllerBar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Community Safety Intelligence</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Anonymized safety observations & hazard reporting</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col (5 cols): Submit Form */}
            <div className="lg:col-span-5 space-y-6">
              <ReportForm onSubmitReport={handleAddReport} />
            </div>

            {/* Right Col (7 cols): Filter & Feed */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-4 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Verified Reports ({filteredReports.length})
                </span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:border-indigo-500 shadow-sm"
                >
                  <option value="all">All Categories</option>
                  <option value="harassment">Harassment</option>
                  <option value="poor_lighting">Poor Lighting</option>
                  <option value="suspicious_activity">Suspicious Activity</option>
                  <option value="isolated_area">Isolated Area</option>
                  <option value="theft">Theft</option>
                  <option value="unsafe_road">Unsafe Road</option>
                </select>
              </div>

              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
      <SOSEmergencyModal />
    </div>
  );
}
