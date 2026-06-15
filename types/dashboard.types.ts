/**
 * Dashboard component prop types.
 * Repository: 014_DASHBOARD_ARCHITECTURE.md, 054_SCORE_CATALOG.md, 055_DECISION_ENGINE.md
 *
 * RULE: Dashboard components NEVER calculate values (ER-002, BR-SCORE-006, BR-DEC-005).
 * All values are pre-computed API/Engine outputs rendered by the component.
 */

// ── Dual-dimension value (Order Count + Item Count requirement) ────────────
// Every business metric supports both dimensions per Sprint 7 requirements.

export interface DualDimensionValue {
  total: string;                  // formatted display value
  totalRaw: number;               // raw for sorting
  orderCount: number;
  itemCount: number;
  perOrder: string;               // formatted
  perItem: string;                // formatted
  currency?: string;              // ISO 4217 when applicable
}

// ── KPI card props ─────────────────────────────────────────────────────────

export interface KpiCardProps {
  kpiId: string;                  // from KPI_IDS registry — enables Formula Inspector
  title: string;
  titleAr: string;
  value: string;                  // pre-formatted by API
  valueDual?: DualDimensionValue; // when Order+Item toggle is relevant
  delta?: {
    value: string;
    direction: "up" | "down" | "flat";
    label: string;                // e.g. "vs last month"
  };
  trend?: "up" | "down" | "flat";
  status?: "excellent" | "good" | "warning" | "critical";
  loading?: boolean;
  onInspect?: () => void;         // opens Formula Inspector sidebar
  onDrillDown?: () => void;       // opens drill-down panel
  footnote?: string;              // e.g. "Realized only" / "Cash, not profit"
}

// ── Score card props (054_SCORE_CATALOG) ──────────────────────────────────

export type ScoreGrade = "excellent" | "very-good" | "good" | "average" | "poor" | "critical";

export interface ScoreCardProps {
  scoreId: string;                // SCORE-001 … SCORE-009
  scoreName: string;
  scoreNameAr: string;
  score: number;                  // 0–100 from Score Engine
  grade: ScoreGrade;
  trend: "stable" | "improving" | "declining" | "volatile" | "critical-decline";
  stability: string;
  confidence: "high" | "medium" | "low";
  confidencePct: number;
  delta: number;                  // vs previous period
  recommendedAction: string;
  lastUpdated: string;
  loading?: boolean;
  onInspect?: () => void;         // Score Inspector
  history?: Array<{ date: string; score: number }>; // UI Polish 4: sparkline data from Score Engine
}

// ── Decision card props (055_DECISION_ENGINE) ─────────────────────────────

export type DecisionPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type DecisionStatus = "OPEN" | "ACKNOWLEDGED" | "ACCEPTED" | "REJECTED" | "EXECUTING" | "COMPLETED" | "EXPIRED";

export interface DecisionCardProps {
  decisionId: string;             // DEC-001 … DEC-010
  decisionName: string;
  category: string;
  priority: DecisionPriority;
  status: DecisionStatus;
  reason: string;
  recommendedAction: string;
  expectedImpact: string;
  confidence: number;             // 0–1
  opportunityScore: number;
  riskScore: number;
  supportingScores: string[];
  supportingKpis: string[];
  createdAt: string;
  expiresAt?: string;
  onAccept?: () => void;
  onReject?: () => void;
  onInspect?: () => void;
}

// ── Smart Alert props (055: Alert Generation) ─────────────────────────────

export interface SmartAlertProps {
  alertId: string;
  decisionId: string;             // links to Decision card
  priority: DecisionPriority;
  title: string;
  message: string;
  category: string;
  scoreRef?: string;              // SCORE-xxx that triggered
  kpiRef?: string;                // KPI-xxx that contributed
  createdAt: string;
  dismissed?: boolean;
  onDismiss?: () => void;
  onViewDecision?: () => void;
}

// ── Chart data shapes ──────────────────────────────────────────────────────

export interface TimeSeriesDataPoint {
  date: string;                   // ISO string
  value: number;
  valueOrders?: number;
  valueItems?: number;
  label?: string;
}

export interface CpaByStageDataPoint {
  stage: "Created" | "Confirmed" | "SentToShipping" | "InTransit" | "Delivered";
  stageAr: string;
  cpa: number;
  orders: number;
  spend: number;
}

export interface RoasByStageDataPoint {
  stage: string;
  stageAr: string;
  roas: number;
  isRealized: boolean;            // FR-002: projected vs realized separation
}

// ── Lifecycle status (all 13 Bosta-accurate buckets) ──────────────────────

export interface LifecycleStatusCard {
  statusKey: string;              // e.g. "DELIVERED_NORMAL", "RETURNING_TO_US"
  labelEn: string;
  labelAr: string;
  bostaMapping: string;           // exact Bosta status for traceability
  orderCount: number;
  itemCount: number;
  pctOfShipped: number;
  colorClass: "green" | "amber" | "red" | "blue" | "gray";
}

// ── Period selector ────────────────────────────────────────────────────────

export type DashboardPeriod =
  | "TODAY" | "YESTERDAY" | "LAST_7_DAYS" | "LAST_30_DAYS"
  | "THIS_MONTH" | "LAST_MONTH" | "THIS_QUARTER" | "THIS_YEAR" | "CUSTOM";

export interface PeriodSelectorProps {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
  customFrom?: string;
  customTo?: string;
  onCustomChange?: (from: string, to: string) => void;
  showProjectedToggle?: boolean;
  showProjected?: boolean;
  onProjectedToggle?: (show: boolean) => void;
}

// ── View mode (Order vs Item) ──────────────────────────────────────────────

export type ViewMode = "orders" | "items";

export interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

// ── Drill-down panel ───────────────────────────────────────────────────────

export interface DrillDownPanelProps {
  title: string;
  kpiId?: string;
  scoreId?: string;
  decisionId?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// ── Formula Inspector ──────────────────────────────────────────────────────

export interface FormulaInspectorProps {
  kpiId?: string;
  scoreId?: string;
  isOpen: boolean;
  onClose: () => void;
}
