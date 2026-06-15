/**
 * tests/analytics/analytics.test.ts
 * Sprint 5 — Analytics Engine tests.
 *
 * Covers: KPI registry, all operational rates, marketing KPIs, financial analytics,
 *         inventory analytics, trend detection, period-over-period comparison,
 *         snapshot idempotency guard, date range resolution.
 * No database required for pure-function tests.
 */

import { describe, it, expect } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";
import type { OperationalRateInput } from "@/modules/analytics-engine/domain/analytics.types";
import { KPI_IDS } from "@/modules/analytics-engine/domain/analytics.types";

const STORE = "00000000-0000-0000-0000-000000000001";
const RANGE = { from: new Date("2024-01-01"), to: new Date("2024-01-31") };

function makeOpInput(overrides: Partial<OperationalRateInput> = {}): OperationalRateInput {
  return {
    storeId: STORE,
    range: RANGE,
    totalShippedOrders: 100,
    deliveredOrders: 87,
    returnedOrders: 5,
    refusedOrders: 4,
    exchangedOrders: 4,
    ...overrides,
  };
}

// ── KPI Registry ──────────────────────────────────────────────────────────

describe("KPI Registry (034_KPI_CATALOG)", () => {
  it("all KPI IDs are permanent and unique", async () => {
    const { KPI_REGISTRY } = await import("@/modules/analytics-engine/domain/kpi.registry");
    const ids = KPI_REGISTRY.map((k) => k.kpiId);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("every KPI references a formula ID (034: every KPI → one formula)", async () => {
    const { KPI_REGISTRY } = await import("@/modules/analytics-engine/domain/kpi.registry");
    for (const kpi of KPI_REGISTRY) {
      expect(kpi.formulaId).toBeTruthy();
    }
  });

  it("every KPI has both English name and Arabic name (bilingual — 020)", async () => {
    const { KPI_REGISTRY } = await import("@/modules/analytics-engine/domain/kpi.registry");
    for (const kpi of KPI_REGISTRY) {
      expect(kpi.kpiName.length).toBeGreaterThan(0);
      expect(kpi.nameAr.length).toBeGreaterThan(0);
    }
  });

  it("getKpiDefinition returns null for unknown ID", async () => {
    const { getKpiDefinition } = await import("@/modules/analytics-engine/domain/kpi.registry");
    expect(getKpiDefinition("UNKNOWN-999")).toBeNull();
  });

  it("assertKpiExists throws for unknown ID", async () => {
    const { assertKpiExists } = await import("@/modules/analytics-engine/domain/kpi.registry");
    expect(() => assertKpiExists("INVENTED-KPI")).toThrow();
  });

  it("DELIVERY_RATE KPI references OPS-001 formula", async () => {
    const { getKpiDefinition } = await import("@/modules/analytics-engine/domain/kpi.registry");
    const kpi = getKpiDefinition(KPI_IDS.DELIVERY_RATE);
    expect(kpi?.formulaId).toBe("OPS-001");
  });
});

// ── OPS-001: Delivery Rate ────────────────────────────────────────────────

describe("calculateDeliveryRate (OPS-001, 003 Term 041)", () => {
  it("87 delivered / 100 total = 0.87", async () => {
    const { calculateDeliveryRate } = await import("@/modules/analytics-engine/kpis/operational.kpis");
    const result = calculateDeliveryRate(makeOpInput());
    expect(result.value.toString()).toBe("0.87");
    expect(result.kpiId).toBe(KPI_IDS.DELIVERY_RATE);
    expect(result.formulaId).toBe("OPS-001");
  });

  it("returns 0 when total orders is 0 (no division by zero)", async () => {
    const { calculateDeliveryRate } = await import("@/modules/analytics-engine/kpis/operational.kpis");
    const result = calculateDeliveryRate(makeOpInput({ totalShippedOrders: 0, deliveredOrders: 0 }));
    expect(result.value.toString()).toBe("0");
  });

  it("target example: 87% matches 034 KPI catalog documented target", async () => {
    const { calculateDeliveryRate } = await import("@/modules/analytics-engine/kpis/operational.kpis");
    const result = calculateDeliveryRate(makeOpInput({ totalShippedOrders: 100, deliveredOrders: 87 }));
    // 034 documents "Delivery Rate Target ≥ 90%, Current 87%, Status: Warning"
    expect(result.value.lessThan(new Decimal("0.90"))).toBe(true);
  });
});

// ── OPS-002: Return Rate ──────────────────────────────────────────────────

describe("calculateReturnRate (OPS-002, 003 Term 042)", () => {
  it("5 returned / 87 delivered ≈ 0.0575", async () => {
    const { calculateReturnRate } = await import("@/modules/analytics-engine/kpis/operational.kpis");
    const result = calculateReturnRate(makeOpInput());
    expect(result.value.toFixed(4)).toBe("0.0575");
    expect(result.kpiId).toBe(KPI_IDS.RETURN_RATE);
  });

  it("denominator is delivered orders, not total (003 Term 042)", async () => {
    const { calculateReturnRate } = await import("@/modules/analytics-engine/kpis/operational.kpis");
    // 10 returned / 50 delivered = 0.2, NOT 10/100
    const result = calculateReturnRate(makeOpInput({ deliveredOrders: 50, returnedOrders: 10, totalShippedOrders: 100 }));
    expect(result.value.toString()).toBe("0.2");
  });
});

// ── OPS-003: Refusal Rate ─────────────────────────────────────────────────

describe("calculateRefusalRate (OPS-003, 003 Term 043)", () => {
  it("4 refused / 100 total = 0.04", async () => {
    const { calculateRefusalRate } = await import("@/modules/analytics-engine/kpis/operational.kpis");
    const result = calculateRefusalRate(makeOpInput());
    expect(result.value.toString()).toBe("0.04");
    expect(result.kpiId).toBe(KPI_IDS.REFUSAL_RATE);
  });

  it("refusal rate is different from return rate (003 Term 043)", async () => {
    const { calculateRefusalRate, calculateReturnRate } = await import("@/modules/analytics-engine/kpis/operational.kpis");
    const input = makeOpInput({ returnedOrders: 5, refusedOrders: 4 });
    expect(calculateRefusalRate(input).kpiId).not.toBe(calculateReturnRate(input).kpiId);
  });
});

// ── OPS-004: Exchange Rate ────────────────────────────────────────────────

describe("calculateExchangeRate (OPS-004)", () => {
  it("4 exchanged / 100 total = 0.04", async () => {
    const { calculateExchangeRate } = await import("@/modules/analytics-engine/kpis/operational.kpis");
    const result = calculateExchangeRate(makeOpInput());
    expect(result.value.toString()).toBe("0.04");
  });
});

// ── MKT-002: True CPA ─────────────────────────────────────────────────────

describe("calculateTrueCpa (MKT-002, 007: TRUE CPA)", () => {
  it("spend 870 / 87 delivered = 10", async () => {
    const { calculateTrueCpa } = await import("@/modules/analytics-engine/kpis/marketing.kpis");
    const result = calculateTrueCpa(new Decimal(870), 87, STORE, RANGE);
    expect(result.value.toString()).toBe("10");
    expect(result.kpiId).toBe(KPI_IDS.TRUE_CPA);
    expect(result.formulaId).toBe("MKT-002");
  });

  it("returns 0 when no delivered orders", async () => {
    const { calculateTrueCpa } = await import("@/modules/analytics-engine/kpis/marketing.kpis");
    const result = calculateTrueCpa(new Decimal(1000), 0, STORE, RANGE);
    expect(result.value.toString()).toBe("0");
  });
});

// ── MKT-003: Marketing ROI ────────────────────────────────────────────────

describe("calculateMarketingRoi (MKT-003)", () => {
  it("revenue 5000 − spend 1000 / spend 1000 = 4 (400% ROI)", async () => {
    const { calculateMarketingRoi } = await import("@/modules/analytics-engine/kpis/marketing.kpis");
    const result = calculateMarketingRoi(new Decimal(5000), new Decimal(1000), STORE, RANGE);
    expect(result.value.toString()).toBe("4");
  });

  it("returns 0 when spend is zero (no division by zero)", async () => {
    const { calculateMarketingRoi } = await import("@/modules/analytics-engine/kpis/marketing.kpis");
    const result = calculateMarketingRoi(new Decimal(5000), new Decimal(0), STORE, RANGE);
    expect(result.value.toString()).toBe("0");
  });
});

// ── Profit Margin ─────────────────────────────────────────────────────────

describe("calculateProfitMargin", () => {
  it("net profit 200 / revenue 1000 = 0.2 (20% margin)", async () => {
    const { calculateProfitMargin } = await import("@/modules/analytics-engine/kpis/financial.analytics");
    const result = calculateProfitMargin(new Decimal(200), new Decimal(1000), STORE, RANGE);
    expect(result.value.toString()).toBe("0.2");
    expect(result.kpiId).toBe(KPI_IDS.PROFIT_MARGIN);
  });

  it("negative margin when net profit is negative", async () => {
    const { calculateProfitMargin } = await import("@/modules/analytics-engine/kpis/financial.analytics");
    const result = calculateProfitMargin(new Decimal(-100), new Decimal(500), STORE, RANGE);
    expect(result.value.lessThan(0)).toBe(true);
  });

  it("returns 0 when revenue is zero (no division by zero)", async () => {
    const { calculateProfitMargin } = await import("@/modules/analytics-engine/kpis/financial.analytics");
    const result = calculateProfitMargin(new Decimal(0), new Decimal(0), STORE, RANGE);
    expect(result.value.toString()).toBe("0");
  });
});

// ── Inventory Value ───────────────────────────────────────────────────────

describe("calculateInventoryValue (INV-002)", () => {
  it("sums remainingQty × unitCost across active layers", async () => {
    const { calculateInventoryValue } = await import("@/modules/analytics-engine/kpis/inventory.analytics");
    const layers = [
      { remainingQuantity: new Decimal(10), unitCost: new Decimal(50), isDeleted: false } as any,
      { remainingQuantity: new Decimal(5),  unitCost: new Decimal(100), isDeleted: false } as any,
      { remainingQuantity: new Decimal(0),  unitCost: new Decimal(200), isDeleted: false } as any, // closed
      { remainingQuantity: new Decimal(20), unitCost: new Decimal(30),  isDeleted: true  } as any, // deleted
    ];
    // 10×50 + 5×100 = 500 + 500 = 1000
    expect(calculateInventoryValue(layers).toString()).toBe("1000");
  });

  it("returns 0 for empty layers", async () => {
    const { calculateInventoryValue } = await import("@/modules/analytics-engine/kpis/inventory.analytics");
    expect(calculateInventoryValue([]).toString()).toBe("0");
  });
});

// ── Inventory Turnover ────────────────────────────────────────────────────

describe("calculateInventoryTurnover (INV-003)", () => {
  it("COGS 6000 / avg inventory 1000 = 6 turns", async () => {
    const { calculateInventoryTurnover } = await import("@/modules/analytics-engine/kpis/inventory.analytics");
    const result = calculateInventoryTurnover(new Decimal(6000), new Decimal(1000), STORE, RANGE);
    expect(result.value.toString()).toBe("6");
  });

  it("returns 0 when avg inventory is zero", async () => {
    const { calculateInventoryTurnover } = await import("@/modules/analytics-engine/kpis/inventory.analytics");
    const result = calculateInventoryTurnover(new Decimal(6000), new Decimal(0), STORE, RANGE);
    expect(result.value.toString()).toBe("0");
  });
});

// ── Trend detection (010: TREND DETECTION) ───────────────────────────────

describe("detectTrendDirection (010: TREND ANALYSIS)", () => {
  it("UP when current > previous by more than 1%", async () => {
    const { detectTrendDirection } = await import("@/modules/analytics-engine/services/trend.service");
    expect(detectTrendDirection(new Decimal(110), new Decimal(100))).toBe("UP");
  });

  it("DOWN when current < previous by more than 1%", async () => {
    const { detectTrendDirection } = await import("@/modules/analytics-engine/services/trend.service");
    expect(detectTrendDirection(new Decimal(88), new Decimal(100))).toBe("DOWN");
  });

  it("FLAT when change is less than 1%", async () => {
    const { detectTrendDirection } = await import("@/modules/analytics-engine/services/trend.service");
    expect(detectTrendDirection(new Decimal(100.5), new Decimal(100))).toBe("FLAT");
  });

  it("UP when previous is zero and current is positive", async () => {
    const { detectTrendDirection } = await import("@/modules/analytics-engine/services/trend.service");
    expect(detectTrendDirection(new Decimal(50), new Decimal(0))).toBe("UP");
  });
});

describe("calculatePeriodChange (010: COMPARATIVE ANALYSIS)", () => {
  it("absolute and percent change are correct", async () => {
    const { calculatePeriodChange } = await import("@/modules/analytics-engine/services/trend.service");
    const { changeAbsolute, changePercent } = calculatePeriodChange(new Decimal(120), new Decimal(100));
    expect(changeAbsolute.toString()).toBe("20");
    expect(changePercent.toString()).toBe("0.2");
  });

  it("negative change for declining metric", async () => {
    const { calculatePeriodChange } = await import("@/modules/analytics-engine/services/trend.service");
    const { changeAbsolute } = calculatePeriodChange(new Decimal(80), new Decimal(100));
    expect(changeAbsolute.lessThan(0)).toBe(true);
  });
});

// ── Date range resolution ─────────────────────────────────────────────────

describe("resolveDateRange", () => {
  it("TODAY range: from <= to", async () => {
    const { resolveDateRange } = await import("@/modules/analytics-engine/repositories/analytics-read.repository");
    const range = resolveDateRange("TODAY");
    expect(range.from <= range.to).toBe(true);
  });

  it("LAST_7_DAYS: 7+ days span", async () => {
    const { resolveDateRange } = await import("@/modules/analytics-engine/repositories/analytics-read.repository");
    const range = resolveDateRange("LAST_7_DAYS");
    const diffMs = range.to.getTime() - range.from.getTime();
    expect(diffMs).toBeGreaterThanOrEqual(6 * 24 * 60 * 60 * 1000);
  });

  it("CUSTOM throws without explicit range", async () => {
    const { resolveDateRange } = await import("@/modules/analytics-engine/repositories/analytics-read.repository");
    expect(() => resolveDateRange("CUSTOM")).toThrow();
  });
});

// ── KPI value wrappers carry correct formula IDs ──────────────────────────

describe("KPI value wrappers (034: every KPI → one formula)", () => {
  it("wrapRevenueKpi carries FIN-001", async () => {
    const { wrapRevenueKpi } = await import("@/modules/analytics-engine/kpis/financial.analytics");
    const kpi = wrapRevenueKpi(new Decimal(1000), STORE, RANGE);
    expect(kpi.formulaId).toBe("FIN-001");
    expect(kpi.kpiId).toBe(KPI_IDS.REVENUE);
  });

  it("wrapGrossProfitKpi carries FIN-003", async () => {
    const { wrapGrossProfitKpi } = await import("@/modules/analytics-engine/kpis/financial.analytics");
    const kpi = wrapGrossProfitKpi(new Decimal(500), STORE, RANGE);
    expect(kpi.formulaId).toBe("FIN-003");
  });

  it("wrapNetProfitKpi carries FIN-002", async () => {
    const { wrapNetProfitKpi } = await import("@/modules/analytics-engine/kpis/financial.analytics");
    const kpi = wrapNetProfitKpi(new Decimal(300), STORE, RANGE);
    expect(kpi.formulaId).toBe("FIN-002");
  });
});
