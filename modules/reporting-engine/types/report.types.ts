/**
 * Reporting Engine types.
 * Repository: 017_REPORTING_ENGINE.md v2.0.0
 *
 * "Reports never calculate business values." (017)
 * "Reports consume trusted outputs." (017)
 * All values in reports are pre-computed by Business Engines.
 */

// ── Report categories (017: REPORT CATEGORIES) ────────────────────────────

export type ReportCategory =
  | "EXECUTIVE"
  | "FINANCIAL"
  | "INVENTORY"
  | "MARKETING"
  | "SHIPPING"
  | "CASH_FLOW"
  | "SETTLEMENT"
  | "SCORE"
  | "DECISION"
  | "PRODUCT"
  | "AI_SUMMARY"
  | "OPERATIONAL";

// ── Export formats (017: EXPORT RULES) ───────────────────────────────────

export type ExportFormat = "PDF" | "EXCEL" | "CSV";

// ── Report status ─────────────────────────────────────────────────────────

export type ReportStatus = "DRAFT" | "GENERATING" | "READY" | "FAILED" | "SCHEDULED";

// ── Report period ─────────────────────────────────────────────────────────

export type ReportPeriod =
  | "TODAY" | "YESTERDAY" | "LAST_7_DAYS" | "LAST_30_DAYS"
  | "THIS_MONTH" | "LAST_MONTH" | "THIS_QUARTER" | "THIS_YEAR" | "CUSTOM";

// ── Appendix entries (017: APPENDICES — required on every report) ─────────

export interface FormulaAppendixEntry {
  formulaId: string;
  formulaName: string;
  expression: string;
  version: string;
  sourceOfTruth: string;
}

export interface KpiAppendixEntry {
  kpiId: string;
  kpiName: string;
  kpiNameAr: string;
  formulaRef: string;
  unit: string;
  sourceEngine: string;
}

export interface ScoreAppendixEntry {
  scoreId: string;
  scoreName: string;
  componentCount: number;
  activeWeightSum: number;
  version: string;
  gradeThresholds: string;
  businessStabilityStatus?: string; // RESERVED/INACTIVE for SCORE-001
}

export interface DecisionAppendixEntry {
  decisionId: string;
  decisionName: string;
  category: string;
  triggeringRules: string[];
}

export interface ReportAppendices {
  formulas?: FormulaAppendixEntry[];
  kpis?: KpiAppendixEntry[];
  scores?: ScoreAppendixEntry[];
  decisions?: DecisionAppendixEntry[];
}

// ── Dual-dimension value (017: DUAL-DIMENSION REQUIREMENT) ───────────────

export interface ReportDualValue {
  total: number;
  orderCount: number;
  itemCount: number;
  perOrder: number;
  perItem: number;
  currency?: string;
  formulaId?: string;
  kpiId?: string;
}

// ── Report section (generic content block) ────────────────────────────────

export interface ReportSection {
  sectionId: string;
  title: string;
  titleAr: string;
  data: Record<string, unknown>;
  dualValues?: Record<string, ReportDualValue>;
  notes?: string[];
  formulaRefs?: string[];
  kpiRefs?: string[];
  scoreRefs?: string[];
  decisionRefs?: string[];
}

// ── Report request ────────────────────────────────────────────────────────

export interface ReportRequest {
  reportId: string;
  storeId: string;
  category: ReportCategory;
  period: ReportPeriod;
  from?: string;
  to?: string;
  format: ExportFormat;
  includeAppendices: boolean;
  viewMode: "ORDERS" | "ITEMS";
  showProjected: boolean;             // FR-002: always opt-in
  requestedBy: string;
  requestedAt: string;
}

// ── Report result ─────────────────────────────────────────────────────────

export interface ReportResult {
  reportId: string;
  storeId: string;
  category: ReportCategory;
  title: string;
  titleAr: string;
  period: ReportPeriod;
  periodLabel: string;
  generatedAt: string;
  generatedBy: string;
  sections: ReportSection[];
  appendices: ReportAppendices;
  exportFormat: ExportFormat;
  status: ReportStatus;
  /** FR-002: indicates whether projected values are included — must be clearly labeled */
  includesProjectedValues: boolean;
  /** FR-009: reports generated for past periods must be reproducible */
  snapshotTimestamp: string;
  dataWindow: string;
  formulaVersion: string;
}

// ── Scheduled report ──────────────────────────────────────────────────────

export type ScheduleFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export interface ScheduledReport {
  scheduleId: string;
  storeId: string;
  category: ReportCategory;
  frequency: ScheduleFrequency;
  format: ExportFormat;
  isActive: boolean;
  lastGeneratedAt?: string;
  nextScheduledAt: string;
  createdBy: string;
  createdAt: string;
}
