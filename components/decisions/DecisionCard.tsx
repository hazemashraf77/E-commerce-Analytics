"use client";
/**
 * DecisionCard component.
 * Repository: 055_DECISION_ENGINE.md — BR-DEC-005: Dashboard displays Decision Engine outputs only.
 * BR-DEC-002: Dashboard NEVER auto-executes. User approval always required.
 */

import type { DecisionCardProps, DecisionPriority, DecisionStatus } from "@/types/dashboard.types";
import { cn } from "@/lib/utils";

const priorityConfig: Record<DecisionPriority, { label: string; bar: string; badge: string }> = {
  CRITICAL: { label: "CRITICAL", bar: "border-l-red-600",    badge: "bg-red-100 text-red-700" },
  HIGH:     { label: "HIGH",     bar: "border-l-orange-500", badge: "bg-orange-100 text-orange-700" },
  MEDIUM:   { label: "MEDIUM",   bar: "border-l-yellow-500", badge: "bg-yellow-100 text-yellow-700" },
  LOW:      { label: "LOW",      bar: "border-l-gray-400",   badge: "bg-gray-100 text-gray-600" },
};

const statusConfig: Record<DecisionStatus, string> = {
  OPEN: "text-blue-600", ACKNOWLEDGED: "text-purple-600", ACCEPTED: "text-green-600",
  REJECTED: "text-red-600", EXECUTING: "text-amber-600", COMPLETED: "text-gray-500", EXPIRED: "text-gray-300",
};

export function DecisionCard({
  decisionId, decisionName, category, priority, status, reason,
  recommendedAction, expectedImpact, confidence, opportunityScore, riskScore,
  supportingScores, supportingKpis, createdAt, expiresAt,
  onAccept, onReject, onInspect,
}: DecisionCardProps) {
  const pCfg = priorityConfig[priority];

  return (
    <div className={cn(
      "rounded-xl border-2 border-l-4 border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow",
      pCfg.bar,
    )}>
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-gray-400">{decisionId}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", pCfg.badge)}>
              {pCfg.label}
            </span>
            <span className="text-xs text-gray-400">{category}</span>
            <span className={cn("text-xs font-medium ml-auto", statusConfig[status])}>{status}</span>
          </div>
          <p className="text-sm font-semibold text-gray-800 mt-1">{decisionName}</p>
        </div>
        <button onClick={onInspect} className="rounded px-1.5 py-0.5 text-xs font-mono text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shrink-0" title="Decision Inspector">ƒ</button>
      </div>

      {/* Reason */}
      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{reason}</p>

      {/* Scores context */}
      <div className="flex gap-3 mb-2 text-xs">
        <span className="text-gray-500">Opportunity: <span className="font-semibold text-green-600">{opportunityScore}</span></span>
        <span className="text-gray-500">Risk: <span className="font-semibold text-red-600">{riskScore}</span></span>
        <span className="text-gray-500">Confidence: <span className="font-semibold">{Math.round(confidence * 100)}%</span></span>
      </div>

      {/* Recommended action */}
      <div className="bg-blue-50 rounded-lg p-2 mb-2">
        <p className="text-xs font-semibold text-blue-700 mb-0.5">Recommended Action</p>
        <p className="text-xs text-blue-600">{recommendedAction}</p>
      </div>

      {/* Expected impact */}
      <p className="text-xs text-gray-500 mb-3"><span className="font-medium">Expected Impact:</span> {expectedImpact}</p>

      {/* Supporting evidence */}
      <div className="flex flex-wrap gap-1 mb-3">
        {supportingScores.map(s => (
          <span key={s} className="rounded bg-purple-50 text-purple-700 px-1.5 py-0.5 text-xs border border-purple-200">{s}</span>
        ))}
        {supportingKpis.map(k => (
          <span key={k} className="rounded bg-indigo-50 text-indigo-700 px-1.5 py-0.5 text-xs border border-indigo-200">{k}</span>
        ))}
      </div>

      {/* Actions (BR-DEC-002: user approval required) */}
      {(status === "OPEN" || status === "ACKNOWLEDGED") && (
        <div className="flex gap-2">
          <button onClick={onAccept} className="flex-1 rounded-lg bg-green-600 text-white text-xs font-semibold py-1.5 hover:bg-green-700 transition-colors">Accept</button>
          <button onClick={onReject} className="flex-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold py-1.5 hover:bg-gray-200 transition-colors">Reject</button>
        </div>
      )}

      <p className="text-xs text-gray-300 mt-2">
        {new Date(createdAt).toLocaleString()}{expiresAt ? ` · Expires ${new Date(expiresAt).toLocaleDateString()}` : ""}
      </p>
    </div>
  );
}
