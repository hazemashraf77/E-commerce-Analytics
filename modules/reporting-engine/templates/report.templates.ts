/**
 * Report template builders.
 * Repository: 017_REPORTING_ENGINE.md v2.0.0
 *
 * "Reports never calculate business values." (017)
 * All builders accept pre-computed engine outputs and package them into
 * ReportSection structures for export. Zero business calculation here.
 */

import type {
  ReportSection,
  ReportDualValue,
  ReportAppendices,
  FormulaAppendixEntry,
  KpiAppendixEntry,
  ScoreAppendixEntry,
  DecisionAppendixEntry,
} from "../types/report.types";
import type { ScoreResult } from "@/modules/score-engine/types/score.types";
import type { HistoricalDecisionRecord } from "@/modules/decision-engine/domain/historical-decision.entity";
import { KPI_REGISTRY } from "@/modules/analytics-engine/domain/kpi.registry";
import { SCORE_WEIGHTS, RESERVED_INACTIVE_COMPONENTS } from "@/modules/score-engine/types/score.types";

// ── Dual value factory ────────────────────────────────────────────────────

function dual(
  total: number,
  orderCount: number,
  itemCount: number,
  currency?: string,
  kpiId?: string,
  formulaId?: string,
): ReportDualValue {
  return {
    total,
    orderCount,
    itemCount,
    perOrder: orderCount > 0 ? Math.round((total / orderCount) * 100) / 100 : 0,
    perItem: itemCount > 0 ? Math.round((total / itemCount) * 100) / 100 : 0,
    currency,
    kpiId,
    formulaId,
  };
}

// ── Financial section (consumes Financial Engine outputs) ─────────────────

export function buildFinancialSection(params: {
  revenue: number; cogs: number; grossProfit: number; netProfit: number;
  shippingSubsidy: number; profitMargin: number;
  orderCount: number; itemCount: number;
}): ReportSection {
  return {
    sectionId: crypto.randomUUID(),
    title: "Financial Performance",
    titleAr: "الأداء المالي",
    data: {
      revenue: params.revenue,
      cogs: params.cogs,
      grossProfit: params.grossProfit,
      netProfit: params.netProfit,
      shippingSubsidy: params.shippingSubsidy,
      profitMargin: params.profitMargin,
    },
    dualValues: {
      revenue:     dual(params.revenue, params.orderCount, params.itemCount, "EGP", "KPI-FIN-001", "FIN-001"),
      cogs:        dual(params.cogs, params.orderCount, params.itemCount, "EGP", undefined, "INV-001"),
      grossProfit: dual(params.grossProfit, params.orderCount, params.itemCount, "EGP", "KPI-FIN-002", "FIN-003"),
      netProfit:   dual(params.netProfit, params.orderCount, params.itemCount, "EGP", "KPI-FIN-003", "FIN-002"),
    },
    notes: [
      "Revenue recognition trigger: DELIVERED status (BR-005, FIN-001).",
      "Shipping Subsidy = Actual Shipping Cost − Customer Shipping Fee (SHIP-001).",
    ],
    formulaRefs: ["FIN-001", "FIN-002", "FIN-003", "INV-001", "SHIP-001"],
    kpiRefs: ["KPI-FIN-001", "KPI-FIN-002", "KPI-FIN-003", "KPI-FIN-004", "KPI-FIN-005"],
  };
}

// ── Profit Leakage section ────────────────────────────────────────────────

export function buildProfitLeakageSection(params: {
  items: Array<{ key: string; label: string; total: number; perOrder: number; perItem: number; pctOfRevenue: number }>;
  orderCount: number; itemCount: number;
}): ReportSection {
  return {
    sectionId: crypto.randomUUID(),
    title: "Profit Leakage",
    titleAr: "تسرب الأرباح",
    data: { items: params.items },
    dualValues: Object.fromEntries(
      params.items.map(i => [i.key, {
        total: i.total, orderCount: params.orderCount, itemCount: params.itemCount,
        perOrder: i.perOrder, perItem: i.perItem, currency: "EGP",
      }]),
    ),
    notes: ["All cost values sourced from Financial Engine. No recalculation. (017: Reports never calculate)"],
    formulaRefs: ["FIN-002"],
    kpiRefs: ["KPI-FIN-003"],
  };
}

// ── Operational lifecycle section ─────────────────────────────────────────

export function buildLifecycleSection(params: {
  buckets: Array<{ statusKey: string; labelEn: string; labelAr: string; bostaMapping: string; orderCount: number; itemCount: number; pctOfShipped: number }>;
}): ReportSection {
  return {
    sectionId: crypto.randomUUID(),
    title: "Order Lifecycle",
    titleAr: "دورة الطلبات",
    data: { buckets: params.buckets },
    notes: [
      "All 13 Bosta-accurate status buckets.",
      "Returning to Us (مرتجعاتك العائدة) = EXPECTED_RETURN — not yet received.",
      "Physically Returned (تم الاسترجاع) = RETURNED — received in warehouse.",
      "Delivered then Exchanged / Returned are separate from Delivered Normal.",
    ],
    kpiRefs: ["KPI-OPS-001", "KPI-OPS-002", "KPI-OPS-003", "KPI-OPS-004"],
    formulaRefs: ["OPS-001", "OPS-002", "OPS-003", "OPS-004"],
  };
}

// ── Score section (consumes Score Engine outputs) ─────────────────────────

export function buildScoreSection(scores: ScoreResult[]): ReportSection {
  return {
    sectionId: crypto.randomUUID(),
    title: "Business Scores",
    titleAr: "درجات الأعمال",
    data: {
      scores: scores.map(s => ({
        scoreId: s.scoreId,
        scoreName: s.scoreName,
        scoreNameAr: s.scoreNameAr,
        score: s.score,
        grade: s.grade,
        trend: s.trend,
        delta: s.delta,
        confidence: s.confidencePct,
        components: s.components,
        recommendedActions: s.recommendedActions,
        formulaVersion: s.formulaVersion,
        lastUpdated: s.lastUpdated,
      })),
    },
    notes: [
      "SCORE-001 Business Stability component: RESERVED / INACTIVE v1.0 (Repository Consistency Pass 2026-06-12).",
      "Scores are generated by Score Engine only. AI narrates but never generates.",
    ],
    scoreRefs: scores.map(s => s.scoreId),
  };
}

// ── Decision section (consumes Decision Engine outputs) ───────────────────

export function buildDecisionSection(decisions: HistoricalDecisionRecord[]): ReportSection {
  return {
    sectionId: crypto.randomUUID(),
    title: "Decision History",
    titleAr: "سجل القرارات",
    data: {
      decisions: decisions.map(d => ({
        decisionId: d.decisionId,
        decisionName: d.decisionName,
        category: d.category,
        priority: d.priority,
        triggeredByRule: d.triggeredByRule,
        triggeredAt: d.triggeredAt,
        reason: d.reason,
        recommendedAction: d.recommendedAction,
        currentStatus: d.currentStatus,
        statusHistory: d.statusHistory,
        structuredImpact: d.structuredImpact,
        supportingScores: d.supportingScores,
        supportingKpis: d.supportingKpis,
        supportingFormulaIds: d.supportingFormulaIds,
        confidence: d.confidence,
      })),
    },
    notes: [
      "All decisions generated by Decision Engine (055_DECISION_ENGINE).",
      "BR-DEC-002: Decision Engine never auto-executes. User approval required.",
      "Status history is immutable and append-only.",
    ],
    decisionRefs: decisions.map(d => d.decisionId),
    scoreRefs: [...new Set(decisions.flatMap(d => d.supportingScores))],
    kpiRefs: [...new Set(decisions.flatMap(d => d.supportingKpis))],
    formulaRefs: [...new Set(decisions.flatMap(d => d.supportingFormulaIds))],
  };
}

// ── Appendices builder ────────────────────────────────────────────────────

export function buildReportAppendices(params: {
  formulaIds?: string[];
  kpiIds?: string[];
  scoreIds?: string[];
  decisionIds?: string[];
}): ReportAppendices {
  const formulas: FormulaAppendixEntry[] = (params.formulaIds ?? []).map(id => ({
    formulaId: id,
    formulaName: `Formula ${id}`,
    expression: "(see 033_FORMULA_CATALOG.md)",
    version: "1.0.0",
    sourceOfTruth: "Financial Engine / Analytics Engine",
  }));

  const kpis: KpiAppendixEntry[] = (params.kpiIds ?? [])
    .map(id => {
      const def = KPI_REGISTRY.find(k => k.kpiId === id);
      if (!def) return null;
      return {
        kpiId: def.kpiId,
        kpiName: def.kpiName,
        kpiNameAr: def.nameAr,
        formulaRef: def.formulaId,
        unit: def.unit,
        sourceEngine: def.sourceEngine,
      };
    })
    .filter((k): k is KpiAppendixEntry => k !== null);

  const scores: ScoreAppendixEntry[] = (params.scoreIds ?? []).map(id => {
    const weights = SCORE_WEIGHTS[id as keyof typeof SCORE_WEIGHTS] ?? [];
    const reserved = RESERVED_INACTIVE_COMPONENTS[id as keyof typeof RESERVED_INACTIVE_COMPONENTS] ?? [];
    const weightSum = weights.reduce((s, w) => s + w.weight, 0);
    const entry: ScoreAppendixEntry = {
      scoreId: id,
      scoreName: `Score ${id}`,
      componentCount: weights.length,
      activeWeightSum: Math.round(weightSum * 100) / 100,
      version: "1.0.0",
      gradeThresholds: "90+ Excellent | 80–89 Very Good | 70–79 Good | 60–69 Average | 50–59 Poor | <50 Critical",
    };
    if (reserved.length > 0) {
      entry.businessStabilityStatus = `RESERVED/INACTIVE v1.0 — activates v2.0.0 (weight: ${reserved[0]!.reservedWeight * 100}%)`;
    }
    return entry;
  });

  const decisions: DecisionAppendixEntry[] = (params.decisionIds ?? []).map(id => ({
    decisionId: id,
    decisionName: `Decision ${id}`,
    category: "See 055_DECISION_ENGINE.md",
    triggeringRules: [`DEC-RULE matching ${id}`],
  }));

  return { formulas, kpis, scores, decisions };
}
