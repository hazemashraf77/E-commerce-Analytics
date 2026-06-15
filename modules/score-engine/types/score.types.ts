/**
 * Score Engine types.
 * Repository: 054_SCORE_CATALOG.md (Official — adopted 2026-06-12)
 *
 * All weight tables, score IDs, and grade thresholds are sourced directly
 * from 054_SCORE_CATALOG. Nothing is invented (CP-002).
 *
 * SCORE-001 OFFICIAL RESOLUTION (Repository Consistency Pass 2026-06-12):
 * ────────────────────────────────────────────────────────────────────────
 * 054_SCORE_CATALOG lists "Business Stability 10%" as an 8th component for
 * SCORE-001, but the prior 7 components already sum to 100%, creating a
 * documentation ambiguity of Σ=110%.
 *
 * Business owner resolution: Business Stability SHALL remain an official
 * Repository component. It is marked RESERVED / INACTIVE in v1.0.
 * It does NOT participate in SCORE-001 calculation in v1.0.
 * It SHALL be activated in a future version when sufficient data exists.
 *
 * Active SCORE-001 v1.0 weight table: 7 components, Σ = 100%.
 * Business Stability: reserved, weight = 0.00 in v1.0, listed separately.
 * ────────────────────────────────────────────────────────────────────────
 */

// ── Score IDs (054: RESERVED SCORE IDS) ───────────────────────────────────

export const SCORE_IDS = {
  BUSINESS_HEALTH:          "SCORE-001",
  PRODUCT:                  "SCORE-002",
  CAMPAIGN:                 "SCORE-003",
  GOVERNORATE:              "SCORE-004",
  SHIPPING_PERFORMANCE:     "SCORE-005",
  INVENTORY_HEALTH:         "SCORE-006",
  MARKETING_HEALTH:         "SCORE-007",
  OPPORTUNITY:              "SCORE-008",
  RISK:                     "SCORE-009",
} as const;

export type ScoreId = (typeof SCORE_IDS)[keyof typeof SCORE_IDS];

// ── Grade thresholds (054: SCORE GRADES) ──────────────────────────────────

export type ScoreGradeLabel = "EXCELLENT" | "VERY_GOOD" | "GOOD" | "AVERAGE" | "POOR" | "CRITICAL";

export function deriveGrade(score: number): ScoreGradeLabel {
  if (score >= 90) return "EXCELLENT";
  if (score >= 80) return "VERY_GOOD";
  if (score >= 70) return "GOOD";
  if (score >= 60) return "AVERAGE";
  if (score >= 50) return "POOR";
  return "CRITICAL";
}

// ── Trend / Stability (054: SCORE STABILITY) ──────────────────────────────

export type ScoreTrend = "STABLE" | "IMPROVING" | "DECLINING" | "VOLATILE" | "CRITICAL_DECLINE";
export type ScoreConfidence = "HIGH" | "MEDIUM" | "LOW";

export function deriveTrend(current: number, previous: number): ScoreTrend {
  const delta = current - previous;
  if (Math.abs(delta) < 2) return "STABLE";
  if (delta >= 10) return "IMPROVING";
  if (delta <= -10) return "CRITICAL_DECLINE";
  if (delta > 0) return "IMPROVING";
  return "DECLINING";
}

// ── Component (one weighted factor in a score) ────────────────────────────

export interface ScoreComponent {
  name: string;
  inputValue: number;       // the raw KPI/health value (0–100)
  normalizedValue: number;  // after applying normalization curve
  weight: number;           // 0.0–1.0, weights must sum to 1.0
  contribution: number;     // normalizedValue × weight × 100
}

// ── Score input types (what each score consumes from KPI/Analytics) ────────

export interface HealthScoreInputs {
  profitMargin: number;           // 0–1
  deliveryRate: number;           // 0–1
  returnRate: number;             // 0–1
  inventoryTurnover: number;      // numeric
  marketingRoi: number;           // numeric
  cashPosition: number;           // EGP
  settlementCompletionRate: number; // 0–1
  trendDelta: number;             // signed: positive = improving
  // Computed health sub-scores (0–100) injected after normalization
  profitHealth?: number;
  cashHealth?: number;
  deliveryHealth?: number;
  inventoryHealth?: number;
  marketingHealth?: number;
  shippingHealth?: number;
  settlementHealth?: number;
  returnHealth?: number;
  refusalHealth?: number;
}

// ── Score output (054: SCORE STRUCTURE + API CONTRACT) ────────────────────

export interface ScoreResult {
  scoreId: ScoreId;
  scoreName: string;
  scoreNameAr: string;
  score: number;                      // 0–100, clamped
  grade: ScoreGradeLabel;
  trend: ScoreTrend;
  stability: ScoreTrend;
  confidence: ScoreConfidence;
  confidencePct: number;              // 0–100
  delta: number;                      // vs previous score
  components: ScoreComponent[];
  recommendedActions: string[];
  formulaVersion: string;             // "1.0.0"
  calculationVersion: string;
  lastUpdated: string;
  dataWindow: string;                 // e.g. "Last 30 days"
}

// ── Reserved / Inactive components (documented but not yet active in v1.0) ──
// These SHALL NOT be removed. They SHALL be activated in future versions.

export const RESERVED_INACTIVE_COMPONENTS: Record<ScoreId, Array<{ name: string; reservedWeight: number; activeVersion: string; reason: string }>> = {
  "SCORE-001": [
    {
      name: "Business Stability",
      reservedWeight: 0.10,
      activeVersion: "2.0.0",
      reason: "Reserved per 054_SCORE_CATALOG. Inactive v1.0 — requires ≥90 days of historical data for reliable stability measurement. Activation planned for v2.0.0 when sufficient historical snapshots exist.",
    },
  ],
  "SCORE-002": [], "SCORE-003": [], "SCORE-004": [], "SCORE-005": [],
  "SCORE-006": [], "SCORE-007": [], "SCORE-008": [], "SCORE-009": [],
};

// ── Weight tables (054: COMPONENT WEIGHTS — one table per score) ──────────

export const SCORE_WEIGHTS: Record<ScoreId, Array<{ name: string; weight: number }>> = {
  // SCORE-001: Business Health — v1.0 ACTIVE WEIGHTS (Σ = 100%)
  // Business Stability is RESERVED / INACTIVE in v1.0 (see RESERVED_INACTIVE_COMPONENTS).
  // It does NOT participate in calculation until activated in v2.0.0.
  // Official Repository resolution: Repository Consistency Pass 2026-06-12.
  "SCORE-001": [
    { name: "Profit Health",      weight: 0.30 },
    { name: "Cash Health",        weight: 0.15 },
    { name: "Delivery Health",    weight: 0.15 },
    { name: "Inventory Health",   weight: 0.10 },
    { name: "Marketing Health",   weight: 0.10 },
    { name: "Shipping Health",    weight: 0.10 },
    { name: "Settlement Health",  weight: 0.10 },
    // Business Stability: RESERVED, weight=0.00 in v1.0. DO NOT REMOVE.
    // Activate by moving here with weight=0.10 and reducing Shipping Health to 0.00.
  ],
  // SCORE-002: Product Score (054)
  "SCORE-002": [
    { name: "Profit Health",      weight: 0.30 },
    { name: "Delivery Health",    weight: 0.20 },
    { name: "Marketing Health",   weight: 0.15 },
    { name: "Inventory Health",   weight: 0.10 },
    { name: "Return Health",      weight: 0.10 },
    { name: "Trend Score",        weight: 0.10 },
    { name: "Business Stability", weight: 0.05 },
  ],
  // SCORE-003: Campaign Score (054)
  "SCORE-003": [
    { name: "Marketing Health",   weight: 0.25 },
    { name: "Profit Health",      weight: 0.25 },
    { name: "Delivery Health",    weight: 0.15 },
    { name: "Return Health",      weight: 0.10 },
    { name: "Trend Score",        weight: 0.10 },
    { name: "Budget Stability",   weight: 0.10 },
    { name: "Business Stability", weight: 0.05 },
  ],
  // SCORE-004: Governorate Score (054)
  "SCORE-004": [
    { name: "Delivery Health",    weight: 0.35 },
    { name: "Profit Health",      weight: 0.20 },
    { name: "Shipping Health",    weight: 0.20 },
    { name: "Return Health",      weight: 0.15 },
    { name: "Trend Score",        weight: 0.10 },
  ],
  // SCORE-005: Shipping Performance Score (054)
  "SCORE-005": [
    { name: "Delivery Health",        weight: 0.35 },
    { name: "Shipping Cost Health",   weight: 0.20 },
    { name: "Return Shipping Health", weight: 0.15 },
    { name: "Exchange Shipping",      weight: 0.10 },
    { name: "Shipping Trend",         weight: 0.10 },
    { name: "Business Stability",     weight: 0.10 },
  ],
  // SCORE-006: Inventory Health Score (054)
  "SCORE-006": [
    { name: "Inventory Turnover", weight: 0.30 },
    { name: "FIFO Age",           weight: 0.20 },
    { name: "Dead Stock",         weight: 0.20 },
    { name: "Stock Availability", weight: 0.15 },
    { name: "Low Stock",          weight: 0.10 },
    { name: "Trend",              weight: 0.05 },
  ],
  // SCORE-007: Marketing Health Score (054)
  "SCORE-007": [
    { name: "True CPA Health",     weight: 0.30 },
    { name: "Delivered ROAS",      weight: 0.25 },
    { name: "Profit Margin",       weight: 0.20 },
    { name: "Delivery Health",     weight: 0.15 },
    { name: "Trend",               weight: 0.10 },
  ],
  // SCORE-008: Opportunity Score (054)
  "SCORE-008": [
    { name: "Product Score",       weight: 0.25 },
    { name: "Campaign Score",      weight: 0.20 },
    { name: "Marketing Health",    weight: 0.20 },
    { name: "Growth Velocity",     weight: 0.15 },
    { name: "Inventory Availability", weight: 0.10 },
    { name: "Trend",               weight: 0.10 },
  ],
  // SCORE-009: Risk Score (054)
  "SCORE-009": [
    { name: "Profit Trend",        weight: 0.25 },
    { name: "Return Health",       weight: 0.20 },
    { name: "Refusal Health",      weight: 0.15 },
    { name: "Inventory Health",    weight: 0.10 },
    { name: "Marketing Health",    weight: 0.10 },
    { name: "Shipping Health",     weight: 0.10 },
    { name: "Cash Health",         weight: 0.05 },
    { name: "Settlement Health",   weight: 0.05 },
  ],
};
