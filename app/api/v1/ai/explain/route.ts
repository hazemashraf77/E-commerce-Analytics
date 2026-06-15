/**
 * POST /api/v1/ai/explain
 * Explains a Score or Decision using AI explanation layer.
 * "Every AI explanation must reference Formula IDs, KPI IDs, Score IDs, Decision IDs." (011)
 * Auth: READ_ONLY
 */
import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { explainScore, explainDecision } from "@/modules/ai-engine/application/ai.explanation";
import { getAllLatestScores } from "@/modules/score-engine/application/score.engine";
import { getCachedDecisions } from "@/modules/decision-engine/application/decision.engine";
import type { AiContext } from "@/modules/ai-engine/types/ai.types";

const Schema = z.object({
  storeId: StoreIdSchema,
  entityType: z.enum(["SCORE", "DECISION"]),
  entityId: z.string().min(1),
  locale: z.enum(["en", "ar"]).default("en"),
});

async function handler(request: NextRequest, auth: AuthContext) {
  let body: unknown;
  try { body = await request.json(); } catch { return validationError("Invalid JSON"); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return validationError("Invalid explain request", { issues: parsed.error.issues });

  const { storeId, entityType, entityId, locale } = parsed.data;

  const [scores, decisions] = await Promise.all([
    getAllLatestScores(storeId),
    Promise.resolve(getCachedDecisions(storeId)),
  ]);

  const context: AiContext = {
    storeId, locale,
    scores: scores.map(s => ({
      scoreId: s.scoreId, scoreName: s.scoreName, score: s.score,
      grade: s.grade, trend: s.trend, delta: s.delta,
      components: s.components.map(c => ({ name: c.name, contribution: c.contribution })),
      recommendedActions: s.recommendedActions,
    })),
    decisions: decisions.map(d => ({
      decisionId: d.decisionId, decisionName: d.decisionName, priority: d.priority,
      status: d.status, triggeredByRule: d.triggeredByRule ?? "DEC-RULE-000",
      reason: d.reason, recommendedAction: d.recommendedAction,
      expectedImpact: { impactLabel: "Est. Impact", impactValue: "" },
      supportingScores: d.supportingScores, supportingKpis: d.supportingKpis,
      supportingFormulaIds: d.supportingFormulaIds, confidence: d.confidence,
    })),
  };

  const explanation = entityType === "SCORE"
    ? explainScore(entityId, context)
    : explainDecision(entityId, context);

  return ok(explanation, { requestId: auth.requestId, entityType, entityId });
}

export const POST = withAuth(handler, "READ_ONLY");
