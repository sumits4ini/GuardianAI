"use client";

import React, { useState, useRef, useEffect } from "react";
import { DistressChatMessage, DistressAnalysisResult } from "@/types";
import { useGuardian } from "@/lib/store/demo-context";
import { Sparkles, Send, Bot, User, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";

const SAMPLE_DISTRESS_QUERIES = [
  "Someone has been following me for 2 blocks and I'm alone.",
  "I'm stranded on an unlit street and feel uncomfortable.",
  "My rideshare driver took an unexpected detour into a dark lane.",
  "There's an aggressive group loitering ahead on my sidewalk.",
];

export function AIChat() {
  const { triggerSOS, currentCoords, activeJourney } = useGuardian();
  const [messages, setMessages] = useState<DistressChatMessage[]>([
    {
      id: "msg_welcome",
      sender: "assistant",
      message: "Hello, I am GuardianAI Safety Intelligence Assistant. Tell me what you are experiencing or if you feel unsafe.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: DistressChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      message: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/analyze-distress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          locationContext: {
            latitude: currentCoords.lat,
            longitude: currentCoords.lng,
            destination: activeJourney?.destinationName,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const analysis: DistressAnalysisResult = data.analysis;

        const aiMsg: DistressChatMessage = {
          id: `ai_${Date.now()}`,
          sender: "assistant",
          message: analysis.safeAdvice,
          timestamp: new Date().toISOString(),
          analysis,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      const fallbackAiMsg: DistressChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "assistant",
        message: "Stay calm and keep moving towards illuminated, populated premises. Stay on well-lit main roads.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] rounded-2xl glass-panel-elevated border border-slate-800 overflow-hidden">
      <div className="p-3.5 border-b border-slate-800 glass-panel flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">AI Safety Intelligence Assistant</h3>
            <p className="text-[10px] text-slate-400">Contextual distress evaluation & tactical advice</p>
          </div>
        </div>
        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
          ONLINE
        </span>
      </div>

      <div className="px-3 py-1.5 bg-indigo-950/40 border-b border-indigo-500/20 text-[10px] text-indigo-300 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
        <span>Advisory assistant • Does not replace 911 / 112 emergency services.</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Sample Scenarios:
          </span>
          <div className="flex flex-wrap gap-1">
            {SAMPLE_DISTRESS_QUERIES.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-left text-[11px] p-1.5 rounded-lg bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 text-slate-300 transition-colors"
              >
                &quot;{q}&quot;
              </button>
            ))}
          </div>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
              }`}
            >
              <p className="leading-relaxed">{msg.message}</p>
              {msg.analysis && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold uppercase text-slate-400">Urgency:</span>
                    <span className={`font-bold px-1.5 py-0.2 rounded ${
                      msg.analysis.urgency === "IMMEDIATE" || msg.analysis.urgency === "HIGH"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}>
                      {msg.analysis.urgency}
                    </span>
                  </div>

                  {msg.analysis.recommendedActions && (
                    <div className="space-y-1">
                      {msg.analysis.recommendedActions.map((a, i) => (
                        <div key={i} className="flex items-start gap-1 text-[11px] text-slate-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.analysis.shouldTriggerSOSPrompt && (
                    <button
                      onClick={() => triggerSOS("distress_ai_prompt")}
                      className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1 mt-1 shadow-md shadow-rose-600/30"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Trigger One-Tap SOS Beacon</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-xs text-slate-400 italic">GuardianAI is analyzing safety context...</div>}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 border-t border-slate-800 glass-panel">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your safety question or distress situation..."
            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
