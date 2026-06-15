/**
 * Mock dashboard data.
 * Repository: IR-001, CP-018 — mock-first; UI must be viewable before real APIs.
 * 054_SCORE_CATALOG.md, 055_DECISION_ENGINE.md — score/decision shapes.
 *
 * These mocks are REPLACED by live API calls once Analytics/Score/Decision Engines
 * populate data. All shapes match the documented API contracts.
 */

import type {
  KpiCardProps,
  ScoreCardProps,
  DecisionCardProps,
  SmartAlertProps,
  LifecycleStatusCard,
  TimeSeriesDataPoint,
  CpaByStageDataPoint,
  RoasByStageDataPoint,
} from "@/types/dashboard.types";

// ── Mock financial KPIs ───────────────────────────────────────────────────

export const MOCK_FINANCIAL_KPIS: Pick<KpiCardProps, "kpiId" | "title" | "titleAr" | "value" | "valueDual" | "delta" | "trend" | "status" | "footnote">[] = [
  {
    kpiId: "KPI-FIN-001", title: "Revenue", titleAr: "الإيرادات",
    value: "EGP 84,750",
    valueDual: { total: "EGP 84,750", totalRaw: 84750, orderCount: 87, itemCount: 142, perOrder: "EGP 974", perItem: "EGP 597", currency: "EGP" },
    delta: { value: "+12.4%", direction: "up", label: "vs last month" },
    trend: "up", status: "good", footnote: "Realized — Delivered orders only (BR-005)",
  },
  {
    kpiId: "KPI-FIN-002", title: "Gross Profit", titleAr: "إجمالي الربح",
    value: "EGP 38,200",
    valueDual: { total: "EGP 38,200", totalRaw: 38200, orderCount: 87, itemCount: 142, perOrder: "EGP 439", perItem: "EGP 269", currency: "EGP" },
    delta: { value: "+8.1%", direction: "up", label: "vs last month" },
    trend: "up", status: "good",
  },
  {
    kpiId: "KPI-FIN-003", title: "Net Profit", titleAr: "صافي الربح",
    value: "EGP 18,540",
    valueDual: { total: "EGP 18,540", totalRaw: 18540, orderCount: 87, itemCount: 142, perOrder: "EGP 213", perItem: "EGP 131", currency: "EGP" },
    delta: { value: "+3.2%", direction: "up", label: "vs last month" },
    trend: "up", status: "good",
  },
  {
    kpiId: "KPI-FIN-004", title: "Profit Margin", titleAr: "هامش الربح",
    value: "21.9%",
    delta: { value: "-1.2pp", direction: "down", label: "vs last month" },
    trend: "down", status: "warning",
  },
  {
    kpiId: "KPI-FIN-005", title: "Shipping Subsidy", titleAr: "دعم الشحن",
    value: "EGP 2,610",
    delta: { value: "+5.4%", direction: "up", label: "vs last month" },
    trend: "up", status: "warning", footnote: "Actual Shipping Cost − Customer Shipping Fee (SHIP-001)",
  },
];

// ── Mock cost breakdown (for waterfall / cost evolution) ──────────────────

export const MOCK_COSTS = {
  cogs:              { label: "COGS", labelAr: "تكلفة البضاعة", value: 46550, perOrder: 535, perItem: 328 },
  packaging:         { label: "Packaging", labelAr: "تغليف", value: 2610, perOrder: 30, perItem: 18 },
  ads:               { label: "Ads Spend", labelAr: "الإنفاق الإعلاني", value: 8700, perOrder: 100, perItem: 61 },
  shipping:          { label: "Shipping", labelAr: "تكلفة الشحن", value: 5655, perOrder: 65, perItem: 40 },
  returnShipping:    { label: "Return Shipping", labelAr: "شحن المرتجعات", value: 450, perOrder: 90, perItem: 64 }, // per return
  variableExpenses:  { label: "Variable Expenses", labelAr: "مصاريف متغيرة", value: 1740, perOrder: 20, perItem: 12 },
  fixedExpenses:     { label: "Fixed / Overheads", labelAr: "مصاريف ثابتة", value: 2610, perOrder: 30, perItem: 18 },
  refunds:           { label: "Refunds", labelAr: "استردادات", value: 870, perOrder: 10, perItem: 6 },
  compensations:     { label: "Compensations", labelAr: "تعويضات", value: 435, perOrder: 5, perItem: 3 },
};

// ── Mock operational KPIs ─────────────────────────────────────────────────

export const MOCK_OPERATIONAL_KPIS = {
  deliveryRate:  { value: 0.87, orders: 87, items: 140 },
  returnRate:    { value: 0.0575, orders: 5, items: 8 },
  refusalRate:   { value: 0.04, orders: 4, items: 6 },
  exchangeRate:  { value: 0.04, orders: 4, items: 7 },
  totalShipped:  { orders: 100, items: 161 },
};

// ── Mock lifecycle cards (all 13 Bosta-accurate buckets) ──────────────────

export const MOCK_LIFECYCLE_CARDS: LifecycleStatusCard[] = [
  { statusKey: "CREATED", labelEn: "Created", labelAr: "تم الإنشاء", bostaMapping: "PENDING/DRAFT", orderCount: 120, itemCount: 195, pctOfShipped: 0, colorClass: "gray" },
  { statusKey: "CONFIRMED", labelEn: "Confirmed", labelAr: "مؤكد", bostaMapping: "CONFIRMED", orderCount: 115, itemCount: 188, pctOfShipped: 0, colorClass: "gray" },
  { statusKey: "SENT_TO_SHIPPING", labelEn: "Sent to Shipping", labelAr: "أرسل للشحن", bostaMapping: "READY_TO_SHIP", orderCount: 105, itemCount: 171, pctOfShipped: 0, colorClass: "blue" },
  { statusKey: "IN_TRANSIT", labelEn: "In Transit", labelAr: "في الطريق", bostaMapping: "IN_TRANSIT + OUT_FOR_DELIVERY", orderCount: 8, itemCount: 13, pctOfShipped: 0.08, colorClass: "blue" },
  { statusKey: "DELIVERED_NORMAL", labelEn: "Delivered (Normal)", labelAr: "تم التسليم", bostaMapping: "تم بنجاح — no subsequent event", orderCount: 78, itemCount: 126, pctOfShipped: 0.78, colorClass: "green" },
  { statusKey: "DELIVERED_THEN_EXCHANGED", labelEn: "Delivered → Exchanged", labelAr: "تسليم ثم استبدال", bostaMapping: "تم بنجاح + exchange movement", orderCount: 4, itemCount: 7, pctOfShipped: 0.04, colorClass: "amber" },
  { statusKey: "DELIVERED_THEN_RETURNED", labelEn: "Delivered → Returned", labelAr: "تسليم ثم إرجاع", bostaMapping: "تم بنجاح + post-delivery return", orderCount: 5, itemCount: 8, pctOfShipped: 0.05, colorClass: "amber" },
  { statusKey: "REFUSED", labelEn: "Refused", labelAr: "مرفوض", bostaMapping: "DELIVERY_FAILED", orderCount: 4, itemCount: 6, pctOfShipped: 0.04, colorClass: "red" },
  { statusKey: "RETURNING_TO_US", labelEn: "Returning to Us", labelAr: "مرتجعاتك العائدة", bostaMapping: "EXPECTED_RETURN", orderCount: 3, itemCount: 5, pctOfShipped: 0.03, colorClass: "amber" },
  { statusKey: "PHYSICALLY_RETURNED", labelEn: "Physically Returned", labelAr: "تم الاسترجاع", bostaMapping: "RETURNED", orderCount: 5, itemCount: 8, pctOfShipped: 0.05, colorClass: "red" },
  { statusKey: "EXCHANGE_ACTIVE", labelEn: "Exchange (Active)", labelAr: "استبدال جاري", bostaMapping: "exchange movement pending", orderCount: 2, itemCount: 4, pctOfShipped: 0.02, colorClass: "amber" },
  { statusKey: "EXCHANGE_COMPLETED", labelEn: "Exchange Completed", labelAr: "اكتمل الاستبدال", bostaMapping: "exchange + delivered", orderCount: 4, itemCount: 7, pctOfShipped: 0.04, colorClass: "green" },
  { statusKey: "CANCELLED", labelEn: "Cancelled", labelAr: "ملغي", bostaMapping: "CANCELLED", orderCount: 5, itemCount: 8, pctOfShipped: 0, colorClass: "gray" },
];

// ── Mock CPA by stage ─────────────────────────────────────────────────────

export const MOCK_CPA_BY_STAGE: CpaByStageDataPoint[] = [
  { stage: "Created", stageAr: "تم الإنشاء", cpa: 72.5, orders: 120, spend: 8700 },
  { stage: "Confirmed", stageAr: "مؤكد", cpa: 75.65, orders: 115, spend: 8700 },
  { stage: "SentToShipping", stageAr: "أرسل للشحن", cpa: 82.86, orders: 105, spend: 8700 },
  { stage: "InTransit", stageAr: "في الطريق", cpa: 88.78, orders: 98, spend: 8700 },
  { stage: "Delivered", stageAr: "تم التسليم (True CPA)", cpa: 100.0, orders: 87, spend: 8700 },
];

// ── Mock ROAS by stage ────────────────────────────────────────────────────

export const MOCK_ROAS_BY_STAGE: RoasByStageDataPoint[] = [
  { stage: "Created ROAS", stageAr: "عائد الإنشاء", roas: 11.69, isRealized: false },
  { stage: "Delivered ROAS (True)", stageAr: "عائد التسليم الحقيقي", roas: 9.74, isRealized: true },
];

// ── Mock revenue trend (30 days) ──────────────────────────────────────────

export const MOCK_REVENUE_TREND: TimeSeriesDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
  value: 2400 + Math.sin(i / 4) * 600 + i * 40 + Math.random() * 200,
  valueOrders: 2 + Math.floor(Math.random() * 4),
  valueItems: 3 + Math.floor(Math.random() * 7),
}));

// ── Mock scores (SCORE-001 to SCORE-009 per 054_SCORE_CATALOG) ───────────

export const MOCK_SCORES: ScoreCardProps[] = [
  { scoreId: "SCORE-001", scoreName: "Business Health", scoreNameAr: "صحة الأعمال", score: 74, grade: "good", trend: "stable", stability: "Stable", confidence: "high", confidencePct: 92, delta: 2, recommendedAction: "Monitor normally. Minor improvements recommended.", lastUpdated: new Date().toISOString() },
  { scoreId: "SCORE-002", scoreName: "Product Score", scoreNameAr: "درجة المنتج", score: 81, grade: "very-good", trend: "improving", stability: "Improving", confidence: "high", confidencePct: 88, delta: 4, recommendedAction: "Maintain. Consider purchasing more inventory for top products.", lastUpdated: new Date().toISOString() },
  { scoreId: "SCORE-003", scoreName: "Campaign Score", scoreNameAr: "درجة الحملة", score: 67, grade: "average", trend: "declining", stability: "Declining", confidence: "medium", confidencePct: 74, delta: -5, recommendedAction: "Attention required. Review CPA and creatives.", lastUpdated: new Date().toISOString() },
  { scoreId: "SCORE-004", scoreName: "Governorate Score", scoreNameAr: "درجة المحافظة", score: 78, grade: "good", trend: "stable", stability: "Stable", confidence: "medium", confidencePct: 71, delta: 1, recommendedAction: "Acceptable. Monitor Cairo and Alexandria closely.", lastUpdated: new Date().toISOString() },
  { scoreId: "SCORE-005", scoreName: "Shipping Performance", scoreNameAr: "أداء الشحن", score: 72, grade: "good", trend: "stable", stability: "Stable", confidence: "high", confidencePct: 95, delta: -1, recommendedAction: "Review courier performance for return-heavy governorates.", lastUpdated: new Date().toISOString() },
  { scoreId: "SCORE-006", scoreName: "Inventory Health", scoreNameAr: "صحة المخزون", score: 63, grade: "average", trend: "declining", stability: "Declining", confidence: "high", confidencePct: 91, delta: -8, recommendedAction: "Attention required. 3 products at low stock. Review purchasing.", lastUpdated: new Date().toISOString() },
  { scoreId: "SCORE-007", scoreName: "Marketing Health", scoreNameAr: "صحة التسويق", score: 65, grade: "average", trend: "declining", stability: "Declining", confidence: "medium", confidencePct: 79, delta: -6, recommendedAction: "CPA rising. Review ad creatives and audience targeting.", lastUpdated: new Date().toISOString() },
  { scoreId: "SCORE-008", scoreName: "Opportunity Score", scoreNameAr: "درجة الفرص", score: 71, grade: "good", trend: "stable", stability: "Stable", confidence: "medium", confidencePct: 68, delta: 3, recommendedAction: "Observe. Collect more data before scaling.", lastUpdated: new Date().toISOString() },
  { scoreId: "SCORE-009", scoreName: "Risk Score", scoreNameAr: "درجة المخاطر", score: 38, grade: "critical", trend: "declining", stability: "Volatile", confidence: "high", confidencePct: 87, delta: 11, recommendedAction: "Monitor closely. Inventory Health and Marketing Health are declining.", lastUpdated: new Date().toISOString() },
];

// ── Mock decisions (DEC-001 to DEC-010 per 055_DECISION_ENGINE) ──────────

export const MOCK_DECISIONS: DecisionCardProps[] = [
  {
    decisionId: "DEC-003", decisionName: "Pause Campaign", category: "Marketing",
    priority: "HIGH", status: "OPEN",
    reason: "Campaign Score < 60. True CPA exceeded target by 28%. ROAS below minimum threshold.",
    recommendedAction: "Pause underperforming campaigns. Review ad creatives. Reallocate budget to higher-performing campaigns.",
    expectedImpact: "Reduce wasteful spend by ~EGP 2,200/month. Improve overall Marketing Health Score.",
    confidence: 0.74, opportunityScore: 67, riskScore: 38,
    supportingScores: ["SCORE-003", "SCORE-007"], supportingKpis: ["KPI-MKT-002", "KPI-MKT-003"],
    createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  },
  {
    decisionId: "DEC-004", decisionName: "Purchase Inventory", category: "Inventory",
    priority: "HIGH", status: "OPEN",
    reason: "Product Score > 95 for 2 products but Inventory Health declining. 3 products <7 days stock remaining at current velocity.",
    recommendedAction: "Purchase inventory for SKU TS-BLK-M, HD-GRY-XL, CP-KHK-L within 3 days.",
    expectedImpact: "Prevent stockout. Protect ~EGP 15,000 projected revenue.",
    confidence: 0.91, opportunityScore: 81, riskScore: 38,
    supportingScores: ["SCORE-002", "SCORE-006"], supportingKpis: ["KPI-INV-001", "KPI-INV-003"],
    createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 3 * 86400000).toISOString(),
  },
  {
    decisionId: "DEC-007", decisionName: "Review Shipping Performance", category: "Shipping",
    priority: "MEDIUM", status: "ACKNOWLEDGED",
    reason: "Shipping Performance Score at 72. Return rate for Giza governorate is 18% vs 5.75% average.",
    recommendedAction: "Investigate Giza deliveries. Review courier coverage. Consider restricting Giza COD temporarily.",
    expectedImpact: "Reduce return shipping cost by ~EGP 450/month. Improve Delivery Health Score.",
    confidence: 0.82, opportunityScore: 71, riskScore: 38,
    supportingScores: ["SCORE-005", "SCORE-004"], supportingKpis: ["KPI-OPS-001", "KPI-OPS-002"],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// ── Mock smart alerts ─────────────────────────────────────────────────────

export const MOCK_SMART_ALERTS: SmartAlertProps[] = [
  { alertId: "ALT-001", decisionId: "DEC-004", priority: "HIGH", title: "Low Stock Warning", message: "3 products have <7 days inventory remaining at current sell rate.", category: "Inventory", scoreRef: "SCORE-006", kpiRef: "KPI-INV-001", createdAt: new Date().toISOString() },
  { alertId: "ALT-002", decisionId: "DEC-003", priority: "HIGH", title: "Campaign CPA Spike", message: "True CPA increased 28% this week. Campaign Score dropped to 67.", category: "Marketing", scoreRef: "SCORE-003", kpiRef: "KPI-MKT-002", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { alertId: "ALT-003", decisionId: "DEC-007", priority: "MEDIUM", title: "High Return Rate — Giza", message: "Giza governorate return rate is 18% (3× average). Review required.", category: "Shipping", scoreRef: "SCORE-005", kpiRef: "KPI-OPS-002", createdAt: new Date(Date.now() - 7200000).toISOString() },
];

// ── Sprint 7.1 additions ───────────────────────────────────────────────────

// ── Cost Evolution by lifecycle stage (refinement 1) ─────────────────────

export interface CostEvolutionStage {
  stage: string;
  stageAr: string;
  orders: number;
  items: number;
  costPerOrder: number;
  costPerItem: number;
  totalCost: number;
  isRealized: boolean;
}

export const MOCK_COST_EVOLUTION: CostEvolutionStage[] = [
  { stage: "Created",           stageAr: "تم الإنشاء",    orders: 120, items: 195, costPerOrder: 210, costPerItem: 129, totalCost: 25200, isRealized: false },
  { stage: "Confirmed",         stageAr: "مؤكد",          orders: 115, items: 188, costPerOrder: 215, costPerItem: 132, totalCost: 24725, isRealized: false },
  { stage: "Sent to Shipping",  stageAr: "أرسل للشحن",    orders: 105, items: 171, costPerOrder: 218, costPerItem: 134, totalCost: 22890, isRealized: false },
  { stage: "In Transit",        stageAr: "في الطريق",      orders: 98,  items: 160, costPerOrder: 220, costPerItem: 135, totalCost: 21560, isRealized: false },
  { stage: "Delivered",         stageAr: "تم التسليم",     orders: 87,  items: 142, costPerOrder: 535, costPerItem: 328, totalCost: 46545, isRealized: true  },
  { stage: "Final Realized",    stageAr: "محقق نهائي",     orders: 87,  items: 142, costPerOrder: 535, costPerItem: 328, totalCost: 46545, isRealized: true  },
];

// ── Full profit leakage breakdown (refinement 2) ──────────────────────────

export interface ProfitLeakageItem {
  key: string;
  label: string;
  labelAr: string;
  total: number;
  perOrder: number;
  perItem: number;
  pctOfRevenue: number;
  severity: "high" | "medium" | "low";
}

export const MOCK_PROFIT_LEAKAGE: ProfitLeakageItem[] = [
  { key: "cogs",           label: "COGS (FIFO)",          labelAr: "تكلفة البضاعة",       total: 46550, perOrder: 535, perItem: 328, pctOfRevenue: 54.9, severity: "high"   },
  { key: "ads",            label: "Ads Spend",            labelAr: "الإنفاق الإعلاني",    total:  8700, perOrder: 100, perItem:  61, pctOfRevenue: 10.3, severity: "medium" },
  { key: "shipping",       label: "Shipping",             labelAr: "الشحن",               total:  5655, perOrder:  65, perItem:  40, pctOfRevenue:  6.7, severity: "medium" },
  { key: "returnShipping", label: "Return Shipping",      labelAr: "شحن المرتجعات",       total:   450, perOrder:  90, perItem:  56, pctOfRevenue:  0.5, severity: "low"    },
  { key: "exchangeShip",   label: "Exchange Shipping",    labelAr: "شحن الاستبدال",       total:   260, perOrder:  65, perItem:  37, pctOfRevenue:  0.3, severity: "low"    },
  { key: "packaging",      label: "Packaging",            labelAr: "التغليف",             total:  2610, perOrder:  30, perItem:  18, pctOfRevenue:  3.1, severity: "low"    },
  { key: "refunds",        label: "Refunds",              labelAr: "الاستردادات",         total:   870, perOrder:  10, perItem:   6, pctOfRevenue:  1.0, severity: "low"    },
  { key: "compensations",  label: "Compensations",        labelAr: "التعويضات",           total:   435, perOrder:   5, perItem:   3, pctOfRevenue:  0.5, severity: "low"    },
  { key: "variableExp",    label: "Variable Expenses",    labelAr: "مصاريف متغيرة",       total:  1740, perOrder:  20, perItem:  12, pctOfRevenue:  2.1, severity: "low"    },
  { key: "fixedExp",       label: "Fixed / Overheads",   labelAr: "مصاريف ثابتة",        total:  2610, perOrder:  30, perItem:  18, pctOfRevenue:  3.1, severity: "low"    },
];

// ── Pending Money (refinement 3) ──────────────────────────────────────────

export interface PendingMoneyItem {
  key: string;
  label: string;
  labelAr: string;
  amount: number;
  note: string;
  isRealized: boolean;
}

export const MOCK_PENDING_MONEY: PendingMoneyItem[] = [
  { key: "realized",  label: "Realized Cash",   labelAr: "نقد محقق",    amount: 42100, note: "Collected & confirmed",          isRealized: true  },
  { key: "pending",   label: "Pending Cash",    labelAr: "نقد معلق",    amount: 18900, note: "Settlements in transit (Bosta)",  isRealized: false },
  { key: "expected",  label: "Expected Cash",   labelAr: "نقد متوقع",   amount: 31500, note: "Delivered, not yet settled",      isRealized: false },
  { key: "lost",      label: "Lost Cash",       labelAr: "نقد ضائع",    amount:  3200, note: "Refused + unrecovered returns",  isRealized: false },
];

// ── Settlement timeline by horizon (refinement 4) ─────────────────────────

export interface SettlementTimelineEntry {
  id: string;
  horizon: "today" | "tomorrow" | "next3days" | "next7days" | "future";
  horizonLabel: string;
  expectedDate: string;
  expectedAmount: number;
  actualAmount: number;
  status: "EXPECTED" | "RECEIVED" | "RECONCILED" | "DISPUTED";
  shipmentsCount: number;
}

export const MOCK_SETTLEMENT_TIMELINE: SettlementTimelineEntry[] = [
  { id: "SETTLE-004", horizon: "today",     horizonLabel: "Today",       expectedDate: new Date().toISOString().slice(0, 10), expectedAmount: 3200, actualAmount: 3200, status: "RECEIVED",   shipmentsCount: 12 },
  { id: "SETTLE-005", horizon: "tomorrow",  horizonLabel: "Tomorrow",    expectedDate: new Date(Date.now()+86400000).toISOString().slice(0,10), expectedAmount: 4800, actualAmount: 0, status: "EXPECTED", shipmentsCount: 18 },
  { id: "SETTLE-006", horizon: "next3days", horizonLabel: "Next 3 Days", expectedDate: new Date(Date.now()+2*86400000).toISOString().slice(0,10), expectedAmount: 6100, actualAmount: 0, status: "EXPECTED", shipmentsCount: 23 },
  { id: "SETTLE-007", horizon: "next7days", horizonLabel: "Next 7 Days", expectedDate: new Date(Date.now()+5*86400000).toISOString().slice(0,10), expectedAmount: 4800, actualAmount: 0, status: "EXPECTED", shipmentsCount: 19 },
  { id: "SETTLE-008", horizon: "future",    horizonLabel: "Future",      expectedDate: new Date(Date.now()+14*86400000).toISOString().slice(0,10), expectedAmount: 9200, actualAmount: 0, status: "EXPECTED", shipmentsCount: 35 },
];

// ── ROAS by full lifecycle (refinement 6 — all 5 stages) ─────────────────

export const MOCK_ROAS_FULL_LIFECYCLE: RoasByStageDataPoint[] = [
  { stage: "Created ROAS",          stageAr: "عائد الإنشاء",            roas: 13.79, isRealized: false },
  { stage: "Confirmed ROAS",        stageAr: "عائد التأكيد",             roas: 14.37, isRealized: false },
  { stage: "Sent to Shipping ROAS", stageAr: "عائد الإرسال للشحن",       roas: 15.74, isRealized: false },
  { stage: "In Transit ROAS",       stageAr: "عائد العبور",              roas: 16.85, isRealized: false },
  { stage: "Delivered ROAS (True)", stageAr: "عائد التسليم الحقيقي",    roas:  9.74, isRealized: true  },
];

// ── Executive Health Strip scores subset (refinement 7) ──────────────────

export const MOCK_HEALTH_STRIP = [
  { scoreId: "SCORE-001", label: "Business Health", labelAr: "صحة الأعمال",   score: 74, grade: "good"     as const },
  { scoreId: "SCORE-007", label: "Marketing Health", labelAr: "صحة التسويق", score: 65, grade: "average"  as const },
  { scoreId: "SCORE-006", label: "Inventory Health", labelAr: "صحة المخزون", score: 63, grade: "average"  as const },
  { scoreId: "SCORE-005", label: "Shipping Health",  labelAr: "صحة الشحن",   score: 72, grade: "good"     as const },
  { scoreId: "CASH",      label: "Cash Health",      labelAr: "صحة النقد",   score: 68, grade: "average"  as const },
  { scoreId: "SCORE-008", label: "Opportunity",      labelAr: "الفرص",        score: 71, grade: "good"     as const },
  { scoreId: "SCORE-009", label: "Risk",             labelAr: "المخاطر",      score: 38, grade: "critical" as const },
];

// ── Inventory capacity (refinement 8) ─────────────────────────────────────

export const MOCK_INVENTORY_CAPACITY = {
  currentUnits: 1840,
  avgUnitsPerOrder: 1.63,
  estimatedOrderCapacity: Math.round(1840 / 1.63),   // never calculated in UI — pre-computed
  lowStockProducts: 3,
  outOfStockProducts: 1,
};

// ── Cost Evolution stage deltas (UI Polish 1) — precomputed by Analytics Engine ──
export interface CostEvolutionStageDelta {
  stage: string;
  deltaPerOrder: number;       // vs previous stage, precomputed
  deltaPerOrderSign: "up" | "down" | "flat";
  deltaLabel: string;          // e.g. "+5", "-12", "baseline"
}

export const MOCK_COST_EVOLUTION_DELTAS: CostEvolutionStageDelta[] = [
  { stage: "Created",           deltaPerOrder:   0, deltaPerOrderSign: "flat", deltaLabel: "baseline" },
  { stage: "Confirmed",         deltaPerOrder:   5, deltaPerOrderSign: "up",   deltaLabel: "+5"       },
  { stage: "Sent to Shipping",  deltaPerOrder:   3, deltaPerOrderSign: "up",   deltaLabel: "+3"       },
  { stage: "In Transit",        deltaPerOrder:   2, deltaPerOrderSign: "up",   deltaLabel: "+2"       },
  { stage: "Delivered",         deltaPerOrder: 315, deltaPerOrderSign: "up",   deltaLabel: "+315"     },
  { stage: "Final Realized",    deltaPerOrder:   0, deltaPerOrderSign: "flat", deltaLabel: "same as Delivered" },
];

// Improvement 2: Profit leakage sorted highest→lowest by total (precomputed order)
// The existing MOCK_PROFIT_LEAKAGE is already in descending order by total — explicitly document this.
// Backend must return rows sorted by totalCost DESC. Frontend renders in received order only.

// Improvement 4: Score historical sparkline data (precomputed by Score Engine)
export interface ScoreHistoryPoint { date: string; score: number; }
export type ScoreHistory = Record<string, ScoreHistoryPoint[]>;

export const MOCK_SCORE_HISTORY: ScoreHistory = {
  "SCORE-001": Array.from({length:14},(_,i)=>({ date: new Date(Date.now()-(13-i)*86400000).toISOString().slice(0,10), score: 70+Math.round(Math.sin(i/3)*4)+i*0.3 })),
  "SCORE-002": Array.from({length:14},(_,i)=>({ date: new Date(Date.now()-(13-i)*86400000).toISOString().slice(0,10), score: 78+Math.round(Math.cos(i/4)*3) })),
  "SCORE-003": Array.from({length:14},(_,i)=>({ date: new Date(Date.now()-(13-i)*86400000).toISOString().slice(0,10), score: 72-Math.round(i*0.4)+Math.round(Math.sin(i/2)*2) })),
  "SCORE-004": Array.from({length:14},(_,i)=>({ date: new Date(Date.now()-(13-i)*86400000).toISOString().slice(0,10), score: 77+Math.round(Math.sin(i/5)*3) })),
  "SCORE-005": Array.from({length:14},(_,i)=>({ date: new Date(Date.now()-(13-i)*86400000).toISOString().slice(0,10), score: 73+Math.round(Math.cos(i/3)*2) })),
  "SCORE-006": Array.from({length:14},(_,i)=>({ date: new Date(Date.now()-(13-i)*86400000).toISOString().slice(0,10), score: 70-Math.round(i*0.5)+Math.round(Math.sin(i)*1) })),
  "SCORE-007": Array.from({length:14},(_,i)=>({ date: new Date(Date.now()-(13-i)*86400000).toISOString().slice(0,10), score: 71-Math.round(i*0.45)+Math.round(Math.cos(i/2)*1) })),
  "SCORE-008": Array.from({length:14},(_,i)=>({ date: new Date(Date.now()-(13-i)*86400000).toISOString().slice(0,10), score: 68+Math.round(Math.sin(i/4)*3)+Math.round(i*0.2) })),
  "SCORE-009": Array.from({length:14},(_,i)=>({ date: new Date(Date.now()-(13-i)*86400000).toISOString().slice(0,10), score: 28+Math.round(i*0.75)+Math.round(Math.sin(i/2)*2) })),
};

// Improvement 3: Decision estimated impact badges (from Decision Engine)
export interface DecisionImpactBadge {
  decisionId: string;
  impactType: "saving" | "profit" | "cash" | "revenue";
  impactLabel: string;
  impactValue: string;
}

export const MOCK_DECISION_IMPACTS: DecisionImpactBadge[] = [
  { decisionId: "DEC-003", impactType: "saving",  impactLabel: "Est. Saving",        impactValue: "~EGP 2,200/mo" },
  { decisionId: "DEC-004", impactType: "revenue",  impactLabel: "Est. Revenue Risk",  impactValue: "~EGP 15,000" },
  { decisionId: "DEC-007", impactType: "saving",   impactLabel: "Est. Saving",        impactValue: "~EGP 450/mo" },
];

// Improvement 5: Today snapshot (from Analytics/Financial outputs)
export interface TodaySnapshot {
  revenueToday: number;
  ordersToday: number;
  itemsToday: number;
  deliveredToday: number;
  profitToday: number;
  adsSpendToday: number;
  cashReceivedToday: number;
}

export const MOCK_TODAY_SNAPSHOT: TodaySnapshot = {
  revenueToday:      8420,
  ordersToday:         12,
  itemsToday:          19,
  deliveredToday:       9,
  profitToday:       1848,
  adsSpendToday:      870,
  cashReceivedToday: 3200,
};
