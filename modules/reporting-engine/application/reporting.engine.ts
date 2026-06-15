/**
 * Reporting Engine application orchestrator.
 * Repository: 017_REPORTING_ENGINE.md v2.0.0
 *
 * "Reports never calculate business values." (017)
 * "Reports consume trusted outputs from Analytics, Financial, Score, Decision Engines." (017)
 *
 * Every report is assembled from pre-computed engine outputs only.
 * The orchestrator routes by ReportCategory and delegates section building
 * to report.templates.ts — no formula logic lives here.
 */

import { createLogger } from "@/lib/logger";
import type { ReportRequest, ReportResult, ReportSection } from "../types/report.types";
import {
  buildFinancialSection,
  buildProfitLeakageSection,
  buildLifecycleSection,
  buildScoreSection,
  buildDecisionSection,
  buildReportAppendices,
} from "../templates/report.templates";
import { getAllLatestScores } from "@/modules/score-engine/application/score.engine";
import { getDecisionHistory } from "@/modules/decision-engine/repositories/historical-decision.repository";
import { MOCK_PROFIT_LEAKAGE, MOCK_LIFECYCLE_CARDS } from "@/lib/dashboard/mock-data";

const logger = createLogger("ReportingEngine");

// ── Report generation entry point ─────────────────────────────────────────

export async function generateReport(request: ReportRequest): Promise<ReportResult> {
  logger.info("Reporting Engine: generating report", {
    metadata: { category: request.category, storeId: request.storeId, format: request.format },
  });

  const sections = await buildSections(request);
  const allFormulaRefs  = [...new Set(sections.flatMap(s => s.formulaRefs  ?? []))];
  const allKpiRefs      = [...new Set(sections.flatMap(s => s.kpiRefs      ?? []))];
  const allScoreRefs    = [...new Set(sections.flatMap(s => s.scoreRefs    ?? []))];
  const allDecisionRefs = [...new Set(sections.flatMap(s => s.decisionRefs ?? []))];

  const appendices = request.includeAppendices
    ? buildReportAppendices({ formulaIds: allFormulaRefs, kpiIds: allKpiRefs, scoreIds: allScoreRefs, decisionIds: allDecisionRefs })
    : {};

  const result: ReportResult = {
    reportId: request.reportId,
    storeId: request.storeId,
    category: request.category,
    title: REPORT_TITLES[request.category].en,
    titleAr: REPORT_TITLES[request.category].ar,
    period: request.period,
    periodLabel: resolvePeriodLabel(request.period, request.from, request.to),
    generatedAt: new Date().toISOString(),
    generatedBy: request.requestedBy,
    sections,
    appendices,
    exportFormat: request.format,
    status: "READY",
    includesProjectedValues: request.showProjected,
    snapshotTimestamp: new Date().toISOString(),
    dataWindow: "Last 30 days",
    formulaVersion: "1.0.0",
  };

  logger.info("Report generated", {
    metadata: {
      reportId: result.reportId, category: result.category,
      sectionCount: sections.length, format: request.format,
    },
  });

  return result;
}

// ── Section builder router ─────────────────────────────────────────────────

async function buildSections(request: ReportRequest): Promise<ReportSection[]> {
  const { storeId, category } = request;

  // Mock financial data (production: reads from Financial Engine API)
  const finParams = {
    revenue: 84750, cogs: 46550, grossProfit: 38200, netProfit: 18540,
    shippingSubsidy: 2610, profitMargin: 0.219, orderCount: 87, itemCount: 142,
  };

  switch (category) {
    case "EXECUTIVE": {
      const scores = await getAllLatestScores(storeId);
      const { records: decisions } = await getDecisionHistory({ storeId, pageSize: 10 });
      return [
        buildFinancialSection(finParams),
        buildProfitLeakageSection({ items: MOCK_PROFIT_LEAKAGE as any, orderCount: finParams.orderCount, itemCount: finParams.itemCount }),
        buildLifecycleSection({ buckets: MOCK_LIFECYCLE_CARDS as any }),
        ...(scores.length > 0 ? [buildScoreSection(scores)] : []),
        ...(decisions.length > 0 ? [buildDecisionSection(decisions)] : []),
      ];
    }
    case "FINANCIAL":
      return [
        buildFinancialSection(finParams),
        buildProfitLeakageSection({ items: MOCK_PROFIT_LEAKAGE as any, orderCount: finParams.orderCount, itemCount: finParams.itemCount }),
      ];
    case "INVENTORY": {
      const scores = await getAllLatestScores(storeId);
      const invScore = scores.find(s => s.scoreId === "SCORE-006");
      return [
        { sectionId: crypto.randomUUID(), title: "Inventory Summary", titleAr: "ملخص المخزون",
          data: { currentUnits: 1840, inventoryValue: 92000, lowStockProducts: 3, deadStockValue: 4600 },
          formulaRefs: ["INV-001", "INV-002", "INV-003", "INV-004"],
          kpiRefs: ["KPI-INV-001", "KPI-INV-002", "KPI-INV-003"] },
        ...(invScore ? [buildScoreSection([invScore])] : []),
      ];
    }
    case "MARKETING": {
      const scores = await getAllLatestScores(storeId);
      const mktScore = scores.find(s => s.scoreId === "SCORE-007");
      const campScore = scores.find(s => s.scoreId === "SCORE-003");
      return [
        { sectionId: crypto.randomUUID(), title: "Marketing Performance", titleAr: "الأداء التسويقي",
          data: { totalSpend: 8700, trueCpa: 100, roi: 9.74, deliveredOrders: 87 },
          formulaRefs: ["MKT-002", "MKT-003", "FIN-004"],
          kpiRefs: ["KPI-MKT-001", "KPI-MKT-002", "KPI-MKT-003"] },
        buildLifecycleSection({ buckets: MOCK_LIFECYCLE_CARDS as any }),
        ...(mktScore && campScore ? [buildScoreSection([mktScore, campScore])] : []),
      ];
    }
    case "SHIPPING": {
      const scores = await getAllLatestScores(storeId);
      const shipScore = scores.find(s => s.scoreId === "SCORE-005");
      return [
        buildLifecycleSection({ buckets: MOCK_LIFECYCLE_CARDS as any }),
        { sectionId: crypto.randomUUID(), title: "Shipping Costs", titleAr: "تكاليف الشحن",
          data: { actualShippingCost: 5655, customerShippingFee: 4350, shippingSubsidy: 2610 },
          formulaRefs: ["SHIP-001"],
          kpiRefs: ["KPI-OPS-001", "KPI-OPS-002", "KPI-OPS-003", "KPI-FIN-005"] },
        ...(shipScore ? [buildScoreSection([shipScore])] : []),
      ];
    }
    case "SCORE": {
      const scores = await getAllLatestScores(storeId);
      return scores.length > 0 ? [buildScoreSection(scores)] : [
        { sectionId: crypto.randomUUID(), title: "No scores available", titleAr: "لا توجد درجات", data: {}, notes: ["Run Score Engine first."] },
      ];
    }
    case "DECISION": {
      const { records } = await getDecisionHistory({ storeId, pageSize: 50 });
      return records.length > 0 ? [buildDecisionSection(records)] : [
        { sectionId: crypto.randomUUID(), title: "No decisions available", titleAr: "لا توجد قرارات", data: {}, notes: ["Run Decision Engine first."] },
      ];
    }
    case "PRODUCT":
      return [
        buildFinancialSection(finParams),
        { sectionId: crypto.randomUUID(), title: "Product Performance", titleAr: "أداء المنتجات",
          data: { productCount: 50, topProductId: "PROD-001" },
          formulaRefs: ["FIN-003", "FIN-004", "INV-001"],
          kpiRefs: ["KPI-FIN-001", "KPI-FIN-002"] },
      ];
    case "CASH_FLOW":
      return [
        { sectionId: crypto.randomUUID(), title: "Cash Flow", titleAr: "التدفق النقدي",
          data: { realizedCash: 42100, pendingCash: 18900, expectedCash: 31500, lostCash: 3200 },
          notes: ["Cash is separate from Profit (FR-004). These values represent money movement."],
          formulaRefs: ["FIN-002"] },
      ];
    case "SETTLEMENT":
      return [
        { sectionId: crypto.randomUUID(), title: "Settlement Timeline", titleAr: "جدول التسويات",
          data: { expectedTotal: 28200, receivedTotal: 3200, pendingCount: 4 },
          notes: ["Settlement data from Bosta. Source of Truth: 005_SOURCE_OF_TRUTH_MATRIX."] },
      ];
    default:
      return [
        { sectionId: crypto.randomUUID(), title: "AI Summary", titleAr: "ملخص الذكاء الاصطناعي",
          data: { summary: "AI Summary report narrates Score and Decision Engine outputs. AI Engine scaffold active." },
          notes: ["AI narrates; never generates scores or recommendations independently. (011_AI_ENGINE v2.0.0)"] },
      ];
  }
}

// ── Report title registry ──────────────────────────────────────────────────

const REPORT_TITLES: Record<string, { en: string; ar: string }> = {
  EXECUTIVE:   { en: "Executive Report",   ar: "التقرير التنفيذي" },
  FINANCIAL:   { en: "Financial Report",   ar: "التقرير المالي" },
  INVENTORY:   { en: "Inventory Report",   ar: "تقرير المخزون" },
  MARKETING:   { en: "Marketing Report",   ar: "تقرير التسويق" },
  SHIPPING:    { en: "Shipping Report",    ar: "تقرير الشحن" },
  CASH_FLOW:   { en: "Cash Flow Report",   ar: "تقرير التدفق النقدي" },
  SETTLEMENT:  { en: "Settlement Report",  ar: "تقرير التسويات" },
  SCORE:       { en: "Score Report",       ar: "تقرير الدرجات" },
  DECISION:    { en: "Decision Report",    ar: "تقرير القرارات" },
  PRODUCT:     { en: "Product Report",     ar: "تقرير المنتجات" },
  AI_SUMMARY:  { en: "AI Summary Report",  ar: "تقرير ملخص الذكاء الاصطناعي" },
  OPERATIONAL: { en: "Operational Report", ar: "التقرير التشغيلي" },
};

function resolvePeriodLabel(period: string, from?: string, to?: string): string {
  if (period === "CUSTOM" && from && to) return `${from.slice(0,10)} to ${to.slice(0,10)}`;
  const labels: Record<string, string> = {
    TODAY: "Today", YESTERDAY: "Yesterday", LAST_7_DAYS: "Last 7 Days",
    LAST_30_DAYS: "Last 30 Days", THIS_MONTH: "This Month", LAST_MONTH: "Last Month",
    THIS_QUARTER: "This Quarter", THIS_YEAR: "This Year",
  };
  return labels[period] ?? period;
}

// ── Export scaffolds ───────────────────────────────────────────────────────

/** PDF export scaffold (production: use puppeteer/playwright) */
export async function exportToPdf(report: ReportResult): Promise<Buffer> {
  logger.info("PDF export requested", { metadata: { reportId: report.reportId } });
  const text = JSON.stringify(report, null, 2);
  return Buffer.from(`[PDF SCAFFOLD]\n\nReport: ${report.title}\nPeriod: ${report.periodLabel}\nGenerated: ${report.generatedAt}\n\n${text}`);
}

/** Excel export scaffold (production: use ExcelJS) */
export async function exportToExcel(report: ReportResult): Promise<Buffer> {
  logger.info("Excel export requested", { metadata: { reportId: report.reportId } });
  return Buffer.from(`[EXCEL SCAFFOLD]\nReport: ${report.title}\n${JSON.stringify(report.sections, null, 2)}`);
}

/** CSV export scaffold */
export async function exportToCsv(report: ReportResult): Promise<string> {
  logger.info("CSV export requested", { metadata: { reportId: report.reportId } });
  const rows = report.sections.flatMap(s =>
    Object.entries(s.data).map(([k, v]) =>
      `${report.reportId},${s.title},${k},${JSON.stringify(v)}`
    )
  );
  return ["reportId,section,field,value", ...rows].join("\n");
}

// ── Scheduled report registry ──────────────────────────────────────────────

import type { ScheduledReport } from "../types/report.types";

const scheduledReports: ScheduledReport[] = [];

export function createScheduledReport(schedule: Omit<ScheduledReport, "scheduleId" | "lastGeneratedAt">): ScheduledReport {
  const sr: ScheduledReport = { ...schedule, scheduleId: crypto.randomUUID() };
  scheduledReports.push(sr);
  logger.info("Scheduled report created", { metadata: { scheduleId: sr.scheduleId, category: sr.category } });
  return sr;
}

export function getScheduledReports(storeId: string): ScheduledReport[] {
  return scheduledReports.filter(s => s.storeId === storeId);
}
