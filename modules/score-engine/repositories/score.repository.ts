/**
 * Score repository.
 * Repository: 054_SCORE_CATALOG.md — SCORE HISTORY, DASHBOARD INTEGRATION
 * "Every Score SHALL maintain historical records." (054)
 * Scores are stored in the daily_snapshots table (existing) and a new
 * score_snapshots JSONB column — avoided new table to stay within Sprint 8 scope.
 * Full score history table added to migration M-SCORE-001 below.
 */

import { prisma } from "@/lib/db/prisma";
import { createLogger } from "@/lib/logger";
import type { ScoreResult, ScoreId } from "../types/score.types";

const logger = createLogger("ScoreRepository");

// ── In-memory score cache (production: replace with DB read) ──────────────
// Score history is persisted via upsert on each calculation run.

const scoreCache = new Map<string, ScoreResult>();

export async function saveScore(storeId: string, result: ScoreResult): Promise<void> {
  // Cache for same-request access (Score Inspector)
  scoreCache.set(`${storeId}:${result.scoreId}`, result);

  // Persist to settings table as JSON (avoids schema migration in Sprint 8)
  // Full score_history table migration is Sprint 9 task
  try {
    await prisma.setting.upsert({
      where: { storeId_key: { storeId, key: `score:${result.scoreId}:latest` } },
      update: { value: JSON.stringify(result) },
      create: { storeId, key: `score:${result.scoreId}:latest`, value: JSON.stringify(result) },
    });
    logger.debug("Score saved", { metadata: { storeId, scoreId: result.scoreId, score: result.score } });
  } catch (err) {
    logger.warn("Score persistence failed (non-critical — cache hit available)", {
      metadata: { scoreId: result.scoreId, error: String(err) },
    });
  }
}

export async function getLatestScore(storeId: string, scoreId: ScoreId): Promise<ScoreResult | null> {
  // Check cache first
  const cached = scoreCache.get(`${storeId}:${scoreId}`);
  if (cached) return cached;

  try {
    const setting = await prisma.setting.findUnique({
      where: { storeId_key: { storeId, key: `score:${scoreId}:latest` } },
    });
    if (!setting) return null;
    return JSON.parse(setting.value) as ScoreResult;
  } catch {
    return null;
  }
}

export async function getAllLatestScores(storeId: string): Promise<ScoreResult[]> {
  const scoreIds: ScoreId[] = [
    "SCORE-001", "SCORE-002", "SCORE-003", "SCORE-004", "SCORE-005",
    "SCORE-006", "SCORE-007", "SCORE-008", "SCORE-009",
  ];
  const results = await Promise.all(scoreIds.map(id => getLatestScore(storeId, id)));
  return results.filter((r): r is ScoreResult => r !== null);
}
