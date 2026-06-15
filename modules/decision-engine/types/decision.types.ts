/**
 * Decision Engine types.
 * Repository: 055_DECISION_ENGINE.md (Official — adopted 2026-06-12)
 * All decision IDs, categories, priorities, and status values from 055.
 */

// ── Decision IDs (055: DECISION IDENTIFIERS) ──────────────────────────────

export const DECISION_IDS = {
  INCREASE_CAMPAIGN_BUDGET: "DEC-001",
  REDUCE_CAMPAIGN_BUDGET:   "DEC-002",
  PAUSE_CAMPAIGN:           "DEC-003",
  PURCHASE_INVENTORY:       "DEC-004",
  REDUCE_INVENTORY_PURCHASE:"DEC-005",
  LIQUIDATE_DEAD_STOCK:     "DEC-006",
  REVIEW_SHIPPING:          "DEC-007",
  REVIEW_GOVERNORATE:       "DEC-008",
  REDUCE_EXPENSES:          "DEC-009",
  EXECUTIVE_REVIEW:         "DEC-010",
} as const;

export type DecisionId = (typeof DECISION_IDS)[keyof typeof DECISION_IDS];

// ── Decision categories (055: DECISION TYPES) ─────────────────────────────

export type DecisionCategory =
  | "MARKETING"
  | "INVENTORY"
  | "SHIPPING"
  | "FINANCIAL"
  | "OPERATIONAL"
  | "EXECUTIVE";

// ── Priority (055: DECISION PRIORITY) ────────────────────────────────────

export type DecisionPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

// ── Status (055: DECISION STATUS) ─────────────────────────────────────────

export type DecisionStatus =
  | "OPEN" | "ACKNOWLEDGED" | "ACCEPTED" | "REJECTED"
  | "EXECUTING" | "COMPLETED" | "EXPIRED";

// ── Decision record (055: DECISION STRUCTURE + DECISION INSPECTOR) ─────────

export interface DecisionRecord {
  decisionId: DecisionId;
  decisionName: string;
  category: DecisionCategory;
  priority: DecisionPriority;
  status: DecisionStatus;
  triggeredByRule: string;          // e.g. "DEC-RULE-002"
  reason: string;
  affectedEntity: string;           // e.g. "Campaign: META-CAMP-001"
  recommendedAction: string;
  expectedImpact: ExpectedImpact;
  confidence: number;               // 0–1
  opportunityScore: number;         // from SCORE-008
  riskScore: number;                // from SCORE-009
  supportingScores: string[];       // SCORE-xxx IDs
  supportingKpis: string[];         // KPI-xxx IDs
  supportingFormulaIds: string[];   // FIN-001 etc.
  createdAt: string;
  expiresAt: string;
  storeId: string;
}

// ── Expected Impact (055: EXPECTED IMPACT) ────────────────────────────────
// "The estimate is advisory only. It SHALL NEVER modify business calculations." (055)

export interface ExpectedImpact {
  revenueImpact: string;
  profitImpact: string;
  cashFlowImpact: string;
  inventoryImpact: string;
  operationalImpact: string;
  confidence: number;               // 0–1
  // UI Polish 3: impact badge
  impactType: "saving" | "profit" | "cash" | "revenue";
  impactLabel: string;
  impactValue: string;
}

// ── Alert (055: ALERT GENERATION) ────────────────────────────────────────

export type AlertType = "DASHBOARD" | "SMART_ALERT" | "AI_DAILY_BRIEF" | "NOTIFICATION";

export interface DecisionAlert {
  alertId: string;
  decisionId: DecisionId;
  alertType: AlertType;
  priority: DecisionPriority;
  title: string;
  message: string;
  category: DecisionCategory;
  scoreRef?: string;
  kpiRef?: string;
  createdAt: string;
  dismissed: boolean;
}

// ── Decision Matrix (055: DECISION MATRIX) ────────────────────────────────

export interface MatrixResult {
  decision: string;
  priority: DecisionPriority;
}

export function applyDecisionMatrix(
  opportunityScore: number,
  riskScore: number,
): MatrixResult {
  if (opportunityScore >= 90 && riskScore <= 30) return { decision: "Increase Budget",           priority: "CRITICAL" };
  if (opportunityScore >= 90 && riskScore > 30)  return { decision: "Review Before Scaling",     priority: "HIGH"     };
  if (opportunityScore >= 70 && riskScore <= 40) return { decision: "Increase Budget Gradually", priority: "HIGH"     };
  if (opportunityScore >= 70 && riskScore > 40)  return { decision: "Monitor Daily",              priority: "MEDIUM"  };
  if (opportunityScore >= 50 && riskScore <= 50) return { decision: "Maintain Current Strategy", priority: "MEDIUM"  };
  if (opportunityScore < 50  && riskScore > 70)  return { decision: "Pause Campaign",             priority: "CRITICAL"};
  if (opportunityScore < 40  && riskScore > 80)  return { decision: "Immediate Executive Review", priority: "CRITICAL"};
  return { decision: "Monitor",                  priority: "LOW" };
}
