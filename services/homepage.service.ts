/**
 * Homepage Service — Sprint 2B Phase 1
 *
 * Repository: 075_HOMEPAGE_CONTRACT.md, 076_METRICS_CATALOG.md, 077_IMPLEMENTATION_RULES.md
 *
 * Responsibility: Aggregate product-level data into Homepage KPI cards,
 * Smart Filter counts, and Smart Priority recommendation.
 *
 * Rules per 077:
 * - Business calculations belong here, not in the API route
 * - No duplicated formulas — all calculations delegate to Formula Engine
 * - No mock data — all values from DB via ProductPerformanceService
 */

import { createLogger } from "@/lib/logger";
import { computeProductPerformance } from "./product-performance.service";
import { computeAllScores } from "@/modules/score-engine/application/score.engine";
import { computeDecisions } from "@/modules/decision-engine/application/decision.engine";
import { computeAOVGrouping } from "./aov-grouping.service";
import {
  calcDeliveryRate,
  calcTrueCpa,
  calcTrueRoas,
  type ProductKpiRow,
} from "@/modules/formula-engine";

const logger = createLogger("HomepageService");

// ── KPI Card types (076_METRICS_CATALOG.md — KPI CARDS section) ─────────────

export interface KpiCard {
  id:           string;   // stable identifier for frontend
  label:        string;
  labelAr:      string;
  value:        number;
  formatted:    string;   // pre-formatted for display (backend formats, frontend renders)
  unit:         string;   // "EGP" | "%" | "×" | "score"
  trend:        number | null;   // delta vs prior period (null = not computed)
  formulaId:    string;          // from 076_METRICS_CATALOG.md / Formula Catalog
  source:       string;          // data owner per 076
  confidence:   "HIGH" | "MEDIUM" | "LOW";
  priority:     "CRITICAL" | "IMPORTANT" | "OPTIONAL";
}

// ── Smart Filter counts (075_HOMEPAGE_CONTRACT.md — SMART FILTERS) ──────────

export interface SmartFilterCount {
  key:   string;
  label: string;
  count: number;
}

// ── Homepage payload ─────────────────────────────────────────────────────────

export interface HomepagePayload {
  kpiCards: KpiCard[];
  smartFilters: SmartFilterCount[];
  smartPriority: SmartPriority | null;
  products: ProductKpiRow[];
  aov: AovSummary;

  computedAt: string;
  periodDays: number;

  source: "DB_KPI_CALCULATOR",

  metadata: homepageMetadata, 

  metadata: {
    dataFreshness: "REAL_TIME" | "ON_SYNC" | "STALE";
    dataQuality: "HIGH" | "MEDIUM" | "LOW";

    formulaVersion: string;
    metricsVersion: string;

    apiVersion: string;
    schemaVersion: string;

    syncStartedAt: string | null;
    syncFinishedAt: string | null;
  };
}

export interface SmartPriority {
  action:      string;
  reason:      string;
  impactLabel: string;    // e.g. "+EGP 4,500/mo"
  priority:    string;
  decisionId:  string;
}

export interface AovSummary {
  overallAov:              number;
  dominantBucketLabel:     string | null;
  dominantBucketAvg:       number | null;
  dominantBucketPct:       number | null;
  suggestedOfferThreshold: number | null;
  upliftPercentage:        number;
}

// ── Main entry point ─────────────────────────────────────────────────────────

export async function computeHomepage(input: {
  storeId:  string;
  from:     Date;
  to:       Date;
}): Promise<HomepagePayload> {
  const { storeId, from, to } = input;

  logger.info("Homepage: computing", {
    metadata: { storeId, from: from.toISOString(), to: to.toISOString() },
  });

  // ── Parallel data fetch ──────────────────────────────────────────────────
  const [perfResult, aovResult] = await Promise.all([
    computeProductPerformance({ storeId, from, to }),
    computeAOVGrouping({ storeId, from, to }).catch(() => null),
  ]);

  const { products, periodDays } = perfResult;

  // ── Aggregate store-level totals ─────────────────────────────────────────
  const totals = aggregateTotals(products);

  // ── KPI Cards (075_HOMEPAGE_CONTRACT.md — max 8 cards) ──────────────────
  const kpiCards = buildKpiCards(totals);

  // ── Smart Filters (075: SMART FILTERS) ──────────────────────────────────
  const smartFilters = buildSmartFilters(products);

  // ── Score Engine (for Business Health card) ──────────────────────────────
  const deliveryRate = calcDeliveryRate(totals.ordersDelivered, totals.ordersShipped) ?? 0;
  const returnRate   = totals.ordersDelivered > 0 ? totals.ordersReturned / totals.ordersDelivered : 0;
  const refusalRate  = totals.ordersShipped   > 0 ? totals.ordersRefused  / totals.ordersShipped   : 0;
  const profitMargin = totals.revenue > 0 ? totals.trueProfit / totals.revenue : 0;
  const trueRoas     = calcTrueRoas(totals.trueProfit, totals.adSpend) ?? 0;
  const trueCpa      = calcTrueCpa(totals.adSpend, totals.ordersDelivered) ?? 0;

  // Business Health score — Score Engine owns this
  const scoreResult = await computeAllScores({
    storeId,
    deliveryRate,
    returnRate,
    refusalRate,
    profitMargin,
    marketingRoi:             trueRoas,
    trueCpa,
    deliveredRoas:            trueRoas,
    inventoryTurnover:        periodDays > 0 ? (totals.ordersDelivered * 30 / periodDays) : 0,
    avgFifoAgeDays:           30,           // computed from FIFO layers — simplification for now
    deadStockPct:             products.filter(p => p.inventoryStatus === "DEAD_STOCK").length / Math.max(1, products.length),
    stockAvailabilityPct:     products.filter(p => p.inventoryStatus === "IN_STOCK" || p.inventoryStatus === "LOW_STOCK").length / Math.max(1, products.length),
    lowStockProductPct:       products.filter(p => p.inventoryStatus === "LOW_STOCK").length / Math.max(1, products.length),
    cashPosition:             totals.inventoryValue,
    monthlyRevenue:           totals.revenue,
    // TODO: Wire Settlement Engine in Sprint 3
    settlementCompletionRate: 0,
    trendDelta:               0,
    growthVelocity:           0,
    deliveredOrders:          totals.ordersDelivered,
    deliveredItems:           totals.itemsDelivered,
    totalProducts:            products.length,
  }).catch(() => null);

  const businessHealthScore = scoreResult?.scores.find(s => s.scoreId === "SCORE-001")?.score ?? 0;

  // Update Business Health KPI card with real score
  const healthCard = kpiCards.find(c => c.id === "business_health");
  if (healthCard) {
    healthCard.value     = businessHealthScore;
    healthCard.formatted = `${businessHealthScore}/100`;
  }

  // ── Decision Engine → Smart Priority ────────────────────────────────────
  let smartPriority: SmartPriority | null = null;
  if (scoreResult) {
    const scoreSnapshot = buildScoreSnapshot(scoreResult.scores, {
      deliveryRate, returnRate, refusalRate, profitMargin, trueRoas, trueCpa,
      storeId, products,
    });

    const decisionResult = await computeDecisions(storeId, scoreSnapshot).catch(() => null);
    if (decisionResult && decisionResult.decisions.length > 0) {
      const topDecision = decisionResult.decisions[0]!;
      smartPriority = {
        action:      topDecision.decisionName,
        reason:      topDecision.reason,
        impactLabel: topDecision.expectedImpact,
        priority:    topDecision.priority,
        decisionId:  topDecision.decisionId,
      };
    }
  }

  // ── AOV Summary ──────────────────────────────────────────────────────────
  const aov: AovSummary = {
    overallAov:              aovResult?.overallAOV ?? 0,
    dominantBucketLabel:     aovResult?.dominantBucket?.label ?? null,
    dominantBucketAvg:       aovResult?.dominantBucket?.averageValue ?? null,
    dominantBucketPct:       aovResult?.dominantBucket?.percentage ?? null,
    suggestedOfferThreshold: aovResult?.suggestedOfferThreshold ?? null,
    upliftPercentage:        aovResult?.upliftPercentage ?? 0.25,
  };

  logger.info("Homepage: computed", {
    metadata: {
      storeId, productCount: products.length,
      revenue: totals.revenue, trueProfit: totals.trueProfit,
      businessHealth: businessHealthScore,
    },
  });

  const homepageMetadata = {
  dataFreshness: "ON_SYNC" as const,
  dataQuality: "HIGH" as const,

  formulaVersion: "2.0",

  metricsVersion: "1.0",

  apiVersion: "v1",

  schemaVersion: "Sprint-2A",

  syncStartedAt: null,

  syncFinishedAt: null,
};

  return {
    kpiCards,
    smartFilters,
    smartPriority,
    products,
    aov,
    computedAt:  new Date().toISOString(),
    periodDays,
    source:      "DB_KPI_CALCULATOR",
  };
}

// ── Store-level aggregation ───────────────────────────────────────────────────

interface StoreTotals {
  revenue:          number;
  trueProfit:       number;
  netProfit:        number;
  grossProfit:      number;
  adSpend:          number;
  shippingCost:     number;
  cogs:             number;
  inventoryValue:   number;
  ordersCreated:    number;
  ordersDelivered:  number;
  ordersShipped:    number;
  ordersReturned:   number;
  ordersRefused:    number;
  itemsDelivered:   number;
}

function aggregateTotals(products: ProductKpiRow[]): StoreTotals {
  return products.reduce<StoreTotals>((s, p) => ({
    revenue:         s.revenue         + p.revenue,
    trueProfit:      s.trueProfit      + p.trueProfit,
    netProfit:       s.netProfit       + p.netProfit,
    grossProfit:     s.grossProfit     + p.grossProfit,
    adSpend:         s.adSpend         + p.adSpend,
    shippingCost:    s.shippingCost    + p.shippingCost,
    cogs:            s.cogs            + p.cogs,
    inventoryValue:  s.inventoryValue  + p.inventoryValue,
    ordersCreated:   s.ordersCreated   + p.ordersCreated,
    ordersDelivered: s.ordersDelivered + p.ordersDelivered,
    ordersShipped:   s.ordersShipped   + p.ordersShipped,
    ordersReturned:  s.ordersReturned  + p.ordersReturned,
    ordersRefused:   s.ordersRefused   + p.ordersRefused,
    itemsDelivered:  s.itemsDelivered  + p.itemsDelivered,
  }), {
    revenue:0, trueProfit:0, netProfit:0, grossProfit:0, adSpend:0,
    shippingCost:0, cogs:0, inventoryValue:0, ordersCreated:0,
    ordersDelivered:0, ordersShipped:0, ordersReturned:0, ordersRefused:0, itemsDelivered:0,
  });
}

// ── 8 KPI Cards per 075_HOMEPAGE_CONTRACT.md ─────────────────────────────────

function buildKpiCards(t: StoreTotals): KpiCard[] {
  const deliveryRate = calcDeliveryRate(t.ordersDelivered, t.ordersShipped);
  const trueCpa      = calcTrueCpa(t.adSpend, t.ordersDelivered);
  const trueRoas     = calcTrueRoas(t.trueProfit, t.adSpend);

  return [
    {
      id:         "revenue",
      label:      "Revenue",
      labelAr:    "الإيرادات",
      value:      t.revenue,
      formatted:  `EGP ${Math.round(t.revenue).toLocaleString("en-EG")}`,
      unit:       "EGP",
      trend:      null,
      formulaId:  "FIN-001",
      source:     "Financial Engine",
      confidence:
      trueRoas == null
      ? "LOW"
      : "HIGH",
      priority:   "CRITICAL",
    },
    {
      id:         "net_profit",
      label:      "Net Profit",
      labelAr:    "صافي الربح",
      value:      t.netProfit,
      formatted:  `EGP ${Math.round(t.netProfit).toLocaleString("en-EG")}`,
      unit:       "EGP",
      trend:      null,
      formulaId:  "FIN-002",
      source:     "Financial Engine",
      confidence: "HIGH",
      priority:   "CRITICAL",
    },
    {
      id:         "projected_profit",
      label:      "Projected Profit",
      labelAr:    "الربح المتوقع",
      value:      t.trueProfit,          // True Profit is the realized base for projection
      formatted:  `EGP ${Math.round(t.trueProfit).toLocaleString("en-EG")}`,
      unit:       "EGP",
      trend:      null,
      formulaId:  "FIN-002",
      source:     "Financial Engine",
      confidence: "MEDIUM",
      priority:   "CRITICAL",
    },
    {
      id:         "inventory_value",
      label:      "Inventory Value",
      labelAr:    "قيمة المخزون",
      value:      t.inventoryValue,
      formatted:  `EGP ${Math.round(t.inventoryValue).toLocaleString("en-EG")}`,
      unit:       "EGP",
      trend:      null,
      formulaId:  "INV-001",
      source:     "Inventory Engine",
      confidence: "HIGH",
      priority:   "CRITICAL",
    },
    {
      id:         "true_cpa",
      label:      "True CPA (Blended)",
      labelAr:    "التكلفة الحقيقية للاكتساب",
      value:      trueCpa ?? 0,
      formatted:  trueCpa != null ? `EGP ${Math.round(trueCpa).toLocaleString("en-EG")}` : "—",
      unit:       "EGP",
      trend:      null,
      formulaId:  "MKT-002",
      source:     "Marketing Engine",
      confidence: "HIGH",
      priority:   "CRITICAL",
    },
    {
      id:         "delivery_rate",
      label:      "Delivery Rate",
      labelAr:    "معدل التسليم",
      value:      deliveryRate != null ? Math.round(deliveryRate * 10) / 10 : 0,
      formatted:  deliveryRate != null ? `${deliveryRate.toFixed(1)}%` : "—",
      unit:       "%",
      trend:      null,
      formulaId:  "SHP-001",
      source:     "Shipping Engine",
      confidence: "HIGH",
      priority:   "CRITICAL",
    },
    {
      id:         "business_health",
      label:      "Business Health",
      labelAr:    "صحة الأعمال",
      value:      0,   // updated after score engine runs
      formatted:  "0/100",
      unit:       "score",
      trend:      null,
      formulaId:  "SCORE-001",
      source:     "Business Engine",
      confidence: "MEDIUM",
      priority:   "CRITICAL",
    },
    {
      id:         "true_roas",
      label:      "True ROAS",
      labelAr:    "عائد الإنفاق الحقيقي",
      value:      trueRoas ?? 0,
      formatted:  trueRoas != null ? `${trueRoas.toFixed(2)}×` : "—",
      unit:       "×",
      trend:      null,
      formulaId:  "MKT-012",
      source:     "Marketing Engine",
      confidence: "HIGH",
      priority:   "CRITICAL",
    },
  ];
}

// ── Smart Filters (075_HOMEPAGE_CONTRACT.md — SMART FILTERS) ─────────────────

function buildSmartFilters(products: ProductKpiRow[]): SmartFilterCount[] {
  const HIGH_CPA_THRESHOLD   = 200;  // EGP — configurable in future via AOV config
  const LOW_ROAS_THRESHOLD   = 1;
  const HIGH_RETURN_THRESHOLD = 10;  // %
  const LOW_DELIVERY_THRESHOLD = 80; // %
  const SLOW_MOVING_DAYS     = 60;
  const FAST_MOVING_DAYS     = 7;

  const filters: Array<{ key: string; label: string; fn: (p: ProductKpiRow) => boolean }> = [
    { key: "all",           label: "All",           fn: () => true },
    { key: "profitable",    label: "Profitable",    fn: p => p.trueProfit > 0 },
    { key: "loss_making",   label: "Loss Making",   fn: p => p.trueProfit < 0 },
    { key: "high_cpa",      label: "High CPA",      fn: p => (p.trueCpa ?? 0) > HIGH_CPA_THRESHOLD },
    { key: "low_roas",      label: "Low ROAS",      fn: p => p.adSpend > 0 && (p.trueRoas ?? 0) < LOW_ROAS_THRESHOLD },
    { key: "opportunity",   label: "Opportunity",   fn: p => p.trueProfit > 0 && (p.trueRoas ?? 0) >= 1.5 },
    { key: "high_returns",  label: "High Returns",  fn: p => ((p.returnRate ?? 0) * 100) > HIGH_RETURN_THRESHOLD },
    { key: "low_delivery",  label: "Low Delivery",  fn: p => ((p.deliveryRate ?? 100) < LOW_DELIVERY_THRESHOLD) && p.ordersShipped > 0 },
    { key: "low_stock",     label: "Low Stock",     fn: p => p.inventoryStatus === "LOW_STOCK" },
    { key: "dead_stock",    label: "Dead Stock",    fn: p => p.inventoryStatus === "DEAD_STOCK" },
    { key: "slow_moving",   label: "Slow Moving",   fn: p => p.daysRemaining != null && p.daysRemaining > SLOW_MOVING_DAYS },
    { key: "fast_moving",   label: "Fast Moving",   fn: p => p.daysRemaining != null && p.daysRemaining < FAST_MOVING_DAYS },
    { key: "needs_review",  label: "Needs Review",  fn: p => p.inventoryStatus === "OUT_OF_STOCK" || p.trueProfit < 0 || (p.trueCpa ?? 0) > HIGH_CPA_THRESHOLD },
    { key: "profit_leak",   label: "Profit Leak",   fn: p => p.profitLeakage > 0 },
    { key: "inventory_risk",label: "Inventory Risk",fn: p => p.inventoryStatus === "OUT_OF_STOCK" || (p.daysRemaining != null && p.daysRemaining < 7) },
  ];

  return filters.map(f => ({
    key:   f.key,
    label: f.label,
    count: products.filter(f.fn).length,
  }));
}

// ── Score snapshot adapter for Decision Engine ────────────────────────────────

function buildScoreSnapshot(
  scores: Array<{ scoreId: string; score: number }>,
  ctx: {
    deliveryRate: number; returnRate: number; refusalRate: number;
    profitMargin: number; trueRoas: number; trueCpa: number;
    storeId: string; products: ProductKpiRow[];
  },
) {
  const get = (id: string) => scores.find(s => s.scoreId === id)?.score ?? 0;
  return {
    storeId:                 ctx.storeId,
    businessHealth:          get("SCORE-001"),
    productScore:            get("SCORE-002"),
    campaignScore:           get("SCORE-003"),
    governorateScore:        get("SCORE-004"),
    shippingScore:           get("SCORE-005"),
    inventoryHealth:         get("SCORE-006"),
    marketingHealth:         get("SCORE-007"),
    opportunityScore:        get("SCORE-008"),
    riskScore:               get("SCORE-009"),
    profitHealth:            get("SCORE-010") || Math.round(Math.max(0, Math.min(100, ctx.profitMargin * 400))),
    deliveryHealth:          get("SCORE-011") || Math.round(ctx.deliveryRate * 100),
    returnHealth:            get("SCORE-012") || Math.round(Math.max(0, 100 - ctx.returnRate * 500)),
    cashHealth:              get("SCORE-013") || 70,
    settlementHealth:        get("SCORE-014") || 75,
    // Required by decision rules
    deliveryRate:            ctx.deliveryRate * 100,
    returnRate:              ctx.returnRate   * 100,
    refusalRate:             ctx.refusalRate  * 100,
    profitMarginPct:         ctx.profitMargin * 100,
    trueRoas:                ctx.trueRoas,
    trueCpa:                 ctx.trueCpa,
    lowStockProducts:        ctx.products.filter(p => p.inventoryStatus === "LOW_STOCK" || p.inventoryStatus === "OUT_OF_STOCK").length,
    profitableProducts:      ctx.products.filter(p => p.trueProfit > 0).length,
    losingProducts:          ctx.products.filter(p => p.trueProfit < 0).length,
    highCpaProducts:         ctx.products.filter(p => (p.trueCpa ?? 0) > 200).length,
    totalProducts:           ctx.products.length,
  };
}
