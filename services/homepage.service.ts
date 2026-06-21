import { getProductPerformance } from "@/services/product-performance.service";
import { round2 } from "@/lib/kpis/core";

interface HomepageInput {
  storeId: string;
  from: Date;
  to: Date;
}

export async function getHomepageDashboard(input: HomepageInput) {
  const performance = await getProductPerformance({
    storeId: input.storeId,
    from: input.from,
    to: input.to,
    status: "ACTIVE",
  });

  const totals = performance.products.reduce(
    (acc, row) => {
      acc.revenue += row.financial.realisedRevenue;
      acc.projectedRevenue += row.financial.projectedRevenue;
      acc.netProfit += row.financial.netProfit;
      acc.projectedProfit += row.financial.projectedProfit;
      acc.adSpend += row.marketing.BLENDED.spend;
      acc.inventoryValue += row.inventory.inventoryValue;
      acc.orders += row.orders.orderCount;
      acc.deliveredOrders += row.orders.deliveredOrders;
      acc.lowStock += row.inventory.stockHealth === "LOW" || row.inventory.stockHealth === "OUT" ? 1 : 0;
      return acc;
    },
    {
      revenue: 0,
      projectedRevenue: 0,
      netProfit: 0,
      projectedProfit: 0,
      adSpend: 0,
      inventoryValue: 0,
      orders: 0,
      deliveredOrders: 0,
      lowStock: 0,
    },
  );

  return {
    from: performance.from,
    to: performance.to,
    cards: {
      revenue: round2(totals.revenue),
      projectedRevenue: round2(totals.projectedRevenue),
      netProfit: round2(totals.netProfit),
      projectedProfit: round2(totals.projectedProfit),
      adSpend: round2(totals.adSpend),
      inventoryValue: round2(totals.inventoryValue),
      trueCpa: totals.deliveredOrders > 0 ? round2(totals.adSpend / totals.deliveredOrders) : 0,
      lowStockProducts: totals.lowStock,
    },
    viewSelector: ["overview", "financial", "marketing", "inventory", "shipping", "all"],
    products: performance.products,
  };
}