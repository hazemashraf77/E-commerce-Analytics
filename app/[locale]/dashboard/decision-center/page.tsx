
"use client";
/**
 * Decision Center — 055_DECISION_ENGINE.md
 * BR-DEC-002: User approval required. No auto-execution.
 * All decisions from Decision Engine deterministic outputs (no LLM).
 */
import { useState } from "react";
import Link from "next/link";
import { MOCK_DECISIONS, MOCK_SMART_ALERTS, MOCK_SCORES } from "@/lib/dashboard/mock-data";
import { SectionHeader } from "@/components/shared/index";
import { DecisionCard } from "@/components/decisions/DecisionCard";
import { SmartAlert } from "@/components/shared/index";
import { cn } from "@/lib/utils";

const riskScore = MOCK_SCORES.find(s => s.scoreId === "SCORE-009");
const oppScore  = MOCK_SCORES.find(s => s.scoreId === "SCORE-008");

const EXTENDED_DECISIONS = [
  ...MOCK_DECISIONS,
  {
    decisionId:"DEC-001", decisionName:"Scale Meta Campaign", category:"Marketing", priority:"MEDIUM", status:"OPEN",
    reason:"Campaign MKT-011 delivers True ROAS >1.5 for 3 consecutive weeks. Opportunity to scale profitably.",
    recommendedAction:"Increase daily budget by 30%. Monitor CPA daily for 7 days.",
    expectedImpact:"Est. +EGP 4,500 True Profit per month if delivery rate maintained.",
    confidence:0.68, opportunityScore:78, riskScore:42,
    supportingScores:["SCORE-003","SCORE-008"], supportingKpis:["KPI-MKT-002","KPI-MKT-003"],
    createdAt: new Date().toISOString(), expiresAt: new Date(Date.now()+14*86400000).toISOString(),
  },
];

const PRIORITY_ORDER: Record<string,number> = {CRITICAL:0,HIGH:1,MEDIUM:2,LOW:3};

export default function DecisionCenterPage() {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [accepted,  setAccepted]  = useState<string[]>([]);
  const [rejected,  setRejected]  = useState<string[]>([]);

  const sorted = [...EXTENDED_DECISIONS].sort((a,b)=>(PRIORITY_ORDER[a.priority]??9)-(PRIORITY_ORDER[b.priority]??9));
  const open     = sorted.filter(d => !accepted.includes(d.decisionId) && !rejected.includes(d.decisionId));
  const opp      = sorted.filter(d => d.opportunityScore >= 70);
  const risk     = sorted.filter(d => d.riskScore >= 50);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Decision Center</h1>
        <p className="text-xs text-gray-400">All decisions from Decision Engine · BR-DEC-002: User approval required · No auto-execution</p>
      </div>

      {/* Risk + Opportunity scores */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className={cn("rounded-xl border-2 p-4", (riskScore?.score ?? 0) >= 60 ? "border-red-300 bg-red-50" : "border-gray-200 bg-white")}>
          <p className="text-xs font-semibold text-gray-500 uppercase">Risk Score</p>
          <p className="text-3xl font-black mt-1 text-red-700">{riskScore?.score ?? "—"}<span className="text-lg font-normal text-gray-400">/100</span></p>
          <p className="text-xs text-indigo-500 font-mono mt-0.5">SCORE-009</p>
          <p className="text-xs text-gray-500 mt-1">{riskScore?.recommendedAction}</p>
        </div>
        <div className={cn("rounded-xl border-2 p-4", (oppScore?.score ?? 0) >= 70 ? "border-green-200 bg-green-50" : "border-gray-200 bg-white")}>
          <p className="text-xs font-semibold text-gray-500 uppercase">Opportunity Score</p>
          <p className="text-3xl font-black mt-1 text-green-700">{oppScore?.score ?? "—"}<span className="text-lg font-normal text-gray-400">/100</span></p>
          <p className="text-xs text-indigo-500 font-mono mt-0.5">SCORE-008</p>
          <p className="text-xs text-gray-500 mt-1">{oppScore?.recommendedAction}</p>
        </div>
      </div>

      {/* Alerts */}
      <div className="space-y-2">
        {MOCK_SMART_ALERTS.filter(a => !dismissed.includes(a.alertId)).map(alert => (
          <SmartAlert key={alert.alertId} {...(alert as any)}
            onDismiss={() => setDismissed(d=>[...d,alert.alertId])}
            onViewDecision={() => {}} />
        ))}
      </div>

      {/* Priority action queue */}
      <div>
        <SectionHeader title={`Priority Actions (${open.length})`} titleAr="الإجراءات ذات الأولوية" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {open.map(dec => (
            <div key={dec.decisionId} className={cn("rounded-xl border-2 bg-white p-4 space-y-2",
              dec.priority==="HIGH"||dec.priority==="CRITICAL" ? "border-red-200" : dec.priority==="MEDIUM" ? "border-amber-200" : "border-gray-200")}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{dec.decisionName}</p>
                  <p className="text-xs text-gray-400 font-mono">{dec.decisionId}</p>
                </div>
                <div className="flex gap-1">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold",
                    dec.priority==="HIGH"||dec.priority==="CRITICAL" ? "bg-red-100 text-red-700" : dec.priority==="MEDIUM" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600")}>
                    {dec.priority}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600">{dec.reason}</p>
              <p className="text-xs text-indigo-700 font-medium">→ {dec.recommendedAction}</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="rounded-lg bg-green-50 border border-green-100 p-1.5">
                  <p className="text-gray-500">Expected Impact</p>
                  <p className="font-semibold text-green-700 text-xs">{dec.expectedImpact}</p>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-1.5">
                  <p className="text-gray-500">Confidence</p>
                  <p className="font-semibold text-gray-800">{Math.round(dec.confidence * 100)}%</p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setAccepted(a=>[...a,dec.decisionId])}
                  className="flex-1 rounded-lg bg-green-600 text-white text-xs py-1.5 font-semibold hover:bg-green-700">Accept</button>
                <button onClick={() => setRejected(a=>[...a,dec.decisionId])}
                  className="flex-1 rounded-lg border border-gray-200 text-gray-600 text-xs py-1.5 hover:bg-gray-50">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accepted / Rejected summary */}
      {(accepted.length > 0 || rejected.length > 0) && (
        <div className="grid md:grid-cols-2 gap-3">
          {accepted.length > 0 && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-800 mb-2">✓ Accepted ({accepted.length})</p>
              {accepted.map(id => <p key={id} className="text-xs text-green-700">• {id}</p>)}
            </div>
          )}
          {rejected.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-600 mb-2">✕ Rejected ({rejected.length})</p>
              {rejected.map(id => <p key={id} className="text-xs text-gray-500">• {id}</p>)}
            </div>
          )}
        </div>
      )}

      {/* Architecture note */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-600">
        Decision Engine generates all recommendations via 15 documented rules (DEC-RULE-001–015). BR-DEC-001: Decision Engine never modifies business data. BR-DEC-002: Every action requires user approval.
      </div>

      <div className="flex flex-wrap gap-2">
        {[{h:"/en/dashboard",l:"← Executive"},{h:"/en/dashboard/formula-inspector",l:"ƒ Formulas"},{h:"/en/dashboard/ai-copilot",l:"AI Copilot"}].map(l=>(
          <Link key={l.h} href={l.h} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">{l.l}</Link>
        ))}
      </div>
    </div>
  );
}
