"use client";

import React, { useState } from "react";
import { useGuardian } from "@/lib/store/demo-context";
import { Users, UserPlus, Trash2, Shield, Bell, X, Phone, Mail, Heart } from "lucide-react";

interface TrustedContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrustedContactsModal({ isOpen, onClose }: TrustedContactsModalProps) {
  const { userProfile, addTrustedContact, removeTrustedContact, updateUserProfile } = useGuardian();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("Family");
  const [notifyOnHighRisk, setNotifyOnHighRisk] = useState(true);
  const [notifyOnSos, setNotifyOnSos] = useState(true);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    addTrustedContact({
      name,
      phone,
      email,
      relationship,
      notifyOnHighRisk,
      notifyOnSos,
    });

    setName("");
    setPhone("");
    setEmail("");
    setIsAdding(false);
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
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Trusted Safety Network
            </h2>
            <p className="text-xs text-slate-400">
              People notified automatically during high risk or SOS alerts
            </p>
          </div>
        </div>

        {/* Contacts List */}
        <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
          {userProfile.contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{contact.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-medium">
                    {contact.relationship}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>{contact.phone}</span>
                  {contact.email && <span>• {contact.email}</span>}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {contact.notifyOnHighRisk && (
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      High Risk Alert
                    </span>
                  )}
                  {contact.notifyOnSos && (
                    <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      SOS Dispatch
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeTrustedContact(contact.id)}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Remove Contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Contact Form Toggle */}
        {!isAdding ? (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-indigo-300 flex items-center justify-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Trusted Contact</span>
          </button>
        ) : (
          <form onSubmit={handleAdd} className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-3 animate-in fade-in">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">New Contact Details</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="Relationship (e.g. Sister, RA)"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                required
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnHighRisk}
                  onChange={(e) => setNotifyOnHighRisk(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>High-Risk Alerts</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnSos}
                  onChange={(e) => setNotifyOnSos(e.target.checked)}
                  className="rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                />
                <span>SOS Alerts</span>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
              >
                Save Contact
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
