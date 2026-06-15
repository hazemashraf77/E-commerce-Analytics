/**
 * AI Engine types.
 * Repository: 011_AI_ENGINE.md v2.0.0
 *
 * "AI never calculates business values." (011)
 * "AI never generates scores or recommendations independently." (011)
 * "Scores come from Score Engine. Recommendations come from Decision Engine." (011)
 *
 * All AI outputs reference Formula IDs, KPI IDs, Score IDs, Decision IDs.
 */

// ── AI roles (011: AI ROLES) ───────────────────────────────────────────────

export type AiRole = "EXPLAIN" | "SUMMARIZE" | "ANSWER" | "ASSIST" | "SIMULATE";

// ── AI input context (what AI receives before responding) ─────────────────

export interface AiContext {
  storeId: string;
  locale: "en" | "ar";
  // Engine outputs AI is authorized to consume
  scores?: Array<{
    scoreId: string; scoreName: string; score: number; grade: string;
    trend: string; delta: number; components: Array<{ name: string; contribution: number }>;
    recommendedActions: string[];
  }>;
  decisions?: Array<{
    decisionId: string; decisionName: string; priority: string; status: string;
    triggeredByRule: string; reason: string; recommendedAction: string;
    expectedImpact: { impactLabel: string; impactValue: string };
    supportingScores: string[]; supportingKpis: string[]; supportingFormulaIds: string[];
    confidence: number;
  }>;
  kpis?: Record<string, { value: string; kpiId: string; formulaId: string; trend?: string }>;
  recentAlerts?: Array<{ priority: string; title: string; message: string; decisionId: string }>;
  /** Formula Catalog entries AI may reference in explanations */
  formulaCatalogRefs?: string[];
  /** Session context (temporary — never modifies business data) */
  sessionContext?: {
    previousKpiDiscussed?: string;
    currentPeriod?: string;
    currentProductId?: string;
    currentDecisionId?: string;
  };
}

// ── AI explanation output ──────────────────────────────────────────────────

export interface AiExplanation {
  role: AiRole;
  text: string;                       // natural language explanation
  textAr?: string;                    // Arabic version
  /** All references included in this explanation */
  references: AiReference[];
  confidence: "VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT_DATA";
  confidencePct: number;
  /** Scenario-specific: only populated when role = SIMULATE */
  projectedValues?: Array<{ label: string; value: string; isProjected: true }>;
  generatedAt: string;
  modelVersion: string;               // "scaffold-1.0.0" until real model
  warnings?: string[];                // e.g. "Insufficient historical data"
}

export interface AiReference {
  type: "FORMULA" | "KPI" | "SCORE" | "DECISION" | "RULE" | "HISTORY";
  id: string;                         // FIN-001, KPI-FIN-001, SCORE-001, DEC-001
  label: string;
  value?: string;                     // the actual value at time of explanation
}

// ── Daily Brief ───────────────────────────────────────────────────────────

export interface AiDailyBrief {
  briefId: string;
  storeId: string;
  generatedAt: string;
  period: string;
  locale: "en" | "ar";
  /** All sections narrate engine outputs — AI never generates scores/recommendations */
  sections: AiDailyBriefSection[];
  scoresSummary: string;          // narrates all 9 scores
  decisionsSummary: string;       // narrates active decisions
  priorityActions: string[];      // from Decision Engine CRITICAL + HIGH decisions
  confidence: number;
  references: AiReference[];
}

export interface AiDailyBriefSection {
  sectionKey: string;
  title: string;
  titleAr: string;
  content: string;
  contentAr?: string;
  scoreRef?: string;
  kpiRefs: string[];
  decisionRefs: string[];
}

// ── Natural language query ────────────────────────────────────────────────

export interface AiQuery {
  queryId: string;
  storeId: string;
  userMessage: string;
  locale: "en" | "ar";
  context: AiContext;
}

export interface AiQueryResponse {
  queryId: string;
  answer: string;
  answerAr?: string;
  references: AiReference[];
  confidence: number;
  followUpSuggestions?: string[];
  generatedAt: string;
}

// ── Scenario simulation input/output ─────────────────────────────────────

export interface ScenarioSimulationInput {
  storeId: string;
  scenarioName: string;
  /** Formula IDs that may be used in simulation — must all exist in 033_FORMULA_CATALOG */
  approvedFormulaIds: string[];
  parameters: Record<string, number>;
  context: AiContext;
}

export interface ScenarioSimulationOutput {
  scenarioName: string;
  projectedValues: Array<{ label: string; value: string; formulaId: string; isProjected: true }>;
  narrative: string;
  /** FR-002: all simulated values must be labeled projected */
  projectedLabel: "PROJECTED — NOT REALIZED";
  assumptions: string[];
  limitations: string[];
  generatedAt: string;
}
