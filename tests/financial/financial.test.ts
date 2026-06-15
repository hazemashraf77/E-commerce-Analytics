/**
 * tests/financial/financial.test.ts
 * Sprint 4 — Financial Engine tests.
 *
 * Covers: FIN-001 Revenue, SHIP-001 Shipping Subsidy, FIN-003 Gross Profit,
 *         FIN-002 Net Profit, FIN-004 Profit Contribution (all business rules),
 *         validation guards, Formula Inspector traces.
 * No database required — all formula functions are pure.
 */

import { describe, it, expect } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";
import type { OrderFinancialInput } from "@/modules/financial-engine/domain/financial.types";

// ── Test fixtures ──────────────────────────────────────────────────────────

function makeInput(overrides: Partial<OrderFinancialInput> = {}): OrderFinancialInput {
  return {
    orderId: "ORD-001",
    storeId: "STORE-001",
    deliveredAt: new Date("2024-01-12T15:00:00Z"),
    customerShippingFee: new Decimal(50),
    actualShippingCost: new Decimal(45),
    campaignId: "META-CAMP-001",
    marketingSource: "META",
    advertisingCost: new Decimal(120),
    fixedExpensesForPeriod: new Decimal(100),
    variableExpensesForOrder: new Decimal(20),
    adjustments: [],
    items: [
      {
        orderItemId: "ITEM-A",
        productId: "PROD-A",
        quantity: new Decimal(2),
        unitPrice: new Decimal(299),
        discount: new Decimal(0),
        fifoCost: new Decimal(200),
        isCampaignProduct: true,
      },
      {
        orderItemId: "ITEM-B",
        productId: "PROD-B",
        quantity: new Decimal(1),
        unitPrice: new Decimal(599),
        discount: new Decimal(50),
        fifoCost: new Decimal(300),
        isCampaignProduct: false,
      },
    ],
    ...overrides,
  };
}

// ── FORMULA_IDS ───────────────────────────────────────────────────────────

describe("Formula IDs (033_FORMULA_CATALOG v2.1.0)", () => {
  it("all required formula IDs are defined", async () => {
    const { FORMULA_IDS } = await import("@/modules/financial-engine/domain/financial.types");
    expect(FORMULA_IDS.REVENUE).toBe("FIN-001");
    expect(FORMULA_IDS.GROSS_PROFIT).toBe("FIN-003");
    expect(FORMULA_IDS.PROFIT_CONTRIBUTION).toBe("FIN-004");
    expect(FORMULA_IDS.NET_PROFIT).toBe("FIN-002");
    expect(FORMULA_IDS.SHIPPING_SUBSIDY).toBe("SHIP-001");
    expect(FORMULA_IDS.FIFO_COST).toBe("INV-001");
  });
});

// ── FIN-001: Revenue ──────────────────────────────────────────────────────

describe("calculateRevenue (FIN-001)", () => {
  it("sums product revenue and customer shipping fee", async () => {
    const { calculateRevenue } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const input = makeInput();
    const result = calculateRevenue(input);

    // Product A: 2 × 299 − 0 = 598; Product B: 1 × 599 − 50 = 549; Total = 1147
    expect(result.productRevenue.toString()).toBe("1147");
    expect(result.customerShippingFee.toString()).toBe("50");
    expect(result.totalRevenue.toString()).toBe("1197");
    expect(result.formulaId).toBe("FIN-001");
  });

  it("applies discount to item revenue", async () => {
    const { calculateRevenue } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const input = makeInput({
      items: [{
        orderItemId: "ITEM-A",
        productId: "PROD-A",
        quantity: new Decimal(1),
        unitPrice: new Decimal(100),
        discount: new Decimal(25),
        fifoCost: new Decimal(40),
        isCampaignProduct: true,
      }],
      customerShippingFee: new Decimal(0),
    });
    const result = calculateRevenue(input);
    expect(result.productRevenue.toString()).toBe("75");
    expect(result.totalRevenue.toString()).toBe("75");
  });

  it("sets recognitionDate to deliveredAt (BR-005)", async () => {
    const { calculateRevenue } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const deliveredAt = new Date("2024-02-15T10:00:00Z");
    const result = calculateRevenue(makeInput({ deliveredAt }));
    expect(result.recognitionDate).toEqual(deliveredAt);
  });
});

// ── SHIP-001: Shipping Subsidy ────────────────────────────────────────────

describe("calculateShippingSubsidy (SHIP-001)", () => {
  it("positive subsidy when actual cost > customer fee", async () => {
    const { calculateShippingSubsidy } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const result = calculateShippingSubsidy(makeInput({
      actualShippingCost: new Decimal(80),
      customerShippingFee: new Decimal(50),
    }));
    expect(result.shippingSubsidy.toString()).toBe("30");
  });

  it("zero subsidy when costs are equal", async () => {
    const { calculateShippingSubsidy } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const result = calculateShippingSubsidy(makeInput({
      actualShippingCost: new Decimal(50),
      customerShippingFee: new Decimal(50),
    }));
    expect(result.shippingSubsidy.toString()).toBe("0");
  });

  it("negative subsidy when fee > actual cost (future compatibility — 007)", async () => {
    const { calculateShippingSubsidy } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const result = calculateShippingSubsidy(makeInput({
      actualShippingCost: new Decimal(30),
      customerShippingFee: new Decimal(50),
    }));
    expect(result.shippingSubsidy.lessThan(0)).toBe(true);
    expect(result.shippingSubsidy.toString()).toBe("-20");
  });

  it("assigns SHIP-001 formula ID", async () => {
    const { calculateShippingSubsidy } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const result = calculateShippingSubsidy(makeInput());
    expect(result.formulaId).toBe("SHIP-001");
  });
});

// ── FIN-003: Gross Profit ─────────────────────────────────────────────────

describe("calculateGrossProfit (FIN-003)", () => {
  it("Gross Profit = Revenue − COGS", async () => {
    const { calculateRevenue, calculateGrossProfit } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const input = makeInput();
    const revenue = calculateRevenue(input);
    const result = calculateGrossProfit(input, revenue);
    // Revenue = 1197, COGS = 200 + 300 = 500
    expect(result.cogs.toString()).toBe("500");
    expect(result.grossProfit.toString()).toBe("697");
    expect(result.formulaId).toBe("FIN-003");
    expect(result.formulaVersion).toBe("1.0.0");
  });

  it("gross profit can be negative (loss-making order)", async () => {
    const { calculateRevenue, calculateGrossProfit } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const input = makeInput({
      items: [{
        orderItemId: "ITEM-A",
        productId: "PROD-A",
        quantity: new Decimal(1),
        unitPrice: new Decimal(100),
        discount: new Decimal(0),
        fifoCost: new Decimal(150), // cost > revenue
        isCampaignProduct: true,
      }],
      customerShippingFee: new Decimal(0),
    });
    const revenue = calculateRevenue(input);
    const result = calculateGrossProfit(input, revenue);
    expect(result.grossProfit.lessThan(0)).toBe(true);
  });
});

// ── FIN-002: Net Profit ───────────────────────────────────────────────────

describe("calculateNetProfit (FIN-002)", () => {
  it("Net Profit = Revenue − COGS − Shipping − Marketing − Variable − Fixed ± Adjustments", async () => {
    const { calculateRevenue, calculateNetProfit } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const input = makeInput(); // adv=120, shipping=45, variable=20, fixed=100
    const revenue = calculateRevenue(input);
    const result = calculateNetProfit(input, revenue);
    // 1197 − 500 − 45 − 120 − 20 − 100 ± 0 = 412
    expect(result.netProfit.toString()).toBe("412");
    expect(result.formulaId).toBe("FIN-002");
  });

  it("applies positive adjustment", async () => {
    const { calculateRevenue, calculateNetProfit } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const input = makeInput({
      adjustments: [{ adjustmentId: "ADJ-001", orderItemId: null, amount: new Decimal(50) }],
    });
    const revenue = calculateRevenue(input);
    const result = calculateNetProfit(input, revenue);
    expect(result.netProfit.toString()).toBe("462");
  });

  it("applies negative adjustment (refund/compensation)", async () => {
    const { calculateRevenue, calculateNetProfit } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const input = makeInput({
      adjustments: [{ adjustmentId: "ADJ-002", orderItemId: null, amount: new Decimal(-30) }],
    });
    const revenue = calculateRevenue(input);
    const result = calculateNetProfit(input, revenue);
    expect(result.netProfit.toString()).toBe("382");
  });
});

// ── FIN-004: Profit Contribution ─────────────────────────────────────────

describe("calculateProfitContributions (FIN-004)", () => {
  it("Campaign Product receives full advertising and shipping costs", async () => {
    const { calculateProfitContributions } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const results = calculateProfitContributions(makeInput());
    const campaign = results.find((r) => r.isCampaignProduct)!;
    expect(campaign.advertisingCost.toString()).toBe("120");
    expect(campaign.shippingCost.toString()).toBe("45");
    expect(campaign.formulaId).toBe("FIN-004");
    expect(campaign.formulaVersion).toBe("1.0.0");
  });

  it("Non-campaign products receive zero advertising and zero shipping (BR-FIN-004-01/02)", async () => {
    const { calculateProfitContributions } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const results = calculateProfitContributions(makeInput());
    const nonCampaign = results.filter((r) => !r.isCampaignProduct);
    for (const item of nonCampaign) {
      expect(item.advertisingCost.toString()).toBe("0");
      expect(item.shippingCost.toString()).toBe("0");
    }
  });

  it("Campaign Product profit = Revenue − FIFO − Advertising − Shipping ± Adjustments", async () => {
    const { calculateProfitContributions } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const results = calculateProfitContributions(makeInput());
    const campaign = results.find((r) => r.isCampaignProduct)!;
    // Revenue: 2×299−0 = 598; FIFO=200; Adv=120; Ship=45; Adj=0 → 598−200−120−45=233
    expect(campaign.profitContribution.toString()).toBe("233");
  });

  it("Non-campaign product profit = Revenue − FIFO ± Adjustments only", async () => {
    const { calculateProfitContributions } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const results = calculateProfitContributions(makeInput());
    const nonCampaign = results.find((r) => !r.isCampaignProduct)!;
    // Revenue: 1×599−50=549; FIFO=300; Adv=0; Ship=0 → 549−300=249
    expect(nonCampaign.profitContribution.toString()).toBe("249");
  });

  it("BR-FIN-004-05: costs remain at order level when no campaign product present", async () => {
    const { calculateProfitContributions } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const input = makeInput({
      items: [
        { orderItemId: "ITEM-A", productId: "PROD-A", quantity: new Decimal(1), unitPrice: new Decimal(500), discount: new Decimal(0), fifoCost: new Decimal(200), isCampaignProduct: false },
        { orderItemId: "ITEM-B", productId: "PROD-B", quantity: new Decimal(1), unitPrice: new Decimal(300), discount: new Decimal(0), fifoCost: new Decimal(100), isCampaignProduct: false },
      ],
    });
    const results = calculateProfitContributions(input);
    // No campaign product → ALL items get zero advertising and zero shipping
    for (const item of results) {
      expect(item.advertisingCost.toString()).toBe("0");
      expect(item.shippingCost.toString()).toBe("0");
    }
  });

  it("three-product order matches business decision example exactly", async () => {
    const { calculateProfitContributions } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const input = makeInput({
      advertisingCost: new Decimal(120),
      actualShippingCost: new Decimal(80),
      customerShippingFee: new Decimal(0),
      variableExpensesForOrder: new Decimal(0),
      fixedExpensesForPeriod: new Decimal(0),
      items: [
        { orderItemId: "A", productId: "PA", quantity: new Decimal(1), unitPrice: new Decimal(500), discount: new Decimal(0), fifoCost: new Decimal(200), isCampaignProduct: true },
        { orderItemId: "B", productId: "PB", quantity: new Decimal(1), unitPrice: new Decimal(300), discount: new Decimal(0), fifoCost: new Decimal(120), isCampaignProduct: false },
        { orderItemId: "C", productId: "PC", quantity: new Decimal(1), unitPrice: new Decimal(200), discount: new Decimal(0), fifoCost: new Decimal(80),  isCampaignProduct: false },
      ],
    });
    const results = calculateProfitContributions(input);
    const a = results.find((r) => r.orderItemId === "A")!;
    const b = results.find((r) => r.orderItemId === "B")!;
    const c = results.find((r) => r.orderItemId === "C")!;
    // From business decision example:
    expect(a.profitContribution.toString()).toBe("100");  // 500−200−120−80=100
    expect(b.profitContribution.toString()).toBe("180");  // 300−120=180
    expect(c.profitContribution.toString()).toBe("120");  // 200−80=120
  });
});

// ── Validation guards ─────────────────────────────────────────────────────

describe("assertDeliveredStatus (BR-005)", () => {
  it("passes for DELIVERED", async () => {
    const { assertDeliveredStatus } = await import("@/modules/financial-engine/domain/financial.validation");
    expect(() => assertDeliveredStatus("DELIVERED", "ORD-001")).not.toThrow();
  });
  it("throws for non-DELIVERED status", async () => {
    const { assertDeliveredStatus } = await import("@/modules/financial-engine/domain/financial.validation");
    for (const status of ["PENDING", "CONFIRMED", "SHIPPED", "RETURNED", "CANCELLED"]) {
      expect(() => assertDeliveredStatus(status, "ORD-001")).toThrow("REVENUE_RECOGNITION_BLOCKED");
    }
  });
});

describe("assertAtMostOneCampaignProduct (FIN-004)", () => {
  it("passes with zero campaign products", async () => {
    const { assertAtMostOneCampaignProduct } = await import("@/modules/financial-engine/domain/financial.validation");
    expect(() => assertAtMostOneCampaignProduct(
      [{ isCampaignProduct: false, orderItemId: "A" }], "ORD-001",
    )).not.toThrow();
  });
  it("passes with exactly one campaign product", async () => {
    const { assertAtMostOneCampaignProduct } = await import("@/modules/financial-engine/domain/financial.validation");
    expect(() => assertAtMostOneCampaignProduct(
      [{ isCampaignProduct: true, orderItemId: "A" }, { isCampaignProduct: false, orderItemId: "B" }],
      "ORD-001",
    )).not.toThrow();
  });
  it("throws with two campaign products", async () => {
    const { assertAtMostOneCampaignProduct } = await import("@/modules/financial-engine/domain/financial.validation");
    expect(() => assertAtMostOneCampaignProduct(
      [{ isCampaignProduct: true, orderItemId: "A" }, { isCampaignProduct: true, orderItemId: "B" }],
      "ORD-001",
    )).toThrow("FIN_004_MULTIPLE_CAMPAIGN_PRODUCTS");
  });
});

// ── Formula Inspector ─────────────────────────────────────────────────────

describe("Formula Inspector traces (007: FORMULA INSPECTOR INTEGRATION)", () => {
  it("traceRevenue includes formula ID, inputs, steps, and output", async () => {
    const { calculateRevenue } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const { traceRevenue } = await import("@/modules/financial-engine/domain/formula.inspector");
    const result = calculateRevenue(makeInput());
    const trace = traceRevenue(result);
    expect(trace.formulaId).toBe("FIN-001");
    expect(trace.inputs).toHaveProperty("productRevenue");
    expect(trace.inputs).toHaveProperty("customerShippingFee");
    expect(trace.intermediateSteps.length).toBeGreaterThan(0);
    expect(trace.output).toBe(result.totalRevenue.toString());
  });

  it("traceProfitContribution distinguishes campaign vs non-campaign in steps", async () => {
    const { calculateProfitContributions } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const { traceProfitContribution } = await import("@/modules/financial-engine/domain/formula.inspector");
    const results = calculateProfitContributions(makeInput());
    const campaignTrace = traceProfitContribution(results.find((r) => r.isCampaignProduct)!);
    const nonCampaignTrace = traceProfitContribution(results.find((r) => !r.isCampaignProduct)!);
    expect(campaignTrace.formulaId).toBe("FIN-004");
    expect(campaignTrace.businessPurpose).toContain("campaign product");
    expect(nonCampaignTrace.businessPurpose).toContain("non-campaign");
    // Campaign trace shows actual advertising cost in steps
    const advStep = campaignTrace.intermediateSteps.find((s) => s.label.includes("Advertising"));
    expect(advStep?.value).not.toBe("0");
  });

  it("traceNetProfit shows all 7 components", async () => {
    const { calculateRevenue, calculateNetProfit } = await import("@/modules/financial-engine/formulas/financial.formulas");
    const { traceNetProfit } = await import("@/modules/financial-engine/domain/formula.inspector");
    const input = makeInput();
    const revenue = calculateRevenue(input);
    const net = calculateNetProfit(input, revenue);
    const trace = traceNetProfit(net);
    expect(Object.keys(trace.inputs)).toHaveLength(7);
    expect(trace.intermediateSteps.length).toBe(8); // 7 components + final result
  });
});
