/**
 * Structured Impact Model.
 * Repository Consistency Pass 2026-06-12 — Task 5
 *
 * "Structured values SHALL become the canonical backend representation." (Task 5)
 * "Human-readable text MAY remain for UI." (Task 5)
 * "Expected Impact estimate is advisory only — SHALL NEVER modify business calculations." (055)
 */

export type ImpactDirection = "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "VARIABLE";
export type ImpactMagnitude = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NEGLIGIBLE";

// ── Single impact dimension ────────────────────────────────────────────────

export interface ImpactDimension {
  direction: ImpactDirection;
  magnitude: ImpactMagnitude;
  /** Estimated EGP value — null when not quantifiable */
  estimatedValue: number | null;
  /** Currency ISO 4217 — null when not monetary */
  currency: string | null;
  /** Time horizon: IMMEDIATE | SHORT_TERM | MEDIUM_TERM | LONG_TERM */
  horizon: "IMMEDIATE" | "SHORT_TERM" | "MEDIUM_TERM" | "LONG_TERM";
  /** Human-readable description for UI display */
  description: string;
}

// ── Full structured impact (Task 5: all 5 dimensions) ─────────────────────

export interface StructuredImpact {
  revenueImpact:     ImpactDimension;
  profitImpact:      ImpactDimension;
  cashImpact:        ImpactDimension;
  inventoryImpact:   ImpactDimension;
  operationalImpact: ImpactDimension;
  /** Overall confidence in the impact estimate (0–1) */
  confidence: number;
  /** UI-facing badge values (human-readable — Task 3 UI Polish) */
  impactType: "saving" | "profit" | "cash" | "revenue";
  impactLabel: string;
  impactValue: string;
}

// ── Helper builders ────────────────────────────────────────────────────────

export function dim(
  direction: ImpactDirection,
  magnitude: ImpactMagnitude,
  description: string,
  estimatedValue: number | null = null,
  horizon: ImpactDimension["horizon"] = "SHORT_TERM",
): ImpactDimension {
  return { direction, magnitude, estimatedValue, currency: estimatedValue !== null ? "EGP" : null, horizon, description };
}

// ── Canonical impact library (one entry per Decision ID) ─────────────────
// These are advisory estimates. They SHALL NOT feed into any financial formula.

export const DECISION_IMPACTS: Record<string, StructuredImpact> = {
  "DEC-001": {
    revenueImpact:     dim("POSITIVE",  "HIGH",   "Revenue growth from increased budget", 15000, "SHORT_TERM"),
    profitImpact:      dim("POSITIVE",  "MEDIUM", "Higher profit from scale efficiency", 4000, "MEDIUM_TERM"),
    cashImpact:        dim("NEGATIVE",  "MEDIUM", "Cash outflow for increased ad spend", -5000, "IMMEDIATE"),
    inventoryImpact:   dim("NEGATIVE",  "LOW",    "Increased demand may strain inventory", null, "SHORT_TERM"),
    operationalImpact: dim("POSITIVE",  "LOW",    "Higher order volume — scale ops accordingly", null, "SHORT_TERM"),
    confidence: 0.82, impactType: "revenue", impactLabel: "Est. Revenue Growth", impactValue: "~EGP 15,000",
  },
  "DEC-002": {
    revenueImpact:     dim("NEGATIVE",  "MEDIUM", "Reduced order volume from lower budget", null, "SHORT_TERM"),
    profitImpact:      dim("POSITIVE",  "LOW",    "Slightly improved margin from reduced spend", 800, "SHORT_TERM"),
    cashImpact:        dim("POSITIVE",  "MEDIUM", "Cash saved from reduced ad spend", 2200, "IMMEDIATE"),
    inventoryImpact:   dim("POSITIVE",  "LOW",    "Less demand pressure on inventory", null, "SHORT_TERM"),
    operationalImpact: dim("NEUTRAL",   "LOW",    "Minimal operational change", null, "SHORT_TERM"),
    confidence: 0.70, impactType: "saving", impactLabel: "Est. Saving", impactValue: "~EGP 2,200/mo",
  },
  "DEC-003": {
    revenueImpact:     dim("NEGATIVE",  "MEDIUM", "Short-term revenue reduction", null, "SHORT_TERM"),
    profitImpact:      dim("POSITIVE",  "MEDIUM", "Stop wasted spend → improved profit", 2200, "IMMEDIATE"),
    cashImpact:        dim("POSITIVE",  "MEDIUM", "Cash saved from paused ad spend", 2200, "IMMEDIATE"),
    inventoryImpact:   dim("POSITIVE",  "LOW",    "Reduced demand reduces inventory pressure", null, "SHORT_TERM"),
    operationalImpact: dim("NEUTRAL",   "LOW",    "Pause and investigate creatives", null, "IMMEDIATE"),
    confidence: 0.74, impactType: "saving", impactLabel: "Est. Saving", impactValue: "~EGP 2,200/mo",
  },
  "DEC-004": {
    revenueImpact:     dim("POSITIVE",  "HIGH",   "Prevent stockout — protect projected revenue", 15000, "SHORT_TERM"),
    profitImpact:      dim("POSITIVE",  "MEDIUM", "Maintain profit contribution from top products", 4000, "SHORT_TERM"),
    cashImpact:        dim("NEGATIVE",  "HIGH",   "Capital required for inventory purchase", -8000, "IMMEDIATE"),
    inventoryImpact:   dim("POSITIVE",  "HIGH",   "Stock replenishment for 3 products", null, "IMMEDIATE"),
    operationalImpact: dim("POSITIVE",  "MEDIUM", "Prevent stockout-related order cancellations", null, "SHORT_TERM"),
    confidence: 0.91, impactType: "revenue", impactLabel: "Est. Revenue Protection", impactValue: "~EGP 15,000",
  },
  "DEC-005": {
    revenueImpact:     dim("NEUTRAL",   "LOW",    "Focus purchasing on faster-moving SKUs", null, "MEDIUM_TERM"),
    profitImpact:      dim("POSITIVE",  "MEDIUM", "Improve margin via better purchasing", 2000, "MEDIUM_TERM"),
    cashImpact:        dim("POSITIVE",  "HIGH",   "Cash conserved — reduced purchasing", 8000, "IMMEDIATE"),
    inventoryImpact:   dim("POSITIVE",  "HIGH",   "Reduce overstock and dead stock risk", null, "MEDIUM_TERM"),
    operationalImpact: dim("POSITIVE",  "MEDIUM", "Optimize stock mix", null, "MEDIUM_TERM"),
    confidence: 0.78, impactType: "saving", impactLabel: "Est. Cash Saving", impactValue: "~EGP 8,000",
  },
  "DEC-006": {
    revenueImpact:     dim("POSITIVE",  "LOW",    "Minor revenue from clearance sales", 2000, "IMMEDIATE"),
    profitImpact:      dim("VARIABLE",  "MEDIUM", "Varies by clearance discount applied", null, "IMMEDIATE"),
    cashImpact:        dim("POSITIVE",  "HIGH",   "Cash released from dead stock liquidation", 12000, "SHORT_TERM"),
    inventoryImpact:   dim("POSITIVE",  "HIGH",   "Warehouse space freed", null, "SHORT_TERM"),
    operationalImpact: dim("POSITIVE",  "MEDIUM", "Clear dead stock reduces handling cost", null, "SHORT_TERM"),
    confidence: 0.80, impactType: "cash", impactLabel: "Est. Cash Release", impactValue: "~EGP 12,000",
  },
  "DEC-007": {
    revenueImpact:     dim("POSITIVE",  "MEDIUM", "Improve delivery rate — recover revenue", 5000, "SHORT_TERM"),
    profitImpact:      dim("POSITIVE",  "MEDIUM", "Reduce return shipping cost", 450, "SHORT_TERM"),
    cashImpact:        dim("POSITIVE",  "LOW",    "Recover COD cash from improved delivery", 450, "SHORT_TERM"),
    inventoryImpact:   dim("POSITIVE",  "LOW",    "Fewer physical returns to process", null, "SHORT_TERM"),
    operationalImpact: dim("POSITIVE",  "HIGH",   "Improve shipping operations and courier performance", null, "SHORT_TERM"),
    confidence: 0.82, impactType: "saving", impactLabel: "Est. Saving", impactValue: "~EGP 450/mo",
  },
  "DEC-008": {
    revenueImpact:     dim("NEGATIVE",  "LOW",    "Reduced reach in low-scoring governorates", null, "SHORT_TERM"),
    profitImpact:      dim("POSITIVE",  "MEDIUM", "Improve CPA by removing wasteful targeting", 1200, "SHORT_TERM"),
    cashImpact:        dim("POSITIVE",  "MEDIUM", "Save ad spend on poor-performing regions", 1200, "SHORT_TERM"),
    inventoryImpact:   dim("NEUTRAL",   "LOW",    "No direct inventory impact", null, "SHORT_TERM"),
    operationalImpact: dim("POSITIVE",  "LOW",    "Better targeting efficiency", null, "SHORT_TERM"),
    confidence: 0.70, impactType: "saving", impactLabel: "Est. Ad Saving", impactValue: "~EGP 1,200/mo",
  },
  "DEC-009": {
    revenueImpact:     dim("NEUTRAL",   "LOW",    "Revenue unaffected by expense reduction", null, "SHORT_TERM"),
    profitImpact:      dim("POSITIVE",  "MEDIUM", "Improve net margin by 2–4%", null, "MEDIUM_TERM"),
    cashImpact:        dim("POSITIVE",  "MEDIUM", "Reduce cash outflow", null, "SHORT_TERM"),
    inventoryImpact:   dim("NEUTRAL",   "LOW",    "No direct inventory impact", null, "SHORT_TERM"),
    operationalImpact: dim("VARIABLE",  "MEDIUM", "Depends on which expenses are reduced", null, "SHORT_TERM"),
    confidence: 0.72, impactType: "profit", impactLabel: "Est. Margin Improvement", impactValue: "+2–4%",
  },
  "DEC-010": {
    revenueImpact:     dim("POSITIVE",  "CRITICAL", "Prevent further revenue decline", null, "IMMEDIATE"),
    profitImpact:      dim("POSITIVE",  "CRITICAL", "Stop profit hemorrhage", null, "IMMEDIATE"),
    cashImpact:        dim("POSITIVE",  "HIGH",     "Preserve critical cash runway", null, "IMMEDIATE"),
    inventoryImpact:   dim("POSITIVE",  "HIGH",     "Freeze purchasing until review", null, "IMMEDIATE"),
    operationalImpact: dim("POSITIVE",  "CRITICAL", "Full operations review required", null, "IMMEDIATE"),
    confidence: 0.95, impactType: "profit", impactLabel: "Est. Loss Prevention", impactValue: "Critical",
  },
};
