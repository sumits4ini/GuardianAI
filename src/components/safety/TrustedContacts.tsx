"use client";

import React, { useState } from "react";
import { TrustedContact } from "@/types";
import { Users, UserPlus, Trash2, Edit2, Shield, Heart, Check, X, AlertTriangle } from "lucide-react";

interface TrustedContactsProps {
  contacts: TrustedContact[];
  onAddContact: (contact: Omit<TrustedContact, "id">) => Promise<{ success: boolean; contact?: TrustedContact; error?: string }>;
  onUpdateContact?: (id: string, updates: Partial<TrustedContact>) => Promise<{ success: boolean; error?: string }>;
  onRemoveContact: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function TrustedContacts({
  contacts,
  onAddContact,
  onUpdateContact,
  onRemoveContact,
}: TrustedContactsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("Family");
  const [notifyOnHighRisk, setNotifyOnHighRisk] = useState(true);
  const [notifyOnSos, setNotifyOnSos] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setRelationship("Family");
    setNotifyOnHighRisk(true);
    setNotifyOnSos(true);
    setIsAdding(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleStartEdit = (contact: TrustedContact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setPhone(contact.phone);
    setEmail(contact.email || "");
    setRelationship(contact.relationship);
    setNotifyOnHighRisk(contact.notifyOnHighRisk);
    setNotifyOnSos(contact.notifyOnSos);
    setIsAdding(false);
    setFormError(null);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || name.trim().length < 2) {
      setFormError("Name must be at least 2 characters.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setFormError("Please enter a valid phone number (at least 7 digits).");
      return;
    }

    if (editingId && onUpdateContact) {
      const res = await onUpdateContact(editingId, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        relationship: relationship.trim(),
        notifyOnHighRisk,
        notifyOnSos,
      });
      if (res.success) {
        resetForm();
      } else {
        setFormError(res.error || "Failed to update contact.");
      }
    } else {
      const res = await onAddContact({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        relationship: relationship.trim(),
        notifyOnHighRisk,
        notifyOnSos,
      });
      if (res.success) {
        resetForm();
      } else {
        setFormError(res.error || "Failed to add contact.");
      }
    }
  };

  return (
    <div className="p-5 rounded-2xl glass-panel-elevated border border-slate-800 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Trusted Safety Network</h3>
            <p className="text-[11px] text-slate-400">Contacts dispatched automatically upon high risk or SOS</p>
          </div>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg border border-indigo-500/30 flex items-center gap-1 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        )}
      </div>

      {/* Recommended Contact Banner if 0 contacts */}
      {contacts.length === 0 && (
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-start gap-2 animate-pulse">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold block">No Trusted Contacts Added</span>
            <span className="text-[11px] text-amber-200/80">
              We strongly recommend adding at least one trusted person (family, roommate, or campus RA) before starting journeys.
            </span>
          </div>
        </div>
      )}

      {/* Add / Edit Form */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSaveContact} className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {editingId ? "Edit Trusted Contact" : "Add New Trusted Contact"}
            </h4>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {formError && (
            <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-[11px] text-rose-300">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Maya Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Relationship</label>
              <input
                type="text"
                placeholder="e.g. Sister, Roommate"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Email (Optional)</label>
              <input
                type="email"
                placeholder="contact@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
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

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
            >
              {editingId ? "Save Contact Changes" : "Save New Contact"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Contacts List */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{contact.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-medium">
                  {contact.relationship}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {contact.phone} {contact.email && `• ${contact.email}`}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                {contact.notifyOnHighRisk && (
                  <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    High Risk Alert
                  </span>
                )}
                {contact.notifyOnSos && (
                  <span className="text-[9px] text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                    SOS Dispatch
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-90">
              <button
                type="button"
                onClick={() => handleStartEdit(contact)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                title="Edit Contact"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onRemoveContact(contact.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Delete Contact"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
