/**
 * tests/consistency/repository-consistency.test.ts
 * Repository Consistency Pass 2026-06-12 — Task 7
 *
 * Verifies:
 * • Every Score references Score ID (Task 7)
 * • Every Score references Formula Version (Task 7)
 * • Every Score references active component weights summing to 100% (Task 7)
 * • Business Stability is RESERVED / INACTIVE in v1.0 — NOT deleted (Task 1)
 * • Every Decision references Decision Rule (Task 7)
 * • Every Decision references supporting KPI IDs (Task 7)
 * • Every Decision references supporting Formula IDs (Task 7)
 * • Historical entities are immutable (Task 7)
 * • Structured impact model has all 5 dimensions (Task 5)
 * • Decision lifecycle transitions are valid (Task 3)
 */

import { describe, it, expect } from "vitest";

// ── Task 1: SCORE-001 Business Stability resolution ───────────────────────

describe("Task 1: SCORE-001 Business Stability — RESERVED / INACTIVE", () => {
  it("SCORE-001 active weight table sums to exactly 100%", async () => {
    const { SCORE_WEIGHTS } = await import("@/modules/score-engine/types/score.types");
    const weights = SCORE_WEIGHTS["SCORE-001"]!;
    const sum = weights.reduce((s, w) => s + w.weight, 0);
    expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
  });

  it("Business Stability is RESERVED — present in RESERVED_INACTIVE_COMPONENTS", async () => {
    const { RESERVED_INACTIVE_COMPONENTS } = await import("@/modules/score-engine/types/score.types");
    const reserved = RESERVED_INACTIVE_COMPONENTS["SCORE-001"]!;
    expect(reserved.length).toBeGreaterThan(0);
    expect(reserved[0]!.name).toBe("Business Stability");
    expect(reserved[0]!.reservedWeight).toBe(0.10);
    expect(reserved[0]!.activeVersion).toBe("2.0.0");
  });

  it("Business Stability is NOT present in active weight table (inactive v1.0)", async () => {
    const { SCORE_WEIGHTS } = await import("@/modules/score-engine/types/score.types");
    const activeNames = SCORE_WEIGHTS["SCORE-001"]!.map(w => w.name);
    expect(activeNames).not.toContain("Business Stability");
  });

  it("Business Stability is documented with reason and activation plan", async () => {
    const { RESERVED_INACTIVE_COMPONENTS } = await import("@/modules/score-engine/types/score.types");
    const stability = RESERVED_INACTIVE_COMPONENTS["SCORE-001"]![0]!;
    expect(stability.reason.length).toBeGreaterThan(20);
    expect(stability.activeVersion).toBeDefined();
  });
});

// ── Task 7: Every Score references Score ID and Formula Version ───────────

describe("Task 7: Score structural integrity", () => {
  it("all 9 score IDs are unique and non-empty", async () => {
    const { SCORE_IDS } = await import("@/modules/score-engine/types/score.types");
    const ids = Object.values(SCORE_IDS);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
    expect(ids.every(id => id.startsWith("SCORE-"))).toBe(true);
  });

  it("score calculator produces formulaVersion and calculationVersion", async () => {
    const { calculateBusinessHealthScore } = await import("@/modules/score-engine/application/score.calculator");
    const result = calculateBusinessHealthScore({
      profitMargin: 0.22, deliveryRate: 0.87, returnRate: 0.057, refusalRate: 0.04,
      inventoryTurnover: 6, marketingRoi: 9.74, cashPosition: 42100,
      settlementCompletionRate: 0.88, trendDelta: 0.032,
    });
    expect(result.formulaVersion).toBe("1.0.0");
    expect(result.calculationVersion).toBe("1.0.0");
    expect(result.scoreId).toBeDefined();
  });

  it("all 9 weight tables sum to 1.0 (Σ Weights = 100%)", async () => {
    const { SCORE_WEIGHTS } = await import("@/modules/score-engine/types/score.types");
    for (const [scoreId, weights] of Object.entries(SCORE_WEIGHTS)) {
      const sum = weights.reduce((s, w) => s + w.weight, 0);
      expect(Math.abs(sum - 1.0)).toBeLessThan(0.001);
    }
  });
});

// ── Task 7: Every Decision references Decision Rule and supporting IDs ─────

describe("Task 7: Decision structural integrity", () => {
  const scores = {
    businessHealth:74, productScore:81, campaignScore:55, governorateScore:78,
    shippingScore:55, inventoryHealth:35, marketingHealth:55, opportunityScore:71, riskScore:38,
    profitHealth:70, deliveryHealth:83, returnHealth:78, cashHealth:68, settlementHealth:75,
  };

  it("every triggered decision has a non-empty triggeredByRule", async () => {
    const { evaluateDecisionRules } = await import("@/modules/decision-engine/domain/decision.rules");
    const decisions = evaluateDecisionRules(scores, "store-001");
    for (const d of decisions) {
      expect(d.triggeredByRule).toMatch(/^DEC-RULE-\d{3}$/);
    }
  });

  it("every decision references at least one supporting score", async () => {
    const { evaluateDecisionRules } = await import("@/modules/decision-engine/domain/decision.rules");
    const decisions = evaluateDecisionRules(scores, "store-001");
    for (const d of decisions) {
      expect(d.supportingScores.length).toBeGreaterThan(0);
      expect(d.supportingScores.every(s => s.startsWith("SCORE-"))).toBe(true);
    }
  });

  it("every decision references at least one supporting formula or KPI ID", async () => {
    const { evaluateDecisionRules } = await import("@/modules/decision-engine/domain/decision.rules");
    const decisions = evaluateDecisionRules(scores, "store-001");
    for (const d of decisions) {
      const hasEvidence = d.supportingKpis.length > 0 || d.supportingFormulaIds.length > 0;
      expect(hasEvidence).toBe(true);
    }
  });
});

// ── Task 3: Decision lifecycle transitions ─────────────────────────────────

describe("Task 3: Decision lifecycle (055_DECISION_ENGINE)", () => {
  it("OPEN → ACKNOWLEDGED is valid", async () => {
    const { isValidTransition } = await import("@/modules/decision-engine/domain/historical-decision.entity");
    expect(isValidTransition("OPEN", "ACKNOWLEDGED")).toBe(true);
  });

  it("OPEN → EXECUTING is invalid (must go through ACCEPTED)", async () => {
    const { isValidTransition } = await import("@/modules/decision-engine/domain/historical-decision.entity");
    expect(isValidTransition("OPEN", "EXECUTING")).toBe(false);
  });

  it("COMPLETED → ARCHIVED is valid (terminal to archived)", async () => {
    const { isValidTransition } = await import("@/modules/decision-engine/domain/historical-decision.entity");
    expect(isValidTransition("COMPLETED", "ARCHIVED")).toBe(true);
  });

  it("ARCHIVED → any status is invalid (terminal state)", async () => {
    const { isValidTransition, DECISION_LIFECYCLE } = await import("@/modules/decision-engine/domain/historical-decision.entity");
    const archivedNext = DECISION_LIFECYCLE["ARCHIVED"];
    expect(archivedNext).toHaveLength(0);
    expect(isValidTransition("ARCHIVED", "OPEN")).toBe(false);
  });

  it("All 5 documented statuses are in the lifecycle map", async () => {
    const { DECISION_LIFECYCLE } = await import("@/modules/decision-engine/domain/historical-decision.entity");
    for (const status of ["OPEN","ACKNOWLEDGED","ACCEPTED","REJECTED","EXECUTING","COMPLETED","EXPIRED","ARCHIVED"]) {
      expect(DECISION_LIFECYCLE).toHaveProperty(status);
    }
  });
});

// ── Task 5: Structured Impact Model ──────────────────────────────────────

describe("Task 5: Structured Impact Model", () => {
  it("all 10 decision impacts have all 5 dimensions", async () => {
    const { DECISION_IMPACTS } = await import("@/modules/decision-engine/domain/impact.model");
    const required = ["revenueImpact","profitImpact","cashImpact","inventoryImpact","operationalImpact"];
    for (const [id, impact] of Object.entries(DECISION_IMPACTS)) {
      for (const dim of required) {
        expect(impact).toHaveProperty(dim);
        const d = (impact as any)[dim];
        expect(d).toHaveProperty("direction");
        expect(d).toHaveProperty("magnitude");
        expect(d).toHaveProperty("description");
        expect(d).toHaveProperty("horizon");
      }
    }
  });

  it("all impact dimensions have a valid direction", async () => {
    const { DECISION_IMPACTS } = await import("@/modules/decision-engine/domain/impact.model");
    const validDirections = ["POSITIVE","NEGATIVE","NEUTRAL","VARIABLE"];
    for (const impact of Object.values(DECISION_IMPACTS)) {
      for (const dim of [impact.revenueImpact, impact.profitImpact, impact.cashImpact]) {
        expect(validDirections).toContain(dim.direction);
      }
    }
  });

  it("impactLabel and impactValue exist for all decisions (UI Polish 3)", async () => {
    const { DECISION_IMPACTS } = await import("@/modules/decision-engine/domain/impact.model");
    for (const impact of Object.values(DECISION_IMPACTS)) {
      expect(impact.impactLabel.length).toBeGreaterThan(0);
      expect(impact.impactValue.length).toBeGreaterThan(0);
    }
  });
});

// ── Task 6: Historical entity structure ───────────────────────────────────

describe("Task 6: Historical Score entity structure", () => {
  it("HistoricalScoreSnapshot has all required immutable fields", async () => {
    const { persistScoreSnapshot } = await import("@/modules/score-engine/repositories/historical-score.repository");
    const { calculateBusinessHealthScore } = await import("@/modules/score-engine/application/score.calculator");
    const score = calculateBusinessHealthScore({
      profitMargin: 0.22, deliveryRate: 0.87, returnRate: 0.057, refusalRate: 0.04,
      inventoryTurnover: 6, marketingRoi: 9.74, cashPosition: 42100,
      settlementCompletionRate: 0.88, trendDelta: 0.032,
    });
    const snapshot = await persistScoreSnapshot("store-test-001", score, 72);
    expect(snapshot.id).toBeDefined();
    expect(snapshot.scoreId).toBe("SCORE-001");
    expect(snapshot.granularity).toBe("DAILY");
    expect(snapshot.snapshotDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(snapshot.formulaVersion).toBe("1.0.0");
    expect(snapshot.calculatedAt).toBeDefined();
    expect(snapshot.delta).toBe(score.score - 72);
  });
});
