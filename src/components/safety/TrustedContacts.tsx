"use client";

import React, { useState } from "react";
import { TrustedContact } from "@/types";
import { Users, UserPlus, Trash2, Shield, Heart } from "lucide-react";

interface TrustedContactsProps {
  contacts: TrustedContact[];
  onAddContact: (contact: Omit<TrustedContact, "id">) => void;
  onRemoveContact: (id: string) => void;
}

export function TrustedContacts({ contacts, onAddContact, onRemoveContact }: TrustedContactsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("Family");
  const [notifyOnHighRisk, setNotifyOnHighRisk] = useState(true);
  const [notifyOnSos, setNotifyOnSos] = useState(true);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    onAddContact({
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
    <div className="p-5 rounded-2xl glass-panel-elevated border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Trusted Safety Network</h3>
            <p className="text-[11px] text-slate-400">Notified during high risk anomalies and SOS alerts</p>
          </div>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1.5 rounded-lg border border-indigo-500/30 flex items-center gap-1 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between"
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

            <button
              type="button"
              onClick={() => onRemoveContact(contact.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-2.5 animate-in fade-in">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">New Contact Details</h4>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Relationship (e.g. Sister)"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              required
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Save Contact
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
