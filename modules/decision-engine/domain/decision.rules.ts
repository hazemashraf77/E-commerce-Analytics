/**
 * Decision rules evaluator.
 * Repository: 055_DECISION_ENGINE.md — DECISION RULES (DEC-RULE-001 through DEC-RULE-015)
 *
 * "Decision Engine SHALL produce explainable recommendations using
 *  Repository-defined business rules only." (055)
 * "BR-DEC-002: Decision Engine SHALL NEVER execute recommendations automatically."
 *
 * All rule conditions are sourced verbatim from 055_DECISION_ENGINE.
 * No invented rules (CP-002).
 */

import type { DecisionRecord, DecisionPriority } from "./decision.types";
import { DECISION_IDS } from "./decision.types";

export interface ScoreSnapshot {
  businessHealth:     number;
  productScore:       number;
  campaignScore:      number;
  governorateScore:   number;
  shippingScore:      number;
  inventoryHealth:    number;
  marketingHealth:    number;
  opportunityScore:   number;
  riskScore:          number;
  // Sub-health scores for granular rules
  profitHealth:       number;
  deliveryHealth:     number;
  returnHealth:       number;
  cashHealth:         number;
  settlementHealth:   number;
}

function makeDecision(
  partial: Omit<DecisionRecord, "createdAt" | "expiresAt" | "status">,
): DecisionRecord {
  return {
    ...partial,
    status: "OPEN",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(), // 7-day default
  };
}

function impact(
  revenueImpact: string, profitImpact: string, cashFlowImpact: string,
  inventoryImpact: string, operationalImpact: string, confidence: number,
  impactType: "saving" | "profit" | "cash" | "revenue", impactLabel: string, impactValue: string,
) {
  return { revenueImpact, profitImpact, cashFlowImpact, inventoryImpact, operationalImpact, confidence, impactType, impactLabel, impactValue };
}

/**
 * Evaluates all 15 documented decision rules and returns triggered decisions.
 * Multiple rules can fire simultaneously.
 * "BR-DEC-001: Decision Engine SHALL NEVER modify business data." (055)
 */
export function evaluateDecisionRules(
  scores: ScoreSnapshot,
  storeId: string,
): DecisionRecord[] {
  const decisions: DecisionRecord[] = [];

  // ── DEC-RULE-001: Business Health > 90 AND Opportunity > 90 AND Risk < 30 → Scale ──
  if (scores.businessHealth > 90 && scores.opportunityScore > 90 && scores.riskScore < 30) {
    decisions.push(makeDecision({
      decisionId: DECISION_IDS.INCREASE_CAMPAIGN_BUDGET,
      decisionName: "Scale Business",
      category: "EXECUTIVE",
      priority: "CRITICAL",
      triggeredByRule: "DEC-RULE-001",
      reason: `Business Health (${scores.businessHealth}), Opportunity (${scores.opportunityScore}), Risk (${scores.riskScore}) — all thresholds met for scaling (055: DEC-RULE-001).`,
      affectedEntity: "Business",
      recommendedAction: "Scale advertising carefully. Increase inventory. Expand winning campaigns.",
      expectedImpact: impact("High revenue growth potential", "Increased net profit", "Positive", "Increase required", "Scale operations", 0.90, "revenue", "Est. Revenue Growth", "20–35%"),
      confidence: 0.90,
      opportunityScore: scores.opportunityScore,
      riskScore: scores.riskScore,
      supportingScores: ["SCORE-001", "SCORE-008", "SCORE-009"],
      supportingKpis: ["KPI-FIN-001", "KPI-FIN-003"],
      supportingFormulaIds: ["FIN-002"],
      storeId,
    }));
  }

  // ── DEC-RULE-002: Campaign Score > 90 AND Marketing Health > 90 → Increase Budget ──
  if (scores.campaignScore > 90 && scores.marketingHealth > 90) {
    decisions.push(makeDecision({
      decisionId: DECISION_IDS.INCREASE_CAMPAIGN_BUDGET,
      decisionName: "Increase Campaign Budget",
      category: "MARKETING",
      priority: "HIGH",
      triggeredByRule: "DEC-RULE-002",
      reason: `Campaign Score (${scores.campaignScore}) and Marketing Health (${scores.marketingHealth}) exceed 90. Recommend increasing budget (055: DEC-RULE-002).`,
      affectedEntity: "Active campaigns",
      recommendedAction: "Increase campaign budget. Duplicate top-performing campaigns. Scale aggressively.",
      expectedImpact: impact("Increased revenue", "Higher profit contribution", "Positive cash inflow", "Stock depletion risk", "Higher order volume", 0.85, "revenue", "Est. Revenue Impact", "+15–25%"),
      confidence: 0.85,
      opportunityScore: scores.opportunityScore,
      riskScore: scores.riskScore,
      supportingScores: ["SCORE-003", "SCORE-007"],
      supportingKpis: ["KPI-MKT-002", "KPI-MKT-003"],
      supportingFormulaIds: ["MKT-002", "MKT-003"],
      storeId,
    }));
  }

  // ── DEC-RULE-003: Campaign Score < 60 → Pause Campaign ────────────────────────
  if (scores.campaignScore < 60) {
    decisions.push(makeDecision({
      decisionId: DECISION_IDS.PAUSE_CAMPAIGN,
      decisionName: "Pause Campaign",
      category: "MARKETING",
      priority: scores.campaignScore < 40 ? "CRITICAL" : "HIGH",
      triggeredByRule: "DEC-RULE-003",
      reason: `Campaign Score (${scores.campaignScore}) is below 60. Wasted spend detected (055: DEC-RULE-003).`,
      affectedEntity: "Underperforming campaigns",
      recommendedAction: "Pause underperforming campaigns. Review ad creatives and audience. Reallocate budget to higher-performing campaigns.",
      expectedImpact: impact("Revenue risk — reduced orders", "Improve profit by reducing wasted spend", "Save cash", "No inventory impact", "Reduced order volume", 0.74, "saving", "Est. Saving", "~EGP 2,200/mo"),
      confidence: 0.74,
      opportunityScore: scores.opportunityScore,
      riskScore: scores.riskScore,
      supportingScores: ["SCORE-003", "SCORE-007"],
      supportingKpis: ["KPI-MKT-002"],
      supportingFormulaIds: ["FIN-004"],
      storeId,
    }));
  }

  // ── DEC-RULE-004: Product Score > 95 AND Inventory Health > 80 → Purchase ─────────
  if (scores.productScore > 95 && scores.inventoryHealth > 80) {
    decisions.push(makeDecision({
      decisionId: DECISION_IDS.PURCHASE_INVENTORY,
      decisionName: "Increase Inventory Purchase",
      category: "INVENTORY",
      priority: "HIGH",
      triggeredByRule: "DEC-RULE-004",
      reason: `Product Score (${scores.productScore}) > 95 and Inventory Health (${scores.inventoryHealth}) > 80. Strong performer with healthy inventory (055: DEC-RULE-004).`,
      affectedEntity: "Top-scoring products",
      recommendedAction: "Purchase additional inventory for top-scoring products within 3 days.",
      expectedImpact: impact("Protect projected revenue", "Maintain profit contribution", "Capital required", "Stock replenishment", "Prevent stockout", 0.91, "revenue", "Est. Revenue Protection", "~EGP 15,000"),
      confidence: 0.91,
      opportunityScore: scores.opportunityScore,
      riskScore: scores.riskScore,
      supportingScores: ["SCORE-002", "SCORE-006"],
      supportingKpis: ["KPI-INV-001", "KPI-INV-003"],
      supportingFormulaIds: ["INV-001"],
      storeId,
    }));
  }

  // ── DEC-RULE-005: Inventory Health < 60 → Reduce Purchasing ───────────────────
  if (scores.inventoryHealth < 60 && scores.inventoryHealth >= 40) {
    decisions.push(makeDecision({
      decisionId: DECISION_IDS.REDUCE_INVENTORY_PURCHASE,
      decisionName: "Reduce Inventory Purchase",
      category: "INVENTORY",
      priority: "MEDIUM",
      triggeredByRule: "DEC-RULE-005",
      reason: `Inventory Health (${scores.inventoryHealth}) < 60. Poor turnover or dead stock accumulation (055: DEC-RULE-005).`,
      affectedEntity: "Slow-moving products",
      recommendedAction: "Reduce purchasing for slow-moving products. Focus budget on high-turnover items.",
      expectedImpact: impact("Neutral", "Improve via cost reduction", "Conserve cash", "Reduce overstock", "Optimize purchasing", 0.78, "saving", "Est. Cash Saving", "~EGP 8,000"),
      confidence: 0.78,
      opportunityScore: scores.opportunityScore,
      riskScore: scores.riskScore,
      supportingScores: ["SCORE-006"],
      supportingKpis: ["KPI-INV-003", "KPI-INV-004"],
      supportingFormulaIds: ["INV-002"],
      storeId,
    }));
  }

  // ── DEC-RULE-006: Inventory Health < 40 → Liquidate Dead Stock ───────────────────
  if (scores.inventoryHealth < 40) {
    decisions.push(makeDecision({
      decisionId: DECISION_IDS.LIQUIDATE_DEAD_STOCK,
      decisionName: "Liquidate Dead Stock",
      category: "INVENTORY",
      priority: "CRITICAL",
      triggeredByRule: "DEC-RULE-006",
      reason: `Inventory Health (${scores.inventoryHealth}) < 40. Dead stock consuming capital (055: DEC-RULE-006).`,
      affectedEntity: "Dead stock items",
      recommendedAction: "Liquidate dead stock at discounted price. Stop purchasing affected SKUs. Review forecast.",
      expectedImpact: impact("Minimal revenue from clearance", "Release tied capital", "Positive cash from liquidation", "Reduce dead stock value", "Clear warehouse capacity", 0.80, "cash", "Est. Cash Release", "~EGP 12,000"),
      confidence: 0.80,
      opportunityScore: scores.opportunityScore,
      riskScore: scores.riskScore,
      supportingScores: ["SCORE-006"],
      supportingKpis: ["KPI-INV-001"],
      supportingFormulaIds: ["INV-002"],
      storeId,
    }));
  }

  // ── DEC-RULE-007: Shipping Performance Score < 60 → Review Courier ────────────────
  if (scores.shippingScore < 60) {
    decisions.push(makeDecision({
      decisionId: DECISION_IDS.REVIEW_SHIPPING,
      decisionName: "Review Courier Performance",
      category: "SHIPPING",
      priority: "MEDIUM",
      triggeredByRule: "DEC-RULE-007",
      reason: `Shipping Performance Score (${scores.shippingScore}) < 60. Delivery or return issues detected (055: DEC-RULE-007).`,
      affectedEntity: "Shipping operations",
      recommendedAction: "Investigate courier performance. Review governorate-level delivery rates. Consider restricting COD for high-refusal zones.",
      expectedImpact: impact("Protect revenue by improving delivery", "Reduce return shipping cost", "Reduce cash tied in returns", "Reduce physical returns", "Improve delivery process", 0.82, "saving", "Est. Saving", "~EGP 450/mo"),
      confidence: 0.82,
      opportunityScore: scores.opportunityScore,
      riskScore: scores.riskScore,
      supportingScores: ["SCORE-005", "SCORE-004"],
      supportingKpis: ["KPI-OPS-001", "KPI-OPS-002"],
      supportingFormulaIds: ["OPS-001", "OPS-002"],
      storeId,
    }));
  }

  // ── DEC-RULE-008: Governorate Score < 60 → Reduce Marketing for Governorate ────────
  if (scores.governorateScore < 60) {
    decisions.push(makeDecision({
      decisionId: DECISION_IDS.REVIEW_GOVERNORATE,
      decisionName: "Reduce Marketing Budget for Governorate",
      category: "MARKETING",
      priority: "MEDIUM",
      triggeredByRule: "DEC-RULE-008",
      reason: `Governorate Score (${scores.governorateScore}) < 60. Poor return on marketing in certain regions (055: DEC-RULE-008).`,
      affectedEntity: "Low-scoring governorates",
      recommendedAction: "Reduce marketing spend for low-scoring governorates. Review shipping coverage. Investigate refusal patterns.",
      expectedImpact: impact("Focused revenue on better regions", "Improve CPA by reducing waste", "Conserve cash", "No direct inventory impact", "Better targeting", 0.70, "saving", "Est. Ad Saving", "~EGP 1,200/mo"),
      confidence: 0.70,
      opportunityScore: scores.opportunityScore,
      riskScore: scores.riskScore,
      supportingScores: ["SCORE-004"],
      supportingKpis: ["KPI-OPS-001", "KPI-MKT-002"],
      supportingFormulaIds: ["OPS-001"],
      storeId,
    }));
  }

  // ── DEC-RULE-009: Marketing Health < 60 → Review CPA / ROAS / Creatives ──────────
  if (scores.marketingHealth < 60) {
    decisions.push(makeDecision({
      decisionId: DECISION_IDS.REDUCE_CAMPAIGN_BUDGET,
      decisionName: "Review CPA, ROAS, and Creatives",
      category: "MARKETING",
      priority: "HIGH",
      triggeredByRule: "DEC-RULE-009",
      reason: `Marketing Health (${scores.marketingHealth}) < 60. CPA rising, ROAS declining (055: DEC-RULE-009).`,
      affectedEntity: "All marketing spend",
      recommendedAction: "Review CPA trends. Review ROAS evolution. Test new creatives. Optimize audience targeting.",
      expectedImpact: impact("Protect revenue efficiency", "Improve profit margin", "Reduce wasteful spend", "No direct inventory impact", "Improve CPA", 0.68, "profit", "Est. Profit Impact", "+3–5%"),
      confidence: 0.68,
      opportunityScore: scores.opportunityScore,
      riskScore: scores.riskScore,
      supportingScores: ["SCORE-007"],
      supportingKpis: ["KPI-MKT-002", "KPI-MKT-003"],
      supportingFormulaIds: ["MKT-002", "MKT-003"],
      storeId,
    }));
  }

  // ── DEC-RULE-010: Profit Health < 60 → Reduce Expenses / Review Pricing ─────────
  if (scores.profitHealth < 60) {
    decisions.push(makeDecision({
      decisionId: DECISION_IDS.REDUCE_EXPENSES,
      decisionName: "Reduce Expenses",
      category: "FINANCIAL",
      priority: "HIGH",
      triggeredByRule: "DEC-RULE-010",
      reason: `Profit Health (${scores.profitHealth}) < 60. Low profit margin detected (055: DEC-RULE-010).`,
      affectedEntity: "Cost structure",
      recommendedAction: "Reduce expenses. Review pricing. Review product cost. Investigate loss-making products.",
      expectedImpact: impact("Neutral — depends on repricing", "Improve margin directly", "Free up cash", "Review FIFO costs", "Optimize operations", 0.72, "profit", "Est. Margin Improvement", "+2–4%"),
      confidence: 0.72,
      opportunityScore: scores.opportunityScore,
      riskScore: scores.riskScore,
      supportingScores: ["SCORE-001"],
      supportingKpis: ["KPI-FIN-004"],
      supportingFormulaIds: ["FIN-002", "FIN-003"],
      storeId,
    }));
  }

  // ── DEC-RULE-011: Cash Health < 60 → Delay Purchasing / Review Cash Flow ─────────
  if (scores.cashHealth < 60) {
    decisions.push(makeDecision({
      decisionId: DECISION_IDS.REDUCE_EXPENSES,
      decisionName: "Delay Purchasing / Review Cash Flow",
      category: "FINANCIAL",
      priority: "HIGH",
      triggeredByRule: "DEC-RULE-011",
      reason: `Cash Health (${scores.cashHealth}) < 60. Liquidity concern detected (055: DEC-RULE-011).`,
      affectedEntity: "Cash position",
      recommendedAction: "Delay new inventory purchasing. Accelerate settlement collection. Review cash flow.",
      expectedImpact: impact("Neutral short-term", "Neutral", "Preserve cash runway", "Delay purchasing", "Prioritize collections", 0.76, "cash", "Est. Cash Preservation", "~EGP 6,000"),
      confidence: 0.76,
      opportunityScore: scores.opportunityScore,
      riskScore: scores.riskScore,
      supportingScores: ["SCORE-001"],
      supportingKpis: [],
      supportingFormulaIds: [],
      storeId,
    }));
  }

  // ── DEC-RULE-012: Settlement Health < 60 → Review Pending Settlements ────────────
  if (scores.settlementHealth < 60) {
    decisions.push(makeDecision({
      decisionId: DECISION_IDS.REVIEW_SHIPPING,
      decisionName: "Review Pending Settlements",
      category: "OPERATIONAL",
      priority: "MEDIUM",
      triggeredByRule: "DEC-RULE-012",
      reason: `Settlement Health (${scores.settlementHealth}) < 60. Settlements delayed or disputed (055: DEC-RULE-012).`,
      affectedEntity: "Pending settlements",
      recommendedAction: "Review pending settlements with Bosta. Investigate disputed amounts. Escalate if needed.",
      expectedImpact: impact("Unlock pending revenue", "Neutral", "Accelerate cash collection", "No inventory impact", "Resolve settlement disputes", 0.78, "cash", "Est. Cash Unlock", "~EGP 18,900"),
      confidence: 0.78,
      opportunityScore: scores.opportunityScore,
      riskScore: scores.riskScore,
      supportingScores: ["SCORE-001"],
      supportingKpis: [],
      supportingFormulaIds: [],
      storeId,
    }));
  }

  // ── DEC-RULE-013: Delivery Health < 60 → Review Confirmation / Shipping ──────────
  if (scores.deliveryHealth < 60) {
    decisions.push(makeDecision({
      decisionId: DECISION_IDS.REVIEW_SHIPPING,
      decisionName: "Review Confirmation and Shipping Operations",
      category: "OPERATIONAL",
      priority: "CRITICAL",
      triggeredByRule: "DEC-RULE-013",
      reason: `Delivery Health (${scores.deliveryHealth}) < 60. Delivery Rate below critical threshold (055: DEC-RULE-013).`,
      affectedEntity: "Confirmation and shipping team",
      recommendedAction: "Review confirmation process. Review shipping operations. Investigate delivery failures by governorate.",
      expectedImpact: impact("Recover refused/failed revenue", "Reduce wasted shipping cost", "Recover COD cash", "Prevent unnecessary returns", "Improve delivery rate", 0.85, "revenue", "Est. Revenue Recovery", "~EGP 5,000"),
      confidence: 0.85,
      opportunityScore: scores.opportunityScore,
      riskScore: scores.riskScore,
      supportingScores: ["SCORE-005", "SCORE-004"],
      supportingKpis: ["KPI-OPS-001"],
      supportingFormulaIds: ["OPS-001"],
      storeId,
    }));
  }

  // ── DEC-RULE-014: Return Health < 60 → Review Product Quality ─────────────────────
  if (scores.returnHealth < 60) {
    decisions.push(makeDecision({
      decisionId: DECISION_IDS.REVIEW_SHIPPING,
      decisionName: "Review Product Quality and Customer Expectations",
      category: "OPERATIONAL",
      priority: "HIGH",
      triggeredByRule: "DEC-RULE-014",
      reason: `Return Health (${scores.returnHealth}) < 60. High return rate detected (055: DEC-RULE-014).`,
      affectedEntity: "High-return products",
      recommendedAction: "Review product quality for high-return items. Review ad creatives for expectation alignment. Investigate return reasons.",
      expectedImpact: impact("Recover returned revenue", "Reduce return costs", "Recover COD cash", "Reduce inventory restoration cost", "Improve return rate", 0.70, "saving", "Est. Return Cost Saving", "~EGP 1,200/mo"),
      confidence: 0.70,
      opportunityScore: scores.opportunityScore,
      riskScore: scores.riskScore,
      supportingScores: ["SCORE-002", "SCORE-005"],
      supportingKpis: ["KPI-OPS-002"],
      supportingFormulaIds: ["OPS-002"],
      storeId,
    }));
  }

  // ── DEC-RULE-015: Business Health < 50 → Executive Emergency Review ─────────────
  if (scores.businessHealth < 50) {
    decisions.push(makeDecision({
      decisionId: DECISION_IDS.EXECUTIVE_REVIEW,
      decisionName: "Executive Emergency Review",
      category: "EXECUTIVE",
      priority: "CRITICAL",
      triggeredByRule: "DEC-RULE-015",
      reason: `Business Health (${scores.businessHealth}) < 50. CRITICAL — immediate executive intervention required (055: DEC-RULE-015).`,
      affectedEntity: "Entire business",
      recommendedAction: "Immediate executive review. Pause all non-essential spending. Investigate root cause across all departments.",
      expectedImpact: impact("Protect remaining revenue", "Stop profit hemorrhage", "Preserve critical cash", "Freeze inventory purchasing", "Emergency operations review", 0.95, "profit", "Est. Loss Prevention", "Critical"),
      confidence: 0.95,
      opportunityScore: scores.opportunityScore,
      riskScore: scores.riskScore,
      supportingScores: ["SCORE-001", "SCORE-009"],
      supportingKpis: ["KPI-FIN-003", "KPI-FIN-004"],
      supportingFormulaIds: ["FIN-002"],
      storeId,
    }));
  }

  return decisions;
}
