/**
 * AI prompt library scaffold.
 * Repository: 035_AI_PROMPTS_LIBRARY.md, 011_AI_ENGINE.md v2.0.0
 *
 * These prompts are templates for future LLM integration.
 * Each prompt enforces the AI architecture rules:
 *  - Must reference Formula IDs, KPI IDs, Score IDs, Decision IDs
 *  - Must never invent scores or recommendations
 *  - Must label projected values as PROJECTED (FR-002)
 *  - Must separate cash from profit (FR-004)
 *
 * Scaffold: no LLM API call yet. Templates are ready for wiring.
 */

// ── System prompt (injected at every AI session start) ────────────────────

export const SYSTEM_PROMPT = `You are an AI Business Copilot for an e-commerce analytics platform.

CRITICAL RULES:
1. You NEVER generate business scores independently. Scores come ONLY from the Score Engine (SCORE-001 through SCORE-009). Reference them by ID.
2. You NEVER generate recommendations independently. Recommendations come ONLY from the Decision Engine (DEC-001 through DEC-010). Reference them by Decision ID and Decision Rule ID.
3. Every explanation MUST reference: Formula IDs (FIN-001 etc.), KPI IDs (KPI-FIN-001 etc.), Score IDs (SCORE-xxx), Decision IDs (DEC-xxx).
4. Projected values MUST be labeled as "PROJECTED — NOT REALIZED" (FR-002).
5. Cash and Profit are SEPARATE — never mix them (FR-004).
6. You NEVER perform financial calculations. Values come from Business Engines only.
7. When you are uncertain, say so. Never fabricate business numbers.

Your role is to: EXPLAIN, SUMMARIZE, ANSWER, ASSIST, and SIMULATE (using approved formulas only).

The platform pipeline is:
Business Engines → Formula Engine → Analytics Engine → Score Engine → Decision Engine → You

You narrate what the engines found. You do not replace them.`;

// ── Score explanation prompt ───────────────────────────────────────────────

export const buildScoreExplanationPrompt = (params: {
  scoreId: string; scoreName: string; score: number; grade: string;
  trend: string; delta: number;
  components: Array<{ name: string; contribution: number }>;
  recommendedActions: string[];
  locale: "en" | "ar";
}): string => `
Explain the following business score in ${params.locale === "ar" ? "Arabic" : "English"}.
Reference the Score ID in your explanation.

Score: ${params.scoreId} — ${params.scoreName}
Value: ${params.score}/100 (${params.grade})
Trend: ${params.trend}, Delta: ${params.delta >= 0 ? "+" : ""}${params.delta} points
Components (contributions): ${params.components.map(c => `${c.name}: ${c.contribution.toFixed(1)} pts`).join(", ")}
Recommended actions from Score Engine: ${params.recommendedActions.join("; ")}

Rules:
- Reference ${params.scoreId} explicitly
- Do not generate additional recommendations beyond what Score Engine provided
- Keep explanation under 100 words
- If score < 60, mention urgency
`;

// ── Decision explanation prompt ────────────────────────────────────────────

export const buildDecisionExplanationPrompt = (params: {
  decisionId: string; decisionName: string; priority: string;
  triggeredByRule: string; reason: string; recommendedAction: string;
  supportingScores: string[]; supportingKpis: string[];
  expectedImpactLabel: string; expectedImpactValue: string;
  confidence: number; locale: "en" | "ar";
}): string => `
Explain the following Decision Engine recommendation in ${params.locale === "ar" ? "Arabic" : "English"}.

Decision: ${params.decisionId} — ${params.decisionName}
Priority: ${params.priority}
Triggered by rule: ${params.triggeredByRule}
Reason: ${params.reason}
Supporting scores: ${params.supportingScores.join(", ")}
Supporting KPIs: ${params.supportingKpis.join(", ")}
Recommended action: ${params.recommendedAction}
Expected impact: ${params.expectedImpactLabel} — ${params.expectedImpactValue}
Confidence: ${Math.round(params.confidence * 100)}%

Rules:
- Reference ${params.decisionId} and ${params.triggeredByRule} explicitly
- Mention that this recommendation comes from the Decision Engine
- State that user approval is required before any action (BR-DEC-002)
- Keep explanation under 120 words
`;

// ── Daily Brief prompt ─────────────────────────────────────────────────────

export const buildDailyBriefPrompt = (params: {
  scoresSummary: string; activeDecisions: number;
  criticalCount: number; locale: "en" | "ar";
}): string => `
Generate a concise executive Daily Brief in ${params.locale === "ar" ? "Arabic" : "English"}.

Data from engines:
- Scores: ${params.scoresSummary}
- Active decisions: ${params.activeDecisions}
- CRITICAL decisions: ${params.criticalCount}

Rules:
- Reference specific Score IDs (SCORE-001 etc.)
- Reference specific Decision IDs (DEC-xxx) for action items
- Label any forward-looking value as PROJECTED
- Separate cash mentions from profit mentions
- Total length: 150-200 words
- Do not invent any metric values
`;

// ── Scenario simulation prompt ─────────────────────────────────────────────

export const buildScenarioPrompt = (params: {
  scenarioName: string; parameters: Record<string, number>;
  approvedFormulaIds: string[]; locale: "en" | "ar";
}): string => `
Simulate the following business scenario in ${params.locale === "ar" ? "Arabic" : "English"}.
Use ONLY these approved formulas: ${params.approvedFormulaIds.join(", ")} (from 033_FORMULA_CATALOG.md).

Scenario: ${params.scenarioName}
Parameters: ${Object.entries(params.parameters).map(([k,v]) => `${k} = ${v}`).join(", ")}

Rules:
- Label ALL simulated results as "PROJECTED — NOT REALIZED" (FR-002)
- Reference formula IDs for every calculation
- Do not mix simulated values with realized historical values
- State assumptions clearly
- Include limitations section
`;
