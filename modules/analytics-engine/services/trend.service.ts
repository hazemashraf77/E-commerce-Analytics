/**
 * Trend calculations.
 * Repository: 010_ANALYTICS_ENGINE.md — TREND ANALYSIS, TREND DETECTION,
 *             COMPARATIVE ANALYSIS, BENCHMARK ANALYSIS
 *
 * "Trend generation never modifies historical data." (010)
 * Trends are computed FROM immutable snapshot data — no writes.
 */

import { Decimal } from "@prisma/client/runtime/library";
import type { TimeSeriesPoint, TrendResult, KpiId } from "../domain/analytics.types";

// ── Direction detection (010: TREND DETECTION) ────────────────────────────

const FLAT_THRESHOLD = new Decimal("0.01"); // < 1% change considered FLAT

export function detectTrendDirection(
  current: Decimal,
  previous: Decimal,
): "UP" | "DOWN" | "FLAT" {
  if (previous.isZero()) return current.greaterThan(0) ? "UP" : "FLAT";
  const change = previous.isZero() ? new Decimal(0) : current.minus(previous).dividedBy(previous).abs();
  if (change.lessThanOrEqualTo(FLAT_THRESHOLD)) return "FLAT";
  return current.greaterThan(previous) ? "UP" : "DOWN";
}

// ── Period-over-period comparison (010: COMPARATIVE ANALYSIS) ─────────────

export function calculatePeriodChange(
  current: Decimal,
  previous: Decimal,
): { changeAbsolute: Decimal; changePercent: Decimal } {
  const changeAbsolute = current.minus(previous);
  const changePercent = previous.isZero()
    ? new Decimal(0)
    : changeAbsolute.dividedBy(previous);  return { changeAbsolute, changePercent };
}

// ── Full trend result from time-series data ───────────────────────────────

export function buildTrendResult(params: {
  kpiId: KpiId;
  dataPoints: TimeSeriesPoint[];
  periodStart: Date;
  periodEnd: Date;
}): TrendResult {
  const { kpiId, dataPoints, periodStart, periodEnd } = params;

  if (dataPoints.length === 0) {
    return {
      kpiId,
      direction: "FLAT",
      changeAbsolute: new Decimal(0),
      changePercent: new Decimal(0),
      dataPoints: [],
      periodStart,
      periodEnd,
    };
  }

  const sorted = [...dataPoints].sort((a, b) => a.date.getTime() - b.date.getTime());
  const first = sorted[0]!.value;
  const last = sorted.at(-1)!.value;
  const { changeAbsolute, changePercent } = calculatePeriodChange(last, first);
  const direction = detectTrendDirection(last, first);

  return { kpiId, direction, changeAbsolute, changePercent, dataPoints: sorted, periodStart, periodEnd };
}

// ── Moving average (smoothing for trend visualization) ────────────────────

export function calculateMovingAverage(
  dataPoints: TimeSeriesPoint[],
  windowSize: number,
): TimeSeriesPoint[] {
  if (windowSize <= 0 || dataPoints.length === 0) return dataPoints;
  const sorted = [...dataPoints].sort((a, b) => a.date.getTime() - b.date.getTime());

  return sorted.map((point, idx) => {
    const start = Math.max(0, idx - windowSize + 1);
    const window = sorted.slice(start, idx + 1);
    const avg = window
      .reduce((sum, p) => sum.plus(p.value), new Decimal(0))
      .dividedBy(window.length);
    return { ...point, value: avg };
  });
}

// ── Build time-series from daily snapshot values ───────────────────────────

export function buildTimeSeriesFromSnapshots(
  snapshots: Array<{ snapshotDate: Date | string; [key: string]: unknown }>,
  field: string,
  kpiId: KpiId,
): TimeSeriesPoint[] {
  return snapshots
    .filter((s) => s[field] != null)
    .map((s) => ({
      date: s.snapshotDate instanceof Date ? s.snapshotDate : new Date(s.snapshotDate as string),
      value: new Decimal(String(s[field])),
      kpiId,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
