"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DemoControllerBar } from "@/components/demo/demo-controller-bar";
import { TrustedContacts } from "@/components/safety/TrustedContacts";
import { SOSEmergencyModal } from "@/components/sos/sos-emergency-modal";
import { useAuth } from "@/hooks/useAuth";
import { User, Shield, Phone, Mail, Heart, Save, Key, AlertCircle, CheckCircle2, Lock } from "lucide-react";

export default function ProfilePage() {
  const {
    user,
    profile,
    trustedContacts,
    updateProfile,
    addContact,
    updateContact,
    deleteContact,
    loading,
    error,
  } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyNotes, setEmergencyNotes] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setPhone(profile.phone || "");
      setEmergencyNotes(profile.emergencyNotes || "");
    }
  }, [profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMsg(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setLocalError("Full name must be at least 2 characters.");
      return;
    }

    setIsSaving(true);
    const res = await updateProfile({
      fullName: fullName.trim(),
      phone: phone.trim(),
      emergencyNotes: emergencyNotes.trim(),
    });
    setIsSaving(false);

    if (res.success) {
      setSuccessMsg("Profile updated successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } else if (res.error) {
      setLocalError(res.error);
    }
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
            
            {/* Left Col (6 cols): Profile Details */}
            <div className="lg:col-span-6 space-y-6">
              <div className="p-5 rounded-2xl glass-panel-elevated border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Traveler Identity & Medical Notes</h3>
                  <span className="text-[10px] font-mono text-slate-500">PROTECTED RLS</span>
                </div>

                {successMsg && (
                  <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {(localError || error) && (
                  <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{localError || error}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-3.5">
                  
                  {/* User ID (Immutable & Read-Only) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>User ID (Immutable)</span>
                    </label>
                    <input
                      type="text"
                      value={user?.id || profile?.id || "usr_guardian_01"}
                      disabled
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-500 font-mono cursor-not-allowed select-all"
                    />
                  </div>

                  {/* Email (Read-Only) */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>Registered Email</span>
                    </label>
                    <input
                      type="email"
                      value={user?.email || profile?.email || "alex.rivera@guardian.safe"}
                      disabled
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 cursor-not-allowed"
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Your Full Name"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Emergency Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Emergency Medical Notes */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" />
                      <span>Emergency Medical & Safety Notes</span>
                    </label>
                    <textarea
                      rows={3}
                      value={emergencyNotes}
                      onChange={(e) => setEmergencyNotes(e.target.value)}
                      placeholder="Blood type (e.g. O+), severe allergies (penicillin, nuts), inhaler/epipen carried in backpack..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? "Saving Changes..." : "Save Profile Changes"}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right Col (6 cols): Trusted Contacts Network CRUD */}
            <div className="lg:col-span-6">
              <TrustedContacts
                contacts={trustedContacts}
                onAddContact={addContact}
                onUpdateContact={updateContact}
                onRemoveContact={deleteContact}
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
