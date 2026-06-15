/**
 * POST /api/v1/ai/query
 * Natural language business question answered using engine outputs.
 * "AI translates questions into references to engine outputs." (011)
 * Auth: READ_ONLY
 */
import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { answerQuery } from "@/modules/ai-engine/application/ai.explanation";
import { getAllLatestScores } from "@/modules/score-engine/application/score.engine";
import { getCachedDecisions } from "@/modules/decision-engine/application/decision.engine";
import type { AiContext } from "@/modules/ai-engine/types/ai.types";


const Schema = z.object({
  storeId: StoreIdSchema,
  message: z.string().min(1).max(1000),
  locale: z.enum(["en", "ar"]).default("en"),
  sessionContext: z.record(z.string()).optional(),
});

async function handler(request: NextRequest, auth: AuthContext) {
  let body: unknown;
  try { body = await request.json(); } catch { return validationError("Invalid JSON"); }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) return validationError("Invalid query", { issues: parsed.error.issues });

  const { storeId, message, locale } = parsed.data;
  const queryId = crypto.randomUUID();

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
      expectedImpact: { impactLabel: "", impactValue: "" },
      supportingScores: d.supportingScores, supportingKpis: d.supportingKpis,
      supportingFormulaIds: d.supportingFormulaIds, confidence: d.confidence,
    })),
  };

  const explanation = answerQuery(message, context);

  return ok({
    queryId,
    answer: explanation.text,
    references: explanation.references,
    confidence: explanation.confidencePct,
    warnings: explanation.warnings ?? [],
    generatedAt: explanation.generatedAt,
    modelVersion: explanation.modelVersion,
  }, { requestId: auth.requestId });
}

export const POST = withAuth(handler, "READ_ONLY");
