"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DemoControllerBar } from "@/components/demo/demo-controller-bar";
import { TrustedContacts } from "@/components/safety/TrustedContacts";
import { SOSEmergencyModal } from "@/components/sos/sos-emergency-modal";
import { useGuardian } from "@/lib/store/demo-context";
import { User, Shield, Phone, Mail, Heart, Save } from "lucide-react";

export default function ProfilePage() {
  const { userProfile, updateUserProfile, addTrustedContact, removeTrustedContact } = useGuardian();
  
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [phone, setPhone] = useState(userProfile.phone);
  const [emergencyNotes, setEmergencyNotes] = useState(userProfile.emergencyNotes || "");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      fullName,
      phone,
      emergencyNotes,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-16 lg:pb-0">
      <Navbar />
      <DemoControllerBar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Profile & Safety Network</h1>
              <p className="text-xs text-slate-400">Emergency identity info, medical notes & trusted contacts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-6">
              <div className="p-5 rounded-2xl glass-panel-elevated border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Traveler Profile & Medical Notes</h3>
                
                {saved && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-300">
                    Profile successfully updated!
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Emergency Medical & Safety Notes</label>
                    <textarea
                      rows={3}
                      value={emergencyNotes}
                      onChange={(e) => setEmergencyNotes(e.target.value)}
                      placeholder="Blood type, severe allergies, medications carried in bag..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile</span>
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-6">
              <TrustedContacts
                contacts={userProfile.contacts}
                onAddContact={addTrustedContact}
                onRemoveContact={removeTrustedContact}
              />
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
      <SOSEmergencyModal />
    </div>
  );
}
