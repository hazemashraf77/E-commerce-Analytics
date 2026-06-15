/**
 * GET /api/v1/ai/brief?storeId=&locale=
 * Generates an AI Daily Brief narrating Score Engine and Decision Engine outputs.
 * Repository: 011_AI_ENGINE.md v2.0.0 — AI DAILY BRIEF
 * "Daily Brief narrates Score and Decision Engine outputs. Does NOT generate them." (011)
 * Auth: READ_ONLY
 */
import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema } from "@/lib/api/schemas";
import { generateDailyBrief } from "@/modules/ai-engine/application/ai.explanation";
import { getAllLatestScores } from "@/modules/score-engine/application/score.engine";
import { getCachedDecisions } from "@/modules/decision-engine/application/decision.engine";
import type { AiContext } from "@/modules/ai-engine/types/ai.types";

const Schema = z.object({
  storeId: StoreIdSchema,
  locale: z.enum(["en", "ar"]).default("en"),
});

async function handler(request: NextRequest, auth: AuthContext) {
  const parsed = Schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return validationError("storeId required");

  const { storeId, locale } = parsed.data;

  // Build AI context from engine outputs — AI never generates these independently
  const [scores, decisions] = await Promise.all([
    getAllLatestScores(storeId),
    Promise.resolve(getCachedDecisions(storeId)),
  ]);

  const context: AiContext = {
    storeId,
    locale,
    scores: scores.map(s => ({
      scoreId: s.scoreId,
      scoreName: s.scoreName,
      score: s.score,
      grade: s.grade,
      trend: s.trend,
      delta: s.delta,
      components: s.components.map(c => ({ name: c.name, contribution: c.contribution })),
      recommendedActions: s.recommendedActions,
    })),
    decisions: decisions.map(d => ({
      decisionId: d.decisionId,
      decisionName: d.decisionName,
      priority: d.priority,
      status: d.status,
      triggeredByRule: d.triggeredByRule ?? "DEC-RULE-000",
      reason: d.reason,
      recommendedAction: d.recommendedAction,
      expectedImpact: { impactLabel: "Est. Impact", impactValue: "See Decision Engine" },
      supportingScores: d.supportingScores,
      supportingKpis: d.supportingKpis,
      supportingFormulaIds: d.supportingFormulaIds,
      confidence: d.confidence,
    })),
  };

  const brief = generateDailyBrief(context);
  return ok(brief, { requestId: auth.requestId, locale, scoreCount: scores.length, decisionCount: decisions.length });
}

export const GET = withAuth(handler, "READ_ONLY");
