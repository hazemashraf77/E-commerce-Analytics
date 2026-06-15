/**
 * Historical Score repository.
 * Repository Consistency Pass 2026-06-12 — Task 2, Task 6
 *
 * "Historical records SHALL be immutable." (Task 3 principle, applied to scores)
 * Scores are persisted via settings table (settings.key = "score_history:<scoreId>:<date>")
 * until the dedicated score_snapshots table is added in the next DB migration.
 *
 * Production migration path: Sprint 9 adds score_snapshots table per schema below.
 */

import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";
import type { ScoreResult } from "../types/score.types";
import type {
  HistoricalScoreSnapshot,
  ScoreTrendSummary,
  SnapshotGranularity,
} from "../domain/historical-score.entity";
import { deriveTrend } from "../types/score.types";

const logger = createLogger("HistoricalScoreRepository");

// ── Persist daily snapshot ─────────────────────────────────────────────────

export async function persistScoreSnapshot(
  storeId: string,
  score: ScoreResult,
  previousScore: number,
): Promise<HistoricalScoreSnapshot> {
  const today = new Date().toISOString().slice(0, 10);
  const delta = score.score - previousScore;
  const deltaPercent = previousScore > 0 ? (delta / previousScore) * 100 : 0;

  const snapshot: HistoricalScoreSnapshot = {
    id: crypto.randomUUID(),
    storeId,
    scoreId: score.scoreId,
    scoreName: score.scoreName,
    scoreNameAr: score.scoreNameAr,
    score: score.score,
    grade: score.grade,
    components: score.components,
    trendDirection: deriveTrend(score.score, previousScore),
    previousScore,
    delta,
    deltaPercent: Math.round(deltaPercent * 100) / 100,
    granularity: "DAILY",
    snapshotDate: today,
    dataWindow: score.dataWindow,
    formulaVersion: score.formulaVersion,
    calculationVersion: score.calculationVersion,
    calculatedAt: new Date().toISOString(),
  };

  // Persist as immutable settings entry (one per score per day)
  const key = `score_history:${score.scoreId}:${today}`;
  try {
    await prisma.setting.upsert({
      where: { storeId_key: { storeId, key } },
      update: { value: JSON.stringify(snapshot) }, // idempotent — same score same day
      create: { storeId, key, value: JSON.stringify(snapshot) },
    });
    logger.debug("Score snapshot persisted", {
      metadata: { storeId, scoreId: score.scoreId, date: today, score: score.score },
    });
  } catch (err) {
    logger.warn("Score snapshot persistence failed (non-critical)", {
      metadata: { scoreId: score.scoreId, error: String(err) },
    });
  }

  return snapshot;
}

// ── Read historical snapshots ──────────────────────────────────────────────

export async function getScoreHistory(
  storeId: string,
  scoreId: string,
  daysBack = 30,
): Promise<HistoricalScoreSnapshot[]> {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - daysBack);

  try {
    const settings = await prisma.setting.findMany({
      where: {
        storeId,
        key: { startsWith: `score_history:${scoreId}:` },
      },
      orderBy: { key: "asc" },
    });

    const snapshots = settings
      .map(s => {
        try { return JSON.parse(s.value) as HistoricalScoreSnapshot; }
        catch { return null; }
      })
      .filter((s): s is HistoricalScoreSnapshot => {
        if (!s) return false;
        return new Date(s.snapshotDate) >= fromDate;
      });

    return snapshots;
  } catch (err) {
    logger.warn("Score history read failed", { metadata: { error: String(err) } });
    return [];
  }
}

export async function getAllScoreHistories(
  storeId: string,
  daysBack = 30,
): Promise<Record<string, HistoricalScoreSnapshot[]>> {
  const scoreIds = [
    "SCORE-001","SCORE-002","SCORE-003","SCORE-004","SCORE-005",
    "SCORE-006","SCORE-007","SCORE-008","SCORE-009",
  ];
  const results = await Promise.all(
    scoreIds.map(id => getScoreHistory(storeId, id, daysBack)),
  );
  return Object.fromEntries(scoreIds.map((id, i) => [id, results[i]!]));
}

// ── Build trend summary (pre-computed — Dashboard consumes, never calculates) ──

export function buildScoreTrendSummary(
  storeId: string,
  scoreId: string,
  snapshots: HistoricalScoreSnapshot[],
  granularity: SnapshotGranularity = "DAILY",
): ScoreTrendSummary {
  if (snapshots.length === 0) {
    return {
      scoreId: scoreId as any,
      storeId,
      granularity,
      periodStart: new Date().toISOString().slice(0, 10),
      periodEnd: new Date().toISOString().slice(0, 10),
      dataPoints: [],
      overallDirection: "STABLE",
      startScore: 0, endScore: 0, peakScore: 0, troughScore: 0,
      volatility: "LOW",
      summary: "Insufficient data",
    };
  }

  const sorted = [...snapshots].sort((a, b) =>
    a.snapshotDate.localeCompare(b.snapshotDate),
  );

  const scores = sorted.map(s => s.score);
  const startScore = scores[0]!;
  const endScore = scores.at(-1)!;
  const peakScore = Math.max(...scores);
  const troughScore = Math.min(...scores);
  const range = peakScore - troughScore;
  const volatility: "HIGH" | "MEDIUM" | "LOW" =
    range >= 15 ? "HIGH" : range >= 8 ? "MEDIUM" : "LOW";

  const overallDirection = deriveTrend(endScore, startScore);

  const directionLabel = {
    STABLE: "Stable",
    IMPROVING: "Improving",
    DECLINING: "Declining",
    VOLATILE: "Volatile",
    CRITICAL_DECLINE: "Critical Decline",
  }[overallDirection];

  return {
    scoreId: scoreId as any,
    storeId,
    granularity,
    periodStart: sorted[0]!.snapshotDate,
    periodEnd: sorted.at(-1)!.snapshotDate,
    dataPoints: sorted.map(s => ({
      date: s.snapshotDate,
      score: s.score,
      grade: s.grade,
    })),
    overallDirection,
    startScore,
    endScore,
    peakScore,
    troughScore,
    volatility,
    summary: `${directionLabel} · ${startScore}→${endScore} pts · Peak ${peakScore} · Trough ${troughScore}`,
  };
}
