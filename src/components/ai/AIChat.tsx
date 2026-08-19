"use client";

import React, { useState, useRef, useEffect } from "react";
import { DistressChatMessage, DistressAnalysisResult } from "@/types";
import { useGuardian } from "@/lib/store/demo-context";
import { Sparkles, Send, Bot, User, CheckCircle2, ShieldAlert, ShieldCheck, HelpCircle, Navigation } from "lucide-react";

const QUICK_SAFETY_QUESTIONS = [
  "Why is my risk score high?",
  "What should I do right now?",
  "Analyze my current journey status.",
  "Someone is following me and I need help.",
];

export function AIChat() {
  const { triggerSOS, currentCoords, activeJourney, riskAssessment } = useGuardian();
  const [messages, setMessages] = useState<DistressChatMessage[]>([
    {
      id: "msg_welcome",
      sender: "assistant",
      message: "Hello, I am your GuardianAI Safety Intelligence Assistant. Ask me about your current risk score, safety recommendations, or describe any situation where you feel unsafe.",
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
      // 1. Check if user is asking general safety questions or reporting distress
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          safetyContext: {
            journeyStatus: activeJourney?.status || "STANDBY",
            destination: activeJourney?.destinationName,
            riskScore: riskAssessment.riskScore,
            riskLevel: riskAssessment.riskLevel,
            signals: riskAssessment.signals,
            nearbyHazardsCount: 0,
            isOverdue: activeJourney?.status === "ATTENTION_REQUIRED",
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: DistressChatMessage = {
          id: `ai_${Date.now()}`,
          sender: "assistant",
          message: data.reply,
          timestamp: new Date().toISOString(),
          analysis: data.shouldShowSOSPrompt ? {
            riskLevel: "CRITICAL",
            urgency: "HIGH",
            signals: ["Distress cue detected", "Heightened caution required"],
            recommendedActions: [
              "Head directly toward the nearest open, well-lit commercial business",
              "Trigger Emergency SOS to ping your trusted contacts immediately",
              "Call 112/911 if in imminent physical danger",
            ],
            safeAdvice: data.reply,
            shouldTriggerSOSPrompt: true,
          } : undefined,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      const fallbackAiMsg: DistressChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "assistant",
        message: "Stay on illuminated main corridors, keep moving toward active businesses, and tap 'I'm Safe' or trigger SOS if in danger.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[560px] rounded-2xl glass-panel-elevated border border-slate-800 overflow-hidden">
      
      {/* Header */}
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
          SAFETY ADVISORY
        </span>
      </div>

      {/* Safety Advisory Disclaimer */}
      <div className="px-3 py-1.5 bg-indigo-950/40 border-b border-indigo-500/20 text-[10px] text-indigo-300 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
        <span>Advisory assistant • Never guarantees safety • Does not replace 911 / 112 services.</span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        
        {/* Quick Safety Queries */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Suggested Safety Questions:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SAFETY_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-left text-[11px] px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 text-slate-300 hover:text-indigo-200 transition-colors"
              >
                &ldquo;{q}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none space-y-2"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-line">{msg.message}</p>
              
              {msg.analysis && (
                <div className="mt-2 pt-2 border-t border-slate-800 space-y-2">
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
                      className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 mt-1 shadow-md shadow-rose-600/30 animate-pulse"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Trigger Emergency SOS Beacon Now</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && <div className="text-xs text-slate-400 italic">GuardianAI Safety Assistant is analyzing...</div>}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
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
            placeholder="Ask about your risk score, or describe your situation..."
            className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
