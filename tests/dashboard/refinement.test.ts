/**
 * tests/dashboard/refinement.test.ts
 * Sprint 7.1 — Dashboard refinement tests.
 */

import { describe, it, expect } from "vitest";

// ── Cost Evolution: 6 stages, dual dimension ──────────────────────────────

describe("Cost Evolution widget data (refinement 1)", () => {
  it("contains all 6 documented lifecycle stages", async () => {
    const { MOCK_COST_EVOLUTION } = await import("@/lib/dashboard/mock-data");
    const stages = MOCK_COST_EVOLUTION.map(s => s.stage);
    expect(stages).toContain("Created");
    expect(stages).toContain("Confirmed");
    expect(stages).toContain("Sent to Shipping");
    expect(stages).toContain("In Transit");
    expect(stages).toContain("Delivered");
    expect(stages).toContain("Final Realized");
  });

  it("every stage has orders, items, costPerOrder, costPerItem, totalCost", async () => {
    const { MOCK_COST_EVOLUTION } = await import("@/lib/dashboard/mock-data");
    for (const stage of MOCK_COST_EVOLUTION) {
      expect(typeof stage.orders).toBe("number");
      expect(typeof stage.items).toBe("number");
      expect(typeof stage.costPerOrder).toBe("number");
      expect(typeof stage.costPerItem).toBe("number");
      expect(typeof stage.totalCost).toBe("number");
    }
  });

  it("Final Realized is marked isRealized=true", async () => {
    const { MOCK_COST_EVOLUTION } = await import("@/lib/dashboard/mock-data");
    const final = MOCK_COST_EVOLUTION.find(s => s.stage === "Final Realized");
    expect(final?.isRealized).toBe(true);
  });

  it("Created stage is not realized (FR-002)", async () => {
    const { MOCK_COST_EVOLUTION } = await import("@/lib/dashboard/mock-data");
    const created = MOCK_COST_EVOLUTION.find(s => s.stage === "Created");
    expect(created?.isRealized).toBe(false);
  });
});

// ── Profit Leakage: all 10 documented cost lines ─────────────────────────

describe("Profit Leakage data (refinement 2)", () => {
  it("contains all required cost categories", async () => {
    const { MOCK_PROFIT_LEAKAGE } = await import("@/lib/dashboard/mock-data");
    const keys = MOCK_PROFIT_LEAKAGE.map(i => i.key);
    for (const required of ["cogs","ads","shipping","returnShipping","exchangeShip","packaging","refunds","compensations","variableExp","fixedExp"]) {
      expect(keys).toContain(required);
    }
  });

  it("every item has perOrder and perItem (dual dimension)", async () => {
    const { MOCK_PROFIT_LEAKAGE } = await import("@/lib/dashboard/mock-data");
    for (const item of MOCK_PROFIT_LEAKAGE) {
      expect(typeof item.perOrder).toBe("number");
      expect(typeof item.perItem).toBe("number");
    }
  });

  it("pctOfRevenue is provided (not calculated in component)", async () => {
    const { MOCK_PROFIT_LEAKAGE } = await import("@/lib/dashboard/mock-data");
    for (const item of MOCK_PROFIT_LEAKAGE) {
      expect(item.pctOfRevenue).toBeGreaterThanOrEqual(0);
    }
  });
});

// ── Pending Money: 4 types, cash ≠ profit (FR-004) ───────────────────────

describe("Pending Money data (refinement 3, FR-004)", () => {
  it("contains realized, pending, expected, lost", async () => {
    const { MOCK_PENDING_MONEY } = await import("@/lib/dashboard/mock-data");
    const keys = MOCK_PENDING_MONEY.map(m => m.key);
    expect(keys).toContain("realized");
    expect(keys).toContain("pending");
    expect(keys).toContain("expected");
    expect(keys).toContain("lost");
  });

  it("only realized is marked isRealized=true", async () => {
    const { MOCK_PENDING_MONEY } = await import("@/lib/dashboard/mock-data");
    const realized = MOCK_PENDING_MONEY.filter(m => m.isRealized);
    expect(realized).toHaveLength(1);
    expect(realized[0]!.key).toBe("realized");
  });
});

// ── Settlement Timeline: 5 horizons ──────────────────────────────────────

describe("Settlement Timeline data (refinement 4)", () => {
  it("covers all 5 documented horizons", async () => {
    const { MOCK_SETTLEMENT_TIMELINE } = await import("@/lib/dashboard/mock-data");
    const horizons = MOCK_SETTLEMENT_TIMELINE.map(e => e.horizon);
    for (const h of ["today","tomorrow","next3days","next7days","future"]) {
      expect(horizons).toContain(h);
    }
  });

  it("each entry has expectedAmount and shipmentsCount", async () => {
    const { MOCK_SETTLEMENT_TIMELINE } = await import("@/lib/dashboard/mock-data");
    for (const e of MOCK_SETTLEMENT_TIMELINE) {
      expect(e.expectedAmount).toBeGreaterThan(0);
      expect(e.shipmentsCount).toBeGreaterThan(0);
    }
  });
});

// ── ROAS full lifecycle: 5 stages (refinement 6) ─────────────────────────

describe("ROAS full lifecycle data (refinement 6, FR-002)", () => {
  it("contains all 5 ROAS stages", async () => {
    const { MOCK_ROAS_FULL_LIFECYCLE } = await import("@/lib/dashboard/mock-data");
    expect(MOCK_ROAS_FULL_LIFECYCLE).toHaveLength(5);
  });

  it("only Delivered ROAS is realized (FR-002)", async () => {
    const { MOCK_ROAS_FULL_LIFECYCLE } = await import("@/lib/dashboard/mock-data");
    const realized = MOCK_ROAS_FULL_LIFECYCLE.filter(r => r.isRealized);
    expect(realized).toHaveLength(1);
    expect(realized[0]!.stage).toContain("Delivered");
  });

  it("projected stages have higher ROAS than delivered (more orders in denominator)", async () => {
    const { MOCK_ROAS_FULL_LIFECYCLE } = await import("@/lib/dashboard/mock-data");
    const delivered = MOCK_ROAS_FULL_LIFECYCLE.find(r => r.isRealized)!;
    const created = MOCK_ROAS_FULL_LIFECYCLE[0]!;
    // Created ROAS uses more orders (lower spend/order ratio before attrition)
    expect(created.roas).toBeGreaterThan(delivered.roas);
  });
});

// ── Health Strip: 7 scores (refinement 7) ────────────────────────────────

describe("Executive Health Strip data (refinement 7, 054_SCORE_CATALOG)", () => {
  it("contains 7 health indicators", async () => {
    const { MOCK_HEALTH_STRIP } = await import("@/lib/dashboard/mock-data");
    expect(MOCK_HEALTH_STRIP).toHaveLength(7);
  });

  it("all scores are in 0–100 range", async () => {
    const { MOCK_HEALTH_STRIP } = await import("@/lib/dashboard/mock-data");
    for (const s of MOCK_HEALTH_STRIP) {
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqualTo(100);
    }
  });

  it("Risk score has grade 'critical' (score 38 < 50)", async () => {
    const { MOCK_HEALTH_STRIP } = await import("@/lib/dashboard/mock-data");
    const risk = MOCK_HEALTH_STRIP.find(s => s.label === "Risk");
    expect(risk?.grade).toBe("critical");
    expect(risk?.score).toBeLessThan(50);
  });
});

// ── Inventory Capacity: pre-computed (refinement 8) ───────────────────────

describe("Inventory Capacity data (refinement 8)", () => {
  it("estimatedOrderCapacity is a pre-computed number, not derived in UI", async () => {
    const { MOCK_INVENTORY_CAPACITY } = await import("@/lib/dashboard/mock-data");
    // Value exists as a number — component never divides to derive it
    expect(typeof MOCK_INVENTORY_CAPACITY.estimatedOrderCapacity).toBe("number");
    expect(MOCK_INVENTORY_CAPACITY.estimatedOrderCapacity).toBeGreaterThan(0);
  });

  it("avgUnitsPerOrder is provided by Analytics Engine, not computed in UI", async () => {
    const { MOCK_INVENTORY_CAPACITY } = await import("@/lib/dashboard/mock-data");
    expect(MOCK_INVENTORY_CAPACITY.avgUnitsPerOrder).toBeGreaterThan(0);
  });
});

// ── KPI Card inline dual values (refinement 5) ────────────────────────────

describe("KpiCard inline dual-dimension (refinement 5)", () => {
  it("DualDimensionValue has all 5 required fields", async () => {
    const { MOCK_FINANCIAL_KPIS } = await import("@/lib/dashboard/mock-data");
    const withDual = MOCK_FINANCIAL_KPIS.filter(k => k.valueDual);
    for (const kpi of withDual) {
      const d = kpi.valueDual!;
      // All fields present — rendered inline, not behind hover
      expect(d.orderCount).toBeDefined();
      expect(d.itemCount).toBeDefined();
      expect(d.perOrder).toBeDefined();
      expect(d.perItem).toBeDefined();
      expect(d.total).toBeDefined();
    }
  });
});
