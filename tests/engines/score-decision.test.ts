/**
 * tests/engines/score-decision.test.ts
 * Sprint 8 — Score Engine + Decision Engine tests.
 */

import { describe, it, expect } from "vitest";

// ── Weight validation (054: Σ Weights = 100%) ─────────────────────────────

describe("Score weight tables (054_SCORE_CATALOG: Σ = 100%)", () => {
  it("all 9 score weight tables sum to exactly 1.0", async () => {
    const { SCORE_WEIGHTS } = await import("@/modules/score-engine/types/score.types");
    for (const [scoreId, weights] of Object.entries(SCORE_WEIGHTS)) {
      const sum = weights.reduce((s, w) => s + w.weight, 0);
      expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
    }
  });
});

// ── Score range (054: 0–100) ──────────────────────────────────────────────

describe("Score outputs are in 0–100 range (054_SCORE_CATALOG)", () => {
  it("Business Health Score is 0–100", async () => {
    const { calculateBusinessHealthScore } = await import("@/modules/score-engine/application/score.calculator");
    const result = calculateBusinessHealthScore({
      profitMargin: 0.22, deliveryRate: 0.87, returnRate: 0.057, refusalRate: 0.04,
      inventoryTurnover: 6, marketingRoi: 9.74, cashPosition: 42100,
      settlementCompletionRate: 0.88, trendDelta: 0.032,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqualTo(100);
    expect(result.scoreId).toBe("SCORE-001");
    expect(result.components).toHaveLength(8);
  });

  it("Marketing Health Score is 0–100", async () => {
    const { calculateMarketingHealthScore } = await import("@/modules/score-engine/application/score.calculator");
    const result = calculateMarketingHealthScore(100, 9.74, 0.219, 0.87, 0.032, 65);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqualTo(100);
    expect(result.scoreId).toBe("SCORE-007");
    expect(result.components).toHaveLength(5);
  });

  it("Risk Score is 0–100", async () => {
    const { calculateRiskScore } = await import("@/modules/score-engine/application/score.calculator");
    const result = calculateRiskScore({
      profitMargin: 0.22, deliveryRate: 0.87, returnRate: 0.057, refusalRate: 0.04,
      inventoryTurnover: 6, marketingRoi: 9.74, cashPosition: 42100,
      settlementCompletionRate: 0.88, trendDelta: 0.032, returnRate: 0.057, refusalRate: 0.04,
    }, 63, 28);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqualTo(100);
    expect(result.scoreId).toBe("SCORE-009");
  });
});

// ── Grade derivation (054: SCORE GRADES) ─────────────────────────────────

describe("Score grade derivation (054: SCORE GRADES)", () => {
  it("score ≥ 90 = EXCELLENT", async () => {
    const { deriveGrade } = await import("@/modules/score-engine/types/score.types");
    expect(deriveGrade(90)).toBe("EXCELLENT");
    expect(deriveGrade(100)).toBe("EXCELLENT");
  });
  it("score 80–89 = VERY_GOOD", async () => {
    const { deriveGrade } = await import("@/modules/score-engine/types/score.types");
    expect(deriveGrade(85)).toBe("VERY_GOOD");
  });
  it("score 70–79 = GOOD", async () => {
    const { deriveGrade } = await import("@/modules/score-engine/types/score.types");
    expect(deriveGrade(74)).toBe("GOOD");
  });
  it("score 60–69 = AVERAGE", async () => {
    const { deriveGrade } = await import("@/modules/score-engine/types/score.types");
    expect(deriveGrade(65)).toBe("AVERAGE");
  });
  it("score < 50 = CRITICAL", async () => {
    const { deriveGrade } = await import("@/modules/score-engine/types/score.types");
    expect(deriveGrade(38)).toBe("CRITICAL");
  });
});

// ── Normalizers (054: HEALTH SCORE NORMALIZATION) ─────────────────────────

describe("Health score normalizers", () => {
  it("87% delivery rate normalizes to high score", async () => {
    const { normalizeDeliveryRate } = await import("@/modules/score-engine/domain/health.normalizers");
    const score = normalizeDeliveryRate(0.87);
    expect(score).toBeGreaterThan(70);
    expect(score).toBeLessThanOrEqualTo(100);
  });
  it("100% delivery rate → 100", async () => {
    const { normalizeDeliveryRate } = await import("@/modules/score-engine/domain/health.normalizers");
    expect(normalizeDeliveryRate(1.0)).toBe(100);
  });
  it("50% delivery rate → 0 (below bad threshold)", async () => {
    const { normalizeDeliveryRate } = await import("@/modules/score-engine/domain/health.normalizers");
    expect(normalizeDeliveryRate(0.50)).toBe(0);
  });
  it("2% return rate is high health (lower is better)", async () => {
    const { normalizeReturnRate } = await import("@/modules/score-engine/domain/health.normalizers");
    expect(normalizeReturnRate(0.02)).toBe(100);
  });
  it("25% return rate → 0", async () => {
    const { normalizeReturnRate } = await import("@/modules/score-engine/domain/health.normalizers");
    expect(normalizeReturnRate(0.25)).toBe(0);
  });
});

// ── Decision Matrix (055: DECISION MATRIX) ────────────────────────────────

describe("Decision Matrix (055_DECISION_ENGINE)", () => {
  it("High Opportunity + Low Risk → CRITICAL Increase Budget", async () => {
    const { applyDecisionMatrix } = await import("@/modules/decision-engine/types/decision.types");
    const result = applyDecisionMatrix(95, 20);
    expect(result.priority).toBe("CRITICAL");
    expect(result.decision).toContain("Budget");
  });
  it("Low Opportunity + High Risk → CRITICAL Pause", async () => {
    const { applyDecisionMatrix } = await import("@/modules/decision-engine/types/decision.types");
    const result = applyDecisionMatrix(45, 75);
    expect(result.priority).toBe("CRITICAL");
    expect(result.decision).toContain("Pause");
  });
  it("Medium Opportunity + Medium Risk → MEDIUM Maintain", async () => {
    const { applyDecisionMatrix } = await import("@/modules/decision-engine/types/decision.types");
    const result = applyDecisionMatrix(60, 45);
    expect(result.priority).toBe("MEDIUM");
  });
});

// ── Decision Rules (055: DEC-RULE-001 through DEC-RULE-015) ───────────────

describe("Decision Rules evaluation (055_DECISION_ENGINE)", () => {
  const baseScores = {
    businessHealth:74, productScore:81, campaignScore:67, governorateScore:78,
    shippingScore:72, inventoryHealth:63, marketingHealth:65, opportunityScore:71, riskScore:38,
    profitHealth:70, deliveryHealth:83, returnHealth:78, cashHealth:68, settlementHealth:75,
  };

  it("DEC-RULE-003: campaign < 60 → Pause Campaign decision generated", async () => {
    const { evaluateDecisionRules } = await import("@/modules/decision-engine/domain/decision.rules");
    const decisions = evaluateDecisionRules({ ...baseScores, campaignScore: 55 }, "store-001");
    const pause = decisions.find(d => d.triggeredByRule === "DEC-RULE-003");
    expect(pause).toBeDefined();
    expect(pause?.decisionId).toBe("DEC-003");
  });

  it("DEC-RULE-007: shipping < 60 → Review Shipping decision generated", async () => {
    const { evaluateDecisionRules } = await import("@/modules/decision-engine/domain/decision.rules");
    const decisions = evaluateDecisionRules({ ...baseScores, shippingScore: 55 }, "store-001");
    const ship = decisions.find(d => d.triggeredByRule === "DEC-RULE-007");
    expect(ship).toBeDefined();
    expect(ship?.decisionId).toBe("DEC-007");
  });

  it("DEC-RULE-015: business health < 50 → Executive Emergency Review", async () => {
    const { evaluateDecisionRules } = await import("@/modules/decision-engine/domain/decision.rules");
    const decisions = evaluateDecisionRules({ ...baseScores, businessHealth: 45 }, "store-001");
    const emergency = decisions.find(d => d.triggeredByRule === "DEC-RULE-015");
    expect(emergency).toBeDefined();
    expect(emergency?.priority).toBe("CRITICAL");
    expect(emergency?.decisionId).toBe("DEC-010");
  });

  it("No critical rules fire when all scores are healthy", async () => {
    const { evaluateDecisionRules } = await import("@/modules/decision-engine/domain/decision.rules");
    const healthyScores = {
      businessHealth:92, productScore:88, campaignScore:85, governorateScore:87,
      shippingScore:83, inventoryHealth:81, marketingHealth:80, opportunityScore:88, riskScore:20,
      profitHealth:85, deliveryHealth:91, returnHealth:86, cashHealth:82, settlementHealth:84,
    };
    const decisions = evaluateDecisionRules(healthyScores, "store-001");
    const criticals = decisions.filter(d => d.priority === "CRITICAL");
    expect(criticals).toHaveLength(0);
  });

  it("All decisions reference supporting scores (BR-DEC-003)", async () => {
    const { evaluateDecisionRules } = await import("@/modules/decision-engine/domain/decision.rules");
    const decisions = evaluateDecisionRules({ ...baseScores, campaignScore: 55, shippingScore: 55 }, "store-001");
    for (const d of decisions) {
      expect(d.supportingScores.length).toBeGreaterThan(0);
      expect(d.reason.length).toBeGreaterThan(0);
    }
  });

  it("All decisions have expectedImpact with impactValue (UI Polish 3)", async () => {
    const { evaluateDecisionRules } = await import("@/modules/decision-engine/domain/decision.rules");
    const decisions = evaluateDecisionRules(baseScores, "store-001");
    for (const d of decisions) {
      expect(d.expectedImpact.impactValue.length).toBeGreaterThan(0);
      expect(d.expectedImpact.impactLabel.length).toBeGreaterThan(0);
    }
  });

  it("BR-DEC-002: all decisions start as OPEN (never auto-executed)", async () => {
    const { evaluateDecisionRules } = await import("@/modules/decision-engine/domain/decision.rules");
    const decisions = evaluateDecisionRules(baseScores, "store-001");
    for (const d of decisions) {
      expect(d.status).toBe("OPEN");
    }
  });
});

// ── UI Polish tests ───────────────────────────────────────────────────────

describe("UI Polish mock data", () => {
  it("Cost evolution deltas are precomputed (UI Polish 1 — zero UI calculation)", async () => {
    const { MOCK_COST_EVOLUTION_DELTAS } = await import("@/lib/dashboard/mock-data");
    expect(MOCK_COST_EVOLUTION_DELTAS).toHaveLength(6);
    expect(MOCK_COST_EVOLUTION_DELTAS[0]!.deltaLabel).toBe("baseline");
    const nonBaseline = MOCK_COST_EVOLUTION_DELTAS.filter(d => d.deltaLabel !== "baseline");
    for (const d of nonBaseline) {
      expect(d.deltaPerOrder).toBeGreaterThan(0);
    }
  });

  it("Score history sparkline data is precomputed (UI Polish 4)", async () => {
    const { MOCK_SCORE_HISTORY } = await import("@/lib/dashboard/mock-data");
    for (let i = 1; i <= 9; i++) {
      const key = `SCORE-00${i}`;
      expect(MOCK_SCORE_HISTORY[key]).toBeDefined();
      expect(MOCK_SCORE_HISTORY[key]!.length).toBe(14);
    }
  });

  it("Decision impact badges precomputed (UI Polish 3)", async () => {
    const { MOCK_DECISION_IMPACTS } = await import("@/lib/dashboard/mock-data");
    expect(MOCK_DECISION_IMPACTS.length).toBeGreaterThan(0);
    for (const imp of MOCK_DECISION_IMPACTS) {
      expect(imp.impactValue.length).toBeGreaterThan(0);
      expect(imp.impactLabel.length).toBeGreaterThan(0);
    }
  });

  it("Today snapshot has all 7 required fields (UI Polish 5)", async () => {
    const { MOCK_TODAY_SNAPSHOT } = await import("@/lib/dashboard/mock-data");
    expect(typeof MOCK_TODAY_SNAPSHOT.revenueToday).toBe("number");
    expect(typeof MOCK_TODAY_SNAPSHOT.ordersToday).toBe("number");
    expect(typeof MOCK_TODAY_SNAPSHOT.itemsToday).toBe("number");
    expect(typeof MOCK_TODAY_SNAPSHOT.deliveredToday).toBe("number");
    expect(typeof MOCK_TODAY_SNAPSHOT.profitToday).toBe("number");
    expect(typeof MOCK_TODAY_SNAPSHOT.adsSpendToday).toBe("number");
    expect(typeof MOCK_TODAY_SNAPSHOT.cashReceivedToday).toBe("number");
  });

  it("Profit leakage rows are sorted DESC by total (UI Polish 2 — backend pre-sorted)", async () => {
    const { MOCK_PROFIT_LEAKAGE } = await import("@/lib/dashboard/mock-data");
    for (let i = 0; i < MOCK_PROFIT_LEAKAGE.length - 1; i++) {
      expect(MOCK_PROFIT_LEAKAGE[i]!.total).toBeGreaterThanOrEqual(MOCK_PROFIT_LEAKAGE[i + 1]!.total);
    }
  });
});
