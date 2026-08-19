"use client";

import React, { useState, useRef, useEffect } from "react";
import { DistressChatMessage, DistressAnalysisResult } from "@/types";
import { useGuardian } from "@/lib/store/demo-context";
import { 
  Sparkles, 
  Send, 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  CornerDownLeft,
  Bot,
  User,
  ShieldCheck
} from "lucide-react";

interface DistressChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_DISTRESS_QUERIES = [
  "Someone has been following me for 2 blocks and I'm alone.",
  "I'm stranded on an unlit street and feel uncomfortable.",
  "My rideshare driver took an unexpected detour into a dark lane.",
  "There's an aggressive group loitering ahead on my sidewalk.",
];

export function DistressChatSheet({ isOpen, onClose }: DistressChatSheetProps) {
  const { triggerSOS, activeJourney, currentCoords } = useGuardian();

  const [messages, setMessages] = useState<DistressChatMessage[]>([
    {
      id: "msg_welcome",
      sender: "assistant",
      message: "Hello, I am your GuardianAI Safety Intelligence Assistant. If you feel unsafe or notice suspicious activity along your journey, tell me what you are experiencing.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
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
      const res = await fetch("/api/ai/distress-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          journeyContext: {
            currentCoords,
            destinationName: activeJourney?.destinationName,
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
      } else {
        throw new Error("Failed response");
      }
    } catch (err) {
      const fallbackAiMsg: DistressChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "assistant",
        message: "Stay calm and keep moving towards illuminated, populated premises. Stay on well-lit main roads and consider sharing your live status with trusted contacts.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md h-full bg-slate-950 border-l border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 glass-panel flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">AI Safety Assistant</h3>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Contextual distress reasoning & safe actions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Bar */}
        <div className="px-4 py-2 bg-indigo-950/40 border-b border-indigo-500/20 text-[10px] text-indigo-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 text-indigo-400" />
          <span>GuardianAI is an advisory assistant and does NOT replace emergency services.</span>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Quick Prompts */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Quick Safety Questions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_DISTRESS_QUERIES.map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(query)}
                  className="text-left text-[11px] p-2 rounded-lg bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-200 transition-colors"
                >
                  &quot;{query}&quot;
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-semibold">
                  {msg.sender === "user" ? (
                    <span>You</span>
                  ) : (
                    <span className="flex items-center gap-1 text-indigo-400">
                      <Bot className="w-3 h-3" /> GuardianAI
                    </span>
                  )}
                </div>

                <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>

                {/* AI Structured Analysis Box */}
                {msg.analysis && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2.5">
                    
                    {/* Urgency & Risk Tag */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Urgency Level:</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        msg.analysis.urgency === "IMMEDIATE" || msg.analysis.urgency === "HIGH"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}>
                        {msg.analysis.urgency}
                      </span>
                    </div>

                    {/* Recommended Safe Actions */}
                    {msg.analysis.recommendedActions && msg.analysis.recommendedActions.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                          Immediate Safe Actions:
                        </span>
                        <div className="space-y-1">
                          {msg.analysis.recommendedActions.map((action, aIdx) => (
                            <div key={aIdx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SOS Trigger Prompt if Urgency is High */}
                    {msg.analysis.shouldTriggerSOSPrompt && (
                      <button
                        onClick={() => {
                          onClose();
                          triggerSOS("distress_ai_prompt");
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-rose-600/40"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Trigger One-Tap Emergency SOS</span>
                      </button>
                    )}

                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 bg-slate-900 rounded-2xl border border-slate-800 w-24">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 glass-panel">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Describe your safety situation..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
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
    </div>
  );
}
