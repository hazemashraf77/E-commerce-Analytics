/**
 * Score calculator.
 * Repository: 054_SCORE_CATALOG.md — CALCULATION, WEIGHTING RULES
 * "Score = Σ(Health Score × Weight)" (054: SCORE-001 Calculation)
 * "Σ(Component Weights) = 100%" (054: WEIGHTING RULES)
 *
 * Pure functions — no DB access. Deterministic.
 */

import type {
  ScoreComponent,
  ScoreResult,
  HealthScoreInputs,
  ScoreId,
} from "../types/score.types";
import {
  SCORE_IDS,
  SCORE_WEIGHTS,
  deriveGrade,
  deriveTrend,
} from "../types/score.types";
import {
  normalizeDeliveryRate,
  normalizeReturnRate,
  normalizeRefusalRate,
  normalizeProfitMargin,
  normalizeMarketingRoi,
  normalizeTrueCpa,
  normalizeInventoryTurnover,
  normalizeFifoAge,
  normalizeDeadStockPct,
  normalizeCashRatio,
  normalizeSettlementRate,
  normalizeTrendDelta,
  normalizeDeliveredRoas,
} from "../domain/health.normalizers";

// ── Weight validation (054: WEIGHTING RULES — Σ = 100%) ──────────────────

function assertWeightSum(scoreId: ScoreId): void {
  const weights = SCORE_WEIGHTS[scoreId];
  const sum = weights.reduce((s, w) => s + w.weight, 0);
  if (Math.abs(sum - 1.0) > 0.001) {
    throw new Error(
      `Score ${scoreId}: weights sum to ${sum.toFixed(3)}, must equal 1.0 (054_SCORE_CATALOG WEIGHTING RULES)`,
    );
  }
}

// ── Weighted sum (core formula, 054: SCORE-001 Calculation) ──────────────

function computeWeightedScore(components: ScoreComponent[]): number {
  const raw = components.reduce((s, c) => s + c.contribution, 0);
  return Math.max(0, Math.min(100, Math.round(raw)));
}

// ── Confidence derivation (054: CONFIDENCE LEVEL) ────────────────────────

function deriveConfidence(
  sampleSize: number,
  minSample: number,
  dataFreshnessDays: number,
): { label: "HIGH" | "MEDIUM" | "LOW"; pct: number } {
  if (sampleSize < minSample * 0.5 || dataFreshnessDays > 3) return { label: "LOW",    pct: 45 };
  if (sampleSize < minSample)                                  return { label: "MEDIUM", pct: 72 };
  return { label: "HIGH", pct: 92 + Math.min(sampleSize / (minSample * 10), 7) };
}

// ── Build score result scaffold ───────────────────────────────────────────

function buildResult(
  scoreId: ScoreId,
  scoreName: string,
  scoreNameAr: string,
  components: ScoreComponent[],
  previousScore: number,
  confidence: { label: "HIGH" | "MEDIUM" | "LOW"; pct: number },
  recommendedActions: string[],
  formulaVersion = "1.0.0",
): ScoreResult {
  const score = computeWeightedScore(components);
  const delta = score - previousScore;
  return {
    scoreId,
    scoreName,
    scoreNameAr,
    score,
    grade: deriveGrade(score),
    trend: deriveTrend(score, previousScore),
    stability: deriveTrend(score, previousScore),
    confidence: confidence.label,
    confidencePct: Math.round(confidence.pct),
    delta,
    components,
    recommendedActions,
    formulaVersion,
    calculationVersion: "1.0.0",
    lastUpdated: new Date().toISOString(),
    dataWindow: "Last 30 days",
  };
}

function makeComponent(name: string, inputValue: number, normalizedValue: number, weight: number): ScoreComponent {
  return { name, inputValue, normalizedValue, weight, contribution: normalizedValue * weight };
}

// ── SCORE-001: Business Health ─────────────────────────────────────────────

export function calculateBusinessHealthScore(
  inputs: HealthScoreInputs,
  previousScore = 72,
  deliveredOrders = 87,
): ScoreResult {
  assertWeightSum(SCORE_IDS.BUSINESS_HEALTH);
  const w = SCORE_WEIGHTS[SCORE_IDS.BUSINESS_HEALTH];

  const profitHealth   = inputs.profitHealth   ?? normalizeProfitMargin(inputs.profitMargin);
  const cashHealth     = inputs.cashHealth     ?? normalizeCashRatio(inputs.cashPosition / 50000);
  const delivHealth    = inputs.deliveryHealth  ?? normalizeDeliveryRate(inputs.deliveryRate);
  const invHealth      = inputs.inventoryHealth ?? 65;
  const mktHealth      = inputs.marketingHealth ?? normalizeMarketingRoi(inputs.marketingRoi);
  const shipHealth     = inputs.shippingHealth  ?? 72;
  const setHealth      = inputs.settlementHealth ?? normalizeSettlementRate(inputs.settlementCompletionRate);
  const stability      = normalizeTrendDelta(inputs.trendDelta);

  const components: ScoreComponent[] = [
    makeComponent(w[0]!.name, profitHealth, profitHealth, w[0]!.weight),
    makeComponent(w[1]!.name, cashHealth,   cashHealth,   w[1]!.weight),
    makeComponent(w[2]!.name, delivHealth,  delivHealth,  w[2]!.weight),
    makeComponent(w[3]!.name, invHealth,    invHealth,    w[3]!.weight),
    makeComponent(w[4]!.name, mktHealth,    mktHealth,    w[4]!.weight),
    makeComponent(w[5]!.name, shipHealth,   shipHealth,   w[5]!.weight),
    makeComponent(w[6]!.name, setHealth,    setHealth,    w[6]!.weight),
  ];

  const score = computeWeightedScore(components);
  const actions =
    score >= 95 ? ["Scale advertising carefully.", "Increase inventory.", "Expand winning campaigns."] :
    score >= 80 ? ["Maintain.", "Optimize weak areas."] :
    score >= 60 ? ["Review operational bottlenecks.", "Investigate declining KPIs."] :
    ["Immediate executive review required."];

  return buildResult(SCORE_IDS.BUSINESS_HEALTH, "Business Health", "صحة الأعمال",
    components, previousScore, deriveConfidence(deliveredOrders, 30, 0), actions);
}

// ── SCORE-002: Product Score ───────────────────────────────────────────────

export function calculateProductScore(
  inputs: HealthScoreInputs,
  previousScore = 78,
  deliveredItems = 142,
): ScoreResult {
  assertWeightSum(SCORE_IDS.PRODUCT);
  const w = SCORE_WEIGHTS[SCORE_IDS.PRODUCT];

  const profitHealth = inputs.profitHealth ?? normalizeProfitMargin(inputs.profitMargin);
  const delivHealth  = inputs.deliveryHealth ?? normalizeDeliveryRate(inputs.deliveryRate);
  const mktHealth    = inputs.marketingHealth ?? normalizeMarketingRoi(inputs.marketingRoi);
  const invHealth    = inputs.inventoryHealth ?? 65;
  const retHealth    = inputs.returnHealth ?? normalizeReturnRate(inputs.returnRate ?? 0.06);
  const trend        = normalizeTrendDelta(inputs.trendDelta);
  const stability    = 80; // default stability

  const components: ScoreComponent[] = [
    makeComponent(w[0]!.name, profitHealth, profitHealth, w[0]!.weight),
    makeComponent(w[1]!.name, delivHealth,  delivHealth,  w[1]!.weight),
    makeComponent(w[2]!.name, mktHealth,    mktHealth,    w[2]!.weight),
    makeComponent(w[3]!.name, invHealth,    invHealth,    w[3]!.weight),
    makeComponent(w[4]!.name, retHealth,    retHealth,    w[4]!.weight),
    makeComponent(w[5]!.name, trend,        trend,        w[5]!.weight),
    makeComponent(w[6]!.name, stability,    stability,    w[6]!.weight),
  ];

  const score = computeWeightedScore(components);
  const actions =
    score >= 95 ? ["Increase budget.", "Increase purchasing.", "Scale campaign."] :
    score >= 80 ? ["Maintain.", "Continue monitoring."] :
    score >= 60 ? ["Review pricing, CPA, and inventory."] :
    ["Pause scaling.", "Investigate root causes."];

  return buildResult(SCORE_IDS.PRODUCT, "Product Score", "درجة المنتج",
    components, previousScore, deriveConfidence(deliveredItems, 10, 0), actions);
}

// ── SCORE-003: Campaign Score ──────────────────────────────────────────────

export function calculateCampaignScore(
  inputs: HealthScoreInputs,
  previousScore = 72,
  deliveredOrders = 87,
): ScoreResult {
  assertWeightSum(SCORE_IDS.CAMPAIGN);
  const w = SCORE_WEIGHTS[SCORE_IDS.CAMPAIGN];

  const mktHealth    = inputs.marketingHealth ?? normalizeMarketingRoi(inputs.marketingRoi);
  const profitHealth = inputs.profitHealth    ?? normalizeProfitMargin(inputs.profitMargin);
  const delivHealth  = inputs.deliveryHealth  ?? normalizeDeliveryRate(inputs.deliveryRate);
  const retHealth    = inputs.returnHealth    ?? normalizeReturnRate(inputs.returnRate ?? 0.06);
  const trend        = normalizeTrendDelta(inputs.trendDelta);
  const budgetStab   = 80;
  const stability    = 78;

  const components: ScoreComponent[] = [
    makeComponent(w[0]!.name, mktHealth,    mktHealth,    w[0]!.weight),
    makeComponent(w[1]!.name, profitHealth, profitHealth, w[1]!.weight),
    makeComponent(w[2]!.name, delivHealth,  delivHealth,  w[2]!.weight),
    makeComponent(w[3]!.name, retHealth,    retHealth,    w[3]!.weight),
    makeComponent(w[4]!.name, trend,        trend,        w[4]!.weight),
    makeComponent(w[5]!.name, budgetStab,   budgetStab,   w[5]!.weight),
    makeComponent(w[6]!.name, stability,    stability,    w[6]!.weight),
  ];

  const score = computeWeightedScore(components);
  const actions =
    score >= 95 ? ["Increase Budget", "Duplicate Campaign", "Scale Aggressively"] :
    score >= 80 ? ["Maintain", "Optimize Creatives"] :
    score >= 60 ? ["Review CPA", "Review Audience", "Review Creative"] :
    ["Pause Campaign", "Investigate"];

  return buildResult(SCORE_IDS.CAMPAIGN, "Campaign Score", "درجة الحملة",
    components, previousScore, deriveConfidence(deliveredOrders, 20, 0), actions);
}

// ── SCORE-004: Governorate Score ───────────────────────────────────────────

export function calculateGovernorateScore(
  inputs: HealthScoreInputs,
  previousScore = 75,
  deliveredOrders = 87,
): ScoreResult {
  assertWeightSum(SCORE_IDS.GOVERNORATE);
  const w = SCORE_WEIGHTS[SCORE_IDS.GOVERNORATE];

  const delivHealth  = inputs.deliveryHealth  ?? normalizeDeliveryRate(inputs.deliveryRate);
  const profitHealth = inputs.profitHealth    ?? normalizeProfitMargin(inputs.profitMargin);
  const shipHealth   = inputs.shippingHealth  ?? 72;
  const retHealth    = inputs.returnHealth    ?? normalizeReturnRate(inputs.returnRate ?? 0.06);
  const trend        = normalizeTrendDelta(inputs.trendDelta);

  const components: ScoreComponent[] = [
    makeComponent(w[0]!.name, delivHealth,  delivHealth,  w[0]!.weight),
    makeComponent(w[1]!.name, profitHealth, profitHealth, w[1]!.weight),
    makeComponent(w[2]!.name, shipHealth,   shipHealth,   w[2]!.weight),
    makeComponent(w[3]!.name, retHealth,    retHealth,    w[3]!.weight),
    makeComponent(w[4]!.name, trend,        trend,        w[4]!.weight),
  ];

  const score = computeWeightedScore(components);
  const actions =
    score >= 90 ? ["Increase Campaign Reach"] :
    score >= 80 ? ["Maintain"] :
    score >= 60 ? ["Review Shipping Costs"] :
    ["Reduce Marketing Spend", "Investigate Logistics"];

  return buildResult(SCORE_IDS.GOVERNORATE, "Governorate Score", "درجة المحافظة",
    components, previousScore, deriveConfidence(deliveredOrders, 30, 0), actions);
}

// ── SCORE-005: Shipping Performance Score ─────────────────────────────────

export function calculateShippingScore(
  inputs: HealthScoreInputs,
  previousScore = 73,
  deliveredOrders = 87,
): ScoreResult {
  assertWeightSum(SCORE_IDS.SHIPPING_PERFORMANCE);
  const w = SCORE_WEIGHTS[SCORE_IDS.SHIPPING_PERFORMANCE];

  const delivHealth  = inputs.deliveryHealth ?? normalizeDeliveryRate(inputs.deliveryRate);
  const shipCostH    = 72;
  const retShipH     = normalizeReturnRate(inputs.returnRate ?? 0.06);
  const exchShipH    = 80;
  const shipTrend    = normalizeTrendDelta(inputs.trendDelta);
  const stability    = 75;

  const components: ScoreComponent[] = [
    makeComponent(w[0]!.name, delivHealth, delivHealth, w[0]!.weight),
    makeComponent(w[1]!.name, shipCostH,  shipCostH,   w[1]!.weight),
    makeComponent(w[2]!.name, retShipH,   retShipH,    w[2]!.weight),
    makeComponent(w[3]!.name, exchShipH,  exchShipH,   w[3]!.weight),
    makeComponent(w[4]!.name, shipTrend,  shipTrend,   w[4]!.weight),
    makeComponent(w[5]!.name, stability,  stability,   w[5]!.weight),
  ];

  const score = computeWeightedScore(components);
  const actions =
    score >= 95 ? ["Excellent Logistics"] :
    score >= 80 ? ["Maintain"] :
    score >= 60 ? ["Optimize Shipping Costs"] :
    ["Review Courier Performance", "Review Governorates", "Investigate Refusals"];

  return buildResult(SCORE_IDS.SHIPPING_PERFORMANCE, "Shipping Performance", "أداء الشحن",
    components, previousScore, deriveConfidence(deliveredOrders, 30, 0), actions);
}

// ── SCORE-006: Inventory Health ────────────────────────────────────────────

export function calculateInventoryHealthScore(
  inventoryTurnover: number,
  avgFifoAgeDays: number,
  deadStockPct: number,
  stockAvailabilityPct: number,
  lowStockProductPct: number,
  trendDelta: number,
  previousScore = 63,
  totalProducts = 50,
): ScoreResult {
  assertWeightSum(SCORE_IDS.INVENTORY_HEALTH);
  const w = SCORE_WEIGHTS[SCORE_IDS.INVENTORY_HEALTH];

  const turnoverH     = normalizeInventoryTurnover(inventoryTurnover);
  const fifoAgeH      = normalizeFifoAge(avgFifoAgeDays);
  const deadH         = normalizeDeadStockPct(deadStockPct);
  const availH        = Math.round(stockAvailabilityPct * 100);
  const lowStockH     = Math.round((1 - lowStockProductPct) * 100);
  const trendH        = normalizeTrendDelta(trendDelta);

  const components: ScoreComponent[] = [
    makeComponent(w[0]!.name, inventoryTurnover,  turnoverH, w[0]!.weight),
    makeComponent(w[1]!.name, avgFifoAgeDays,     fifoAgeH,  w[1]!.weight),
    makeComponent(w[2]!.name, deadStockPct,       deadH,     w[2]!.weight),
    makeComponent(w[3]!.name, stockAvailabilityPct, availH,  w[3]!.weight),
    makeComponent(w[4]!.name, lowStockProductPct, lowStockH, w[4]!.weight),
    makeComponent(w[5]!.name, trendDelta,         trendH,    w[5]!.weight),
  ];

  const score = computeWeightedScore(components);
  const actions =
    score >= 95 ? ["Increase Purchasing"] :
    score >= 80 ? ["Maintain"] :
    score >= 60 ? ["Optimize Stock"] :
    ["Stop Purchasing", "Liquidate Dead Stock", "Review Forecast"];

  return buildResult(SCORE_IDS.INVENTORY_HEALTH, "Inventory Health", "صحة المخزون",
    components, previousScore, deriveConfidence(totalProducts, 5, 0), actions);
}

// ── SCORE-007: Marketing Health ────────────────────────────────────────────

export function calculateMarketingHealthScore(
  trueCpa: number,
  deliveredRoas: number,
  profitMargin: number,
  deliveryRate: number,
  trendDelta: number,
  previousScore = 65,
  deliveredOrders = 87,
): ScoreResult {
  assertWeightSum(SCORE_IDS.MARKETING_HEALTH);
  const w = SCORE_WEIGHTS[SCORE_IDS.MARKETING_HEALTH];

  const cpaH    = normalizeTrueCpa(trueCpa);
  const roasH   = normalizeDeliveredRoas(deliveredRoas);
  const profH   = normalizeProfitMargin(profitMargin);
  const delivH  = normalizeDeliveryRate(deliveryRate);
  const trendH  = normalizeTrendDelta(trendDelta);

  const components: ScoreComponent[] = [
    makeComponent(w[0]!.name, trueCpa,       cpaH,   w[0]!.weight),
    makeComponent(w[1]!.name, deliveredRoas, roasH,  w[1]!.weight),
    makeComponent(w[2]!.name, profitMargin,  profH,  w[2]!.weight),
    makeComponent(w[3]!.name, deliveryRate,  delivH, w[3]!.weight),
    makeComponent(w[4]!.name, trendDelta,   trendH, w[4]!.weight),
  ];

  const score = computeWeightedScore(components);
  const actions =
    score >= 95 ? ["Scale Marketing"] :
    score >= 80 ? ["Maintain"] :
    score >= 60 ? ["Optimize Creatives", "Optimize Audience"] :
    ["Reduce Spend", "Pause Campaigns", "Review Strategy"];

  return buildResult(SCORE_IDS.MARKETING_HEALTH, "Marketing Health", "صحة التسويق",
    components, previousScore, deriveConfidence(deliveredOrders, 20, 0), actions);
}

// ── SCORE-008: Opportunity Score ───────────────────────────────────────────

export function calculateOpportunityScore(
  productScore: number,
  campaignScore: number,
  marketingHealthScore: number,
  inventoryHealthScore: number,
  growthVelocity: number,
  trendDelta: number,
  previousScore = 71,
): ScoreResult {
  assertWeightSum(SCORE_IDS.OPPORTUNITY);
  const w = SCORE_WEIGHTS[SCORE_IDS.OPPORTUNITY];

  const growthH = normalizeTrendDelta(growthVelocity / 100);
  const invAvail = inventoryHealthScore;
  const trendH  = normalizeTrendDelta(trendDelta);

  const components: ScoreComponent[] = [
    makeComponent(w[0]!.name, productScore,         productScore,         w[0]!.weight),
    makeComponent(w[1]!.name, campaignScore,         campaignScore,         w[1]!.weight),
    makeComponent(w[2]!.name, marketingHealthScore,  marketingHealthScore,  w[2]!.weight),
    makeComponent(w[3]!.name, growthVelocity,        growthH,              w[3]!.weight),
    makeComponent(w[4]!.name, inventoryHealthScore,  invAvail,             w[4]!.weight),
    makeComponent(w[5]!.name, trendDelta,            trendH,               w[5]!.weight),
  ];

  const score = computeWeightedScore(components);
  const actions =
    score >= 95 ? ["Increase Budget Immediately", "Increase Inventory", "Scale Campaign"] :
    score >= 80 ? ["Gradually Increase Spend", "Monitor Daily"] :
    score >= 60 ? ["Observe", "Collect More Data"] :
    ["No Expansion Recommended"];

  return buildResult(SCORE_IDS.OPPORTUNITY, "Opportunity Score", "درجة الفرص",
    components, previousScore, { label: "MEDIUM", pct: 68 }, actions);
}

// ── SCORE-009: Risk Score ──────────────────────────────────────────────────

export function calculateRiskScore(
  inputs: HealthScoreInputs,
  inventoryHealth: number,
  previousScore = 28,
): ScoreResult {
  assertWeightSum(SCORE_IDS.RISK);
  const w = SCORE_WEIGHTS[SCORE_IDS.RISK];

  // Risk score uses INVERTED health scores — higher risk = lower health
  const profitTrend = normalizeTrendDelta(-(inputs.trendDelta)); // invert: declining trend = high risk
  const retHealth   = normalizeReturnRate(inputs.returnRate ?? 0.06);
  const refHealth   = normalizeRefusalRate(inputs.refusalRate ?? 0.04);
  const invH        = inventoryHealth;
  const mktH        = inputs.marketingHealth ?? normalizeMarketingRoi(inputs.marketingRoi);
  const shipH       = inputs.shippingHealth  ?? 72;
  const cashH       = inputs.cashHealth      ?? 68;
  const setH        = inputs.settlementHealth ?? normalizeSettlementRate(inputs.settlementCompletionRate);

  // Risk score inverts health: low health → high risk score
  const inv = (v: number) => Math.max(0, 100 - v);

  const components: ScoreComponent[] = [
    makeComponent(w[0]!.name, inputs.trendDelta,  inv(profitTrend), w[0]!.weight),
    makeComponent(w[1]!.name, inputs.returnRate ?? 0.06, inv(retHealth), w[1]!.weight),
    makeComponent(w[2]!.name, inputs.refusalRate ?? 0.04, inv(refHealth), w[2]!.weight),
    makeComponent(w[3]!.name, invH,  inv(invH),   w[3]!.weight),
    makeComponent(w[4]!.name, mktH,  inv(mktH),   w[4]!.weight),
    makeComponent(w[5]!.name, shipH, inv(shipH),  w[5]!.weight),
    makeComponent(w[6]!.name, cashH, inv(cashH),  w[6]!.weight),
    makeComponent(w[7]!.name, setH,  inv(setH),   w[7]!.weight),
  ];

  const score = computeWeightedScore(components);
  const actions =
    score >= 90 ? ["Immediate Executive Review", "Pause Scaling", "Investigate Root Cause"] :
    score >= 70 ? ["Monitor Closely", "Review KPIs"] :
    ["Normal Monitoring"];

  return buildResult(SCORE_IDS.RISK, "Risk Score", "درجة المخاطر",
    components, previousScore, { label: "HIGH", pct: 87 }, actions);
}
