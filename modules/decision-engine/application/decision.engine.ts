/**
 * Decision Engine orchestrator.
 * Repository: 055_DECISION_ENGINE.md — DECISION LIFECYCLE, ALERT GENERATION
 * "Decision Engine consumes Score Engine outputs only." (055: PHILOSOPHY)
 * "BR-DEC-001: Never modifies business data."
 * "BR-DEC-002: Never auto-executes."
 */

import { createLogger } from "@/lib/logger";
import type {
  DecisionRecord, DecisionAlert, MatrixResult,
} from "../types/decision.types";
import type { ScoreSnapshot } from "../domain/decision.rules";
import { applyDecisionMatrix } from "../types/decision.types";
import { evaluateDecisionRules } from "./decision.rules";
import { prisma } from "@/lib/db/prisma";
import { persistDecision } from "../repositories/historical-decision.repository";

const logger = createLogger("DecisionEngine");

// ── In-memory cache ────────────────────────────────────────────────────────

const decisionCache = new Map<string, DecisionRecord[]>();
const alertCache    = new Map<string, DecisionAlert[]>();

// ── Main execution ─────────────────────────────────────────────────────────

export interface DecisionEngineOutput {
  storeId: string;
  decisions: DecisionRecord[];
  alerts: DecisionAlert[];
  matrixResult: MatrixResult;
  computedAt: string;
}

export async function computeDecisions(
  storeId: string,
  scores: ScoreSnapshot,
): Promise<DecisionEngineOutput> {
  logger.info("Decision Engine: evaluating rules", { metadata: { storeId } });

  // Apply decision matrix (055: DECISION MATRIX)
  const matrixResult = applyDecisionMatrix(scores.opportunityScore, scores.riskScore);

  // Evaluate all 15 decision rules (055: DECISION RULES)
  const decisions = evaluateDecisionRules(scores, storeId);

  // Sort by priority (CRITICAL first) per 055: DECISION PRIORITY
  const priorityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  decisions.sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3));

  // Generate alerts (055: ALERT GENERATION)
  const alerts: DecisionAlert[] = decisions
    .filter(d => d.priority === "CRITICAL" || d.priority === "HIGH")
    .map(d => ({
      alertId:    crypto.randomUUID(),
      decisionId: d.decisionId,
      alertType:  "SMART_ALERT" as const,
      priority:   d.priority,
      title:      d.decisionName,
      message:    d.reason,
      category:   d.category,
      scoreRef:   d.supportingScores[0],
      kpiRef:     d.supportingKpis[0],
      createdAt:  new Date().toISOString(),
      dismissed:  false,
    }));

  // Cache
  decisionCache.set(storeId, decisions);
  alertCache.set(storeId, alerts);

  // Persist to historical decision repository (Task 3 — immutable decision history)
  await Promise.all(decisions.map(d => persistDecision(storeId, d)));

  // Persist to ai_recommendations table (existing schema — nearest fit)
  try {
    await prisma.aiRecommendation.createMany({
      data: decisions.map(d => ({
        storeId,
        priority: priorityOrder[d.priority] ?? 3,
        category: d.category as any,
        confidence: d.confidence,
        supportingKpis: d.supportingKpis,
        expectedImpact: `${d.expectedImpact.impactLabel}: ${d.expectedImpact.impactValue}`,
        recommendedAction: d.recommendedAction,
      })),
      skipDuplicates: true,
    });
  } catch (err) {
    logger.warn("Decision persistence partial failure (non-critical)", {
      metadata: { error: String(err) },
    });
  }

  logger.info("Decision Engine: complete", {
    metadata: {
      storeId,
      decisionsCount: decisions.length,
      alertsCount: alerts.length,
      matrixDecision: matrixResult.decision,
    },
  });

  return {
    storeId,
    decisions,
    alerts,
    matrixResult,
    computedAt: new Date().toISOString(),
  };
}

export function getCachedDecisions(storeId: string): DecisionRecord[] {
  return decisionCache.get(storeId) ?? [];
}

export function getCachedAlerts(storeId: string): DecisionAlert[] {
  return alertCache.get(storeId) ?? [];
}
