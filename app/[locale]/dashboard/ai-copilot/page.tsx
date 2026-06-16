
"use client";
/**
 * AI Copilot — 011_AI_ENGINE.md v2.0.0
 * SCAFFOLD: Rule-based deterministic outputs. No real LLM. No external API calls.
 * AI narrates Score Engine + Decision Engine outputs only.
 */
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MOCK_SCORES, MOCK_DECISIONS, MOCK_SMART_ALERTS } from "@/lib/dashboard/mock-data";
import { MOCK_PRODUCT_INTELLIGENCE } from "@/modules/formula-engine";
import { cn } from "@/lib/utils";

interface Msg { id: string; role: "user"|"assistant"; text: string; refs?: string[]; ts: string; }

const SUGGESTED = [
  "What is my True Profit this month?",
  "Which campaigns should I pause?",
  "Which products have the best PPAP?",
  "Explain my Business Health Score.",
  "What inventory should I reorder?",
  "What are the top risks right now?",
];

function ruleAnswer(q: string): { text: string; refs: string[] } {
  const lq = q.toLowerCase();
  const biz = MOCK_SCORES.find(s => s.scoreId === "SCORE-001");
  const mkt = MOCK_SCORES.find(s => s.scoreId === "SCORE-007");
  const inv = MOCK_SCORES.find(s => s.scoreId === "SCORE-006");
  const topProduct = [...MOCK_PRODUCT_INTELLIGENCE].sort((a,b) => b.ppap! - a.ppap!)[0];
  const worstCpa = [...MOCK_PRODUCT_INTELLIGENCE].sort((a,b) => (b.trueCpa??0) - (a.trueCpa??0))[0];

  if (lq.includes("true profit") || lq.includes("profit")) {
    return { text: `True Profit (TRUE-001) this period is EGP 8,190 — a 21.9% margin on EGP 84,750 revenue. This is computed as: Revenue − COGS − Packaging − Shipping − Return Shipping − Ads − Refunds − Compensations − Variable & Fixed Expenses. It is lower than Gross Profit (EGP 38,200, FIN-003) because all operating costs are included.`, refs: ["TRUE-001","FIN-001","FIN-003","FIN-002"] };
  }
  if (lq.includes("campaign") || lq.includes("pause")) {
    const d = MOCK_DECISIONS.find(d => d.category === "Marketing");
    return { text: `Decision Engine flagged ${d?.decisionId ?? "DEC-003"} with HIGH priority: "${d?.reason ?? "Campaign Score < 60"}." Recommended action: "${d?.recommendedAction ?? "Pause underperforming campaigns."}." Confidence: ${d ? Math.round(d.confidence*100) : 74}%. Note: I am narrating Decision Engine output — I do not generate recommendations independently.`, refs: ["DEC-003","SCORE-003","SCORE-007","MKT-002"] };
  }
  if (lq.includes("ppap") || lq.includes("best") || lq.includes("top product")) {
    return { text: `Best PPAP (MKT-013 = True Profit ÷ Ad Spend) is ${topProduct?.productName} at ${(topProduct?.ppap??0).toFixed(2)}×. This means each EGP spent on advertising for this product returns EGP ${(topProduct?.ppap??0).toFixed(2)} in True Profit. Products with PPAP < 1 are destroying profit through advertising.`, refs: ["MKT-013","TRUE-001","FIN-001"] };
  }
  if (lq.includes("business health") || lq.includes("health score")) {
    return { text: `Business Health (SCORE-001) is ${biz?.score ?? 74}/100 — "${biz?.grade ?? "Good"}". Trend: ${biz?.trend ?? "stable"} (${biz?.delta ?? 2 >= 0 ? "+" : ""}${biz?.delta ?? 2} pts). Key insight: Marketing Health (SCORE-007) at ${mkt?.score ?? 65}/100 is declining — CPA is rising. Inventory Health (SCORE-006) at ${inv?.score ?? 63}/100 — 3 products near stockout. I narrate Score Engine outputs only. I do not generate scores independently.`, refs: ["SCORE-001","SCORE-007","SCORE-006"] };
  }
  if (lq.includes("inventory") || lq.includes("reorder") || lq.includes("stock")) {
    const low = MOCK_PRODUCT_INTELLIGENCE.filter(p => p.inventoryStatus === "LOW_STOCK" || p.inventoryStatus === "OUT_OF_STOCK");
    const d = MOCK_DECISIONS.find(d => d.category === "Inventory");
    return { text: `Inventory Health (SCORE-006) is ${inv?.score ?? 63}/100. ${low.length} product(s) need attention: ${low.map(p=>p.sku).join(", ")}. Decision Engine recommends: "${d?.recommendedAction ?? "Purchase inventory within 3 days."}." Expected impact: "${d?.expectedImpact ?? "Prevent stockout."}" — ${d?.decisionId ?? "DEC-004"}.`, refs: ["SCORE-006","INV-004","INV-002","DEC-004"] };
  }
  if (lq.includes("risk")) {
    const risk = MOCK_SCORES.find(s => s.scoreId === "SCORE-009");
    return { text: `Risk Score (SCORE-009) is ${risk?.score ?? 38}/100 — "${risk?.grade ?? "critical"}" — up ${risk?.delta ?? 11} points. Main contributors: Inventory Health declining (SCORE-006: ${inv?.score ?? 63}/100), Marketing Health declining (SCORE-007: ${mkt?.score ?? 65}/100). Recommended: ${risk?.recommendedAction ?? "Monitor closely."}`, refs: ["SCORE-009","SCORE-006","SCORE-007"] };
  }
  return { text: `I can answer questions about: True Profit (TRUE-001), CPA/ROAS (MKT-002–013), Business Health (SCORE-001–009), Inventory (INV-001–005), and Decision Engine recommendations (DEC-001–010). I use deterministic rule-based outputs from Score Engine and Decision Engine. I do not use a real language model in this preview.`, refs: ["SCORE-001","TRUE-001","MKT-013"] };
}

const DAILY_BRIEF = {
  businessHealth: MOCK_SCORES.find(s => s.scoreId === "SCORE-001"),
  topRisk: MOCK_SCORES.find(s => s.scoreId === "SCORE-009"),
  topDecision: MOCK_DECISIONS.find(d => d.priority === "HIGH"),
  topProduct: [...MOCK_PRODUCT_INTELLIGENCE].sort((a,b) => b.trueProfit - a.trueProfit)[0],
};

export default function AiCopilotPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"brief"|"chat">("brief");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const send = (text: string) => {
    if (!text.trim() || sending) return;
    setSending(true);
    setInput("");
    const userMsg: Msg = { id: `u${Date.now()}`, role:"user", text, ts: new Date().toLocaleTimeString() };
    setMessages(m => [...m, userMsg]);
    setTimeout(() => {
      const { text: answer, refs } = ruleAnswer(text);
      setMessages(m => [...m, { id:`a${Date.now()}`, role:"assistant", text: answer, refs, ts: new Date().toLocaleTimeString() }]);
      setSending(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI Business Copilot</h1>
          <p className="text-xs text-gray-400">Rule-based preview · No LLM · Narrates Score Engine + Decision Engine outputs only</p>
        </div>
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs text-amber-700 font-semibold">
          ⚠ Scaffold Mode — Deterministic Rules Only
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["brief","chat"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === t ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}>
            {t === "brief" ? "📋 Daily Brief" : "💬 Chat"}
          </button>
        ))}
      </div>

      {tab === "brief" && (
        <div className="space-y-3">
          {/* Business health */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Business Pulse (narrating SCORE-001)</p>
            <p className="text-sm text-gray-800">Business Health is <span className="font-bold">{DAILY_BRIEF.businessHealth?.score ?? 74}/100</span> — {DAILY_BRIEF.businessHealth?.grade ?? "Good"}, trend {DAILY_BRIEF.businessHealth?.trend ?? "stable"}. {DAILY_BRIEF.businessHealth?.recommendedAction}</p>
          </div>
          {/* Top risk */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Top Risk (narrating SCORE-009)</p>
            <p className="text-sm text-red-800">Risk Score is <span className="font-bold">{DAILY_BRIEF.topRisk?.score ?? 38}/100</span> and climbing (+{DAILY_BRIEF.topRisk?.delta ?? 11} pts). {DAILY_BRIEF.topRisk?.recommendedAction}</p>
          </div>
          {/* Top decision */}
          {DAILY_BRIEF.topDecision && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold text-amber-600 uppercase mb-2">Priority Action ({DAILY_BRIEF.topDecision.decisionId})</p>
              <p className="text-sm text-amber-900 font-semibold">{DAILY_BRIEF.topDecision.decisionName}</p>
              <p className="text-xs text-amber-800 mt-1">{DAILY_BRIEF.topDecision.recommendedAction}</p>
              <p className="text-xs text-amber-600 mt-1">Impact: {DAILY_BRIEF.topDecision.expectedImpact}</p>
            </div>
          )}
          {/* Top product */}
          {DAILY_BRIEF.topProduct && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-xs font-semibold text-green-600 uppercase mb-2">Top Product by True Profit (TRUE-001)</p>
              <p className="text-sm text-green-900 font-semibold">{DAILY_BRIEF.topProduct.productName}</p>
              <p className="text-xs text-green-700 mt-1">True Profit: EGP {DAILY_BRIEF.topProduct.trueProfit.toLocaleString()} · PPAP: {(DAILY_BRIEF.topProduct.ppap??0).toFixed(2)}× · Delivered: {DAILY_BRIEF.topProduct.ordersDelivered}</p>
            </div>
          )}
          <p className="text-xs text-gray-400 italic text-center">Daily Brief narrates Score + Decision Engine outputs. AI does not generate scores or recommendations independently.</p>
        </div>
      )}

      {tab === "chat" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{height:"60vh"}}>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-medium">Try a question:</p>
                {SUGGESTED.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="block w-full text-left rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className={cn("flex", m.role==="user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-xs rounded-2xl px-3 py-2 text-sm", m.role==="user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none")}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.refs && m.refs.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {m.refs.map(r => <span key={r} className="rounded bg-white/20 px-1 py-0.5 text-xs font-mono">{r}</span>)}
                    </div>
                  )}
                  <p className="text-xs opacity-50 mt-1">{m.ts}</p>
                </div>
              </div>
            ))}
            {sending && <div className="flex justify-start"><div className="bg-gray-100 rounded-2xl px-3 py-2 text-sm text-gray-400">Analyzing engine outputs…</div></div>}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t border-gray-100 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==="Enter" && !e.shiftKey && send(input)}
              placeholder="Ask about True Profit, CPA, ROAS, PPAP, health scores…"
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              disabled={sending} />
            <button onClick={() => send(input)} disabled={!input.trim()||sending}
              className="rounded-xl bg-indigo-600 text-white px-4 text-sm font-medium hover:bg-indigo-700 disabled:opacity-40">→</button>
          </div>
          <p className="text-center text-xs text-gray-300 pb-2">Rule-based scaffold · References Score Engine + Decision Engine outputs</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[{h:"/en/dashboard",l:"← Executive"},{h:"/en/dashboard/decision-center",l:"Decision Center"},{h:"/en/dashboard/formula-inspector",l:"ƒ Formulas"}].map(l=>(
          <Link key={l.h} href={l.h} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">{l.l}</Link>
        ))}
      </div>
    </div>
  );
}
