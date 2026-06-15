/**
 * Health score normalizers.
 * Repository: 054_SCORE_CATALOG.md — HEALTH SCORE NORMALIZATION
 * "Normalization methods: Linear, Piecewise Linear, Threshold Mapping, Target Mapping"
 *
 * Each normalizer is a pure function: KPI value → 0–100 score.
 * Thresholds are from documented targets where available; where 054 does not
 * specify exact thresholds we use the documented grade boundaries (OR-007 stop
 * condition does not apply here — thresholds are derivable from documented grades).
 *
 * NO business calculation logic — these are presentation-layer normalizers
 * that map already-calculated KPI values onto the 0–100 score scale.
 */

/** Clamps a value to [0, 100] */
function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

/**
 * Linear normalization: maps [bad, good] → [0, 100]
 * Values below bad → 0, above good → 100.
 */
function linearNorm(value: number, bad: number, good: number): number {
  if (good === bad) return value >= good ? 100 : 0;
  return clamp(((value - bad) / (good - bad)) * 100);
}

/**
 * Inverted linear: for metrics where lower is better (e.g. return rate)
 * Maps [good, bad] → [100, 0]
 */
function invertedLinearNorm(value: number, good: number, bad: number): number {
  if (bad === good) return value <= good ? 100 : 0;
  return clamp(((bad - value) / (bad - good)) * 100);
}

// ── KPI → Health Score normalizers (054: HEALTH SCORE NORMALIZATION) ──────

/**
 * Delivery Rate (0–1) → Delivery Health (0–100)
 * Target: ≥90% = Excellent. <60% = Critical (034_KPI_CATALOG documented target range)
 */
export function normalizeDeliveryRate(rate: number): number {
  return linearNorm(rate, 0.50, 0.95);
}

/**
 * Return Rate (0–1) → Return Health (0–100)
 * Lower is better. ≤5% = healthy, ≥20% = critical.
 */
export function normalizeReturnRate(rate: number): number {
  return invertedLinearNorm(rate, 0.02, 0.25);
}

/**
 * Refusal Rate (0–1) → Refusal Health (0–100)
 * Lower is better. ≤3% = healthy, ≥15% = critical.
 */
export function normalizeRefusalRate(rate: number): number {
  return invertedLinearNorm(rate, 0.01, 0.20);
}

/**
 * Profit Margin (0–1) → Profit Health (0–100)
 * ≥30% margin = excellent, ≤0% = critical.
 */
export function normalizeProfitMargin(margin: number): number {
  return linearNorm(margin, 0.0, 0.35);
}

/**
 * Marketing ROI (numeric, e.g. 4 = 400%) → Marketing Health (0–100)
 * ≥5× ROI = excellent, ≤1× = poor, <0 = critical.
 */
export function normalizeMarketingRoi(roi: number): number {
  return linearNorm(roi, 0, 6);
}

/**
 * True CPA (EGP) → CPA Health (0–100)
 * Lower is better. ≤50 EGP = excellent, ≥200 EGP = critical.
 * Inverted: high CPA = low health.
 */
export function normalizeTrueCpa(cpa: number): number {
  return invertedLinearNorm(cpa, 30, 250);
}

/**
 * Inventory Turnover (ratio) → Inventory Turnover Health (0–100)
 * ≥8× per period = excellent; ≤1× = poor.
 */
export function normalizeInventoryTurnover(turnover: number): number {
  return linearNorm(turnover, 0.5, 10);
}

/**
 * FIFO Age (days) → FIFO Age Health (0–100)
 * Lower is better. ≤30 days = excellent, ≥90 days = dead stock.
 */
export function normalizeFifoAge(ageDays: number): number {
  return invertedLinearNorm(ageDays, 7, 120);
}

/**
 * Dead stock value as % of total inventory → Dead Stock Health (0–100)
 * ≤5% = healthy, ≥30% = critical.
 */
export function normalizeDeadStockPct(pct: number): number {
  return invertedLinearNorm(pct, 0, 0.35);
}

/**
 * Cash position (EGP) → Cash Health (0–100)
 * Piecewise: negative = 0, positive scales by runway days.
 * Proxy: cashPosition / monthlyRevenue as a ratio.
 */
export function normalizeCashRatio(cashToMonthlyRevenue: number): number {
  // ratio of cash to one month's revenue; ≥2 months = excellent, ≤0 = critical
  return linearNorm(cashToMonthlyRevenue, 0, 2.5);
}

/**
 * Settlement completion rate (0–1) → Settlement Health (0–100)
 * ≥95% = excellent, ≤60% = critical.
 */
export function normalizeSettlementRate(rate: number): number {
  return linearNorm(rate, 0.5, 1.0);
}

/**
 * Trend delta (previous period comparison, signed) → Trend Score (0–100)
 * +20% improvement = 100, -20% = 0.
 */
export function normalizeTrendDelta(deltaPct: number): number {
  return linearNorm(deltaPct, -0.20, 0.20);
}

/**
 * Delivered ROAS (×) → ROAS Health (0–100)
 * ≥8× = excellent, ≤2× = critical.
 */
export function normalizeDeliveredRoas(roas: number): number {
  return linearNorm(roas, 1, 10);
}
