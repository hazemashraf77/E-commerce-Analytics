/**
 * Historical Score entity.
 * Repository: 054_SCORE_CATALOG.md — SCORE HISTORY
 *             004_CANONICAL_DATA_MODEL.md — Entity conventions
 *             Repository Consistency Pass 2026-06-12 — Task 2, Task 6
 *
 * "Every Score SHALL maintain historical records." (054)
 * "Historical records SHALL be immutable." (Repository Consistency Pass)
 * "Dashboard SHALL NEVER generate historical values." (Repository Consistency Pass)
 *
 * Historical Score is a first-class canonical entity:
 *  • Daily snapshots (base resolution)
 *  • Weekly rollups (derived, not calculated by Dashboard)
 *  • Monthly rollups (derived, not calculated by Dashboard)
 *  • Trend direction and magnitude (pre-computed, not derived in Dashboard)
 */

import type { ScoreId, ScoreGradeLabel, ScoreTrend, ScoreComponent } from "../types/score.types";

// ── Snapshot granularity ───────────────────────────────────────────────────

export type SnapshotGranularity = "DAILY" | "WEEKLY" | "MONTHLY";

// ── Historical Score snapshot (immutable) ─────────────────────────────────

export interface HistoricalScoreSnapshot {
  /** Unique ID — immutable */
  id: string;
  storeId: string;
  scoreId: ScoreId;
  scoreName: string;
  scoreNameAr: string;

  // Score values
  score: number;                    // 0–100
  grade: ScoreGradeLabel;
  components: ScoreComponent[];

  // Trend data (pre-computed by Score Engine — NEVER by Dashboard)
  trendDirection: ScoreTrend;
  previousScore: number;
  delta: number;                    // score − previousScore
  deltaPercent: number;             // delta / previousScore × 100

  // Snapshot metadata
  granularity: SnapshotGranularity;
  snapshotDate: string;             // ISO date "YYYY-MM-DD"
  dataWindow: string;               // e.g. "Last 30 days"
  formulaVersion: string;           // "1.0.0"
  calculationVersion: string;       // engine version

  // Audit
  calculatedAt: string;             // ISO timestamp (immutable)
}

// ── Trend summary (aggregated read model for Dashboard sparklines) ─────────

export interface ScoreTrendSummary {
  scoreId: ScoreId;
  storeId: string;
  granularity: SnapshotGranularity;
  periodStart: string;
  periodEnd: string;
  dataPoints: Array<{ date: string; score: number; grade: ScoreGradeLabel }>;
  overallDirection: ScoreTrend;
  startScore: number;
  endScore: number;
  peakScore: number;
  troughScore: number;
  volatility: "HIGH" | "MEDIUM" | "LOW";
  /** Pre-computed — Dashboard reads this, never calculates it */
  summary: string;
}

// ── Timeline entry (for History timeline views) ───────────────────────────

export interface ScoreTimelineEntry {
  scoreId: ScoreId;
  date: string;
  score: number;
  grade: ScoreGradeLabel;
  delta: number;
  event?: string;           // notable event label if available
}
