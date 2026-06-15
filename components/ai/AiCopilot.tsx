"use client";
/**
 * AI Copilot UI scaffold.
 * Repository: 011_AI_ENGINE.md v2.0.0 — DASHBOARD ASSISTANT, NATURAL LANGUAGE QUERIES
 *
 * "AI explains, summarizes, answers questions, and assists." (011)
 * "AI must NOT generate scores or recommendations independently." (011)
 *
 * All answers come from /api/v1/ai/query → AI Engine → Score/Decision Engine outputs.
 * UI is a scaffold: displays answers from the explanation layer.
 * Real LLM integration wires in later without changing this component's API contract.
 */

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: Array<{ type: string; id: string; label: string; value?: string }>;
  confidence?: number;
  isLoading?: boolean;
  timestamp: string;
}

interface AiCopilotProps {
  storeId: string;
  locale?: "en" | "ar";
  isOpen: boolean;
  onClose: () => void;
  onInspect?: (entityId: string) => void;
}

const SUGGESTED_QUESTIONS = [
  "Why did profit decrease this month?",
  "Which campaigns should I pause?",
  "What is my inventory health status?",
  "Explain my Business Health Score.",
  "What actions does the Decision Engine recommend?",
];

export function AiCopilot({ storeId, locale = "en", isOpen, onClose, onInspect }: AiCopilotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial greeting on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm your AI Business Copilot. I explain Score Engine results, narrate Decision Engine recommendations, and answer questions about your business performance using approved engine outputs.\n\nI do not generate scores or recommendations independently — those come from the Score Engine and Decision Engine.",
        timestamp: new Date().toISOString(),
      }]);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || sending) return;
    setSending(true);
    setInput("");

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    const loadingMsg: ChatMessage = {
      id: `l-${Date.now()}`,
      role: "assistant",
      content: "",
      isLoading: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);

    try {
      const res = await fetch("/api/v1/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, message: text, locale }),
      });
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.success
          ? data.data.answer
          : "I'm having trouble accessing engine data right now. Please check that Score Engine and Decision Engine have run for your store.",
        references: data.data?.references ?? [],
        confidence: data.data?.confidence,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev.filter(m => !m.isLoading), assistantMsg]);
    } catch {
      setMessages(prev => [...prev.filter(m => !m.isLoading), {
        id: `e-${Date.now()}`, role: "assistant",
        content: "Connection error. Please try again.",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex flex-col bg-white shadow-2xl border-l border-gray-200 w-80 sm:w-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-indigo-600 text-white">
        <div>
          <h3 className="font-semibold text-sm">AI Business Copilot</h3>
          <p className="text-xs opacity-75">Powered by Score + Decision Engine outputs</p>
        </div>
        <button onClick={onClose} className="opacity-75 hover:opacity-100 text-xl">×</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn(
              "rounded-2xl px-3 py-2 text-sm max-w-[85%]",
              msg.role === "user"
                ? "bg-indigo-600 text-white rounded-tr-none"
                : "bg-gray-100 text-gray-800 rounded-tl-none",
            )}>
              {msg.isLoading ? (
                <div className="flex gap-1 py-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* References */}
                  {msg.references && msg.references.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.references.slice(0, 4).map(ref => (
                        <button
                          key={ref.id}
                          onClick={() => onInspect?.(ref.id)}
                          className="rounded bg-white/20 px-1.5 py-0.5 text-xs hover:bg-white/30 border border-white/30"
                          title={`Open ${ref.label} in Formula Inspector`}
                        >
                          {ref.id}
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.confidence !== undefined && (
                    <p className="mt-1 text-xs opacity-60">Confidence: {msg.confidence}%</p>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions (show when < 3 messages) */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 space-y-1">
          <p className="text-xs text-gray-400 font-medium">Suggested questions</p>
          {SUGGESTED_QUESTIONS.slice(0, 3).map(q => (
            <button key={q} onClick={() => sendMessage(q)}
              className="w-full text-left rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 transition-colors">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask about your business..."
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            disabled={sending}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || sending}
            className="rounded-xl bg-indigo-600 text-white px-3 py-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-40"
          >
            →
          </button>
        </div>
        <p className="text-xs text-gray-300 mt-1.5 text-center">
          AI narrates engine outputs only · No independent calculations
        </p>
      </div>
    </div>
  );
}
