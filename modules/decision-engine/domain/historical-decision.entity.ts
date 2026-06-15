/**
 * Historical Decision entity.
 * Repository Consistency Pass 2026-06-12 — Task 3
 *
 * "Decision history SHALL be immutable." (Task 3)
 * "Every historical decision SHALL preserve: Decision Rule, Trigger timestamp,
 *  Supporting Scores, Supporting KPIs, Supporting Formula IDs, Expected Impact,
 *  Current Status, Status history." (Task 3)
 * "BR-DEC-002: Decision Engine SHALL NEVER execute recommendations automatically."
 */

import type { DecisionId, DecisionCategory, DecisionPriority, DecisionStatus } from "./decision.types";
import type { StructuredImpact } from "./impact.model";

// ── Status transition record (immutable audit trail) ──────────────────────

export interface DecisionStatusTransition {
  fromStatus: DecisionStatus | null;
  toStatus: DecisionStatus;
  transitionedAt: string;       // ISO timestamp — immutable
  transitionedBy: string;       // userId — immutable
  reason?: string;
}

// ── Decision lifecycle (Task 3: full documented lifecycle) ────────────────

export const DECISION_LIFECYCLE: Record<DecisionStatus, DecisionStatus[]> = {
  OPEN:         ["ACKNOWLEDGED", "REJECTED", "EXPIRED"],
  ACKNOWLEDGED: ["ACCEPTED", "REJECTED", "EXPIRED"],
  ACCEPTED:     ["EXECUTING", "REJECTED"],
  REJECTED:     ["ARCHIVED"],
  EXECUTING:    ["COMPLETED", "REJECTED"],
  COMPLETED:    ["ARCHIVED"],
  EXPIRED:      ["ARCHIVED"],
  ARCHIVED:     [],   // terminal state
};

export function isValidTransition(from: DecisionStatus, to: DecisionStatus): boolean {
  return (DECISION_LIFECYCLE[from] ?? []).includes(to);
}

// ── Historical Decision record (immutable once created) ───────────────────

export interface HistoricalDecisionRecord {
  /** Unique ID — immutable */
  id: string;
  storeId: string;
  decisionId: DecisionId;
  decisionName: string;
  category: DecisionCategory;
  priority: DecisionPriority;

  /** The specific rule that triggered this decision — immutable */
  triggeredByRule: string;                // e.g. "DEC-RULE-003"
  triggeredAt: string;                    // ISO timestamp — immutable
  reason: string;                         // rule explanation — immutable

  /** Affected entity — immutable */
  affectedEntity: string;

  /** Recommended action — immutable */
  recommendedAction: string;

  /** Structured impact model (Task 5) — immutable */
  structuredImpact: StructuredImpact;

  /** Confidence at time of creation — immutable */
  confidence: number;
  opportunityScore: number;
  riskScore: number;

  /** Supporting evidence — immutable */
  supportingScores: string[];             // SCORE-xxx IDs
  supportingKpis: string[];               // KPI-xxx IDs
  supportingFormulaIds: string[];         // FIN-xxx, OPS-xxx etc.

  /** Current status (only mutable field) */
  currentStatus: DecisionStatus;

  /** Full status history — append-only */
  statusHistory: DecisionStatusTransition[];

  /** Expiry — computed at creation */
  expiresAt: string;

  /** Archive timestamp */
  archivedAt?: string;

  /** Formula version at time of calculation — immutable */
  formulaVersion: string;
}
