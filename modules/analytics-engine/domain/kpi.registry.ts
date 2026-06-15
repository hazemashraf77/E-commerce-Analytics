/**
 * KPI Registry.
 * Repository: 034_KPI_CATALOG.md — KPI IDENTIFIER, KPI FORMULA REFERENCE
 *             033_FORMULA_CATALOG v2.1.0 — formula IDs
 *             010_ANALYTICS_ENGINE.md — RESPONSIBILITIES
 *
 * "Every KPI shall reference exactly one Formula." (034)
 * "Analytics never changes KPI definitions." (010)
 * KPI IDs are permanent per 034.
 */

import type { KpiDefinition } from "./analytics.types";
import { KPI_IDS } from "./analytics.types";
import { FORMULA_IDS } from "@/modules/financial-engine";

export const KPI_REGISTRY: readonly KpiDefinition[] = [
  // ── Financial KPIs ────────────────────────────────────────────────────
  {
    kpiId: KPI_IDS.REVENUE,
    kpiName: "Revenue",
    nameAr: "الإيرادات",
    category: "FINANCIAL",
    formulaId: FORMULA_IDS.REVENUE,
    formulaVersion: "1.0.0",
    unit: "CURRENCY",
    owner: "Finance",
    refreshFrequency: "DAILY",
    description: "Total realized revenue from delivered orders (BR-005). Product revenue + customer shipping fee.",
    sourceEngine: "FINANCIAL_ENGINE",
  },
  {
    kpiId: KPI_IDS.GROSS_PROFIT,
    kpiName: "Gross Profit",
    nameAr: "إجمالي الربح",
    category: "FINANCIAL",
    formulaId: FORMULA_IDS.GROSS_PROFIT,  // FIN-003
    formulaVersion: "1.0.0",
    unit: "CURRENCY",
    owner: "Finance",
    refreshFrequency: "DAILY",
    description: "Revenue − COGS. Excludes operating expenses (FIN-003).",
    sourceEngine: "FINANCIAL_ENGINE",
  },
  {
    kpiId: KPI_IDS.NET_PROFIT,
    kpiName: "Net Profit",
    nameAr: "صافي الربح",
    category: "FINANCIAL",
    formulaId: FORMULA_IDS.NET_PROFIT,   // FIN-002
    formulaVersion: "1.0.0",
    unit: "CURRENCY",
    owner: "Finance",
    refreshFrequency: "DAILY",
    description: "Revenue − COGS − Shipping − Marketing − Variable − Fixed ± Adjustments (FIN-002).",
    sourceEngine: "FINANCIAL_ENGINE",
  },
  {
    kpiId: KPI_IDS.PROFIT_MARGIN,
    kpiName: "Profit Margin",
    nameAr: "هامش الربح",
    category: "FINANCIAL",
    formulaId: FORMULA_IDS.NET_PROFIT,
    formulaVersion: "1.0.0",
    unit: "PERCENT",
    owner: "Finance",
    refreshFrequency: "DAILY",
    description: "Net Profit / Revenue. Expressed as percentage.",
    sourceEngine: "FINANCIAL_ENGINE",
  },
  {
    kpiId: KPI_IDS.SHIPPING_SUBSIDY,
    kpiName: "Shipping Subsidy",
    nameAr: "دعم الشحن",
    category: "FINANCIAL",
    formulaId: FORMULA_IDS.SHIPPING_SUBSIDY, // SHIP-001
    formulaVersion: "1.0.0",
    unit: "CURRENCY",
    owner: "Finance",
    refreshFrequency: "DAILY",
    description: "Actual Shipping Cost − Customer Shipping Fee. May be positive, zero, or negative (SHIP-001, BR-009).",
    sourceEngine: "FINANCIAL_ENGINE",
  },
  // ── Operational KPIs ──────────────────────────────────────────────────
  {
    kpiId: KPI_IDS.DELIVERY_RATE,
    kpiName: "Delivery Rate",
    nameAr: "معدل التسليم",
    category: "OPERATIONAL",
    formulaId: "OPS-001",
    formulaVersion: "1.0.0",
    unit: "PERCENT",
    owner: "Operations",
    refreshFrequency: "DAILY",
    description: "Delivered Orders / Total Shipped Orders. Strongest indicator of business health (003 Term 041).",
    sourceEngine: "ANALYTICS_ENGINE",
  },
  {
    kpiId: KPI_IDS.RETURN_RATE,
    kpiName: "Return Rate",
    nameAr: "معدل الإرجاع",
    category: "OPERATIONAL",
    formulaId: "OPS-002",
    formulaVersion: "1.0.0",
    unit: "PERCENT",
    owner: "Operations",
    refreshFrequency: "DAILY",
    description: "Returned Orders / Delivered Orders. Must remain historically reproducible (003 Term 042).",
    sourceEngine: "ANALYTICS_ENGINE",
  },
  {
    kpiId: KPI_IDS.REFUSAL_RATE,
    kpiName: "Refusal Rate",
    nameAr: "معدل الرفض",
    category: "OPERATIONAL",
    formulaId: "OPS-003",
    formulaVersion: "1.0.0",
    unit: "PERCENT",
    owner: "Operations",
    refreshFrequency: "DAILY",
    description: "Refused Orders / Total Shipped Orders. Different from Return Rate (003 Term 043).",
    sourceEngine: "ANALYTICS_ENGINE",
  },
  {
    kpiId: KPI_IDS.EXCHANGE_RATE,
    kpiName: "Exchange Rate",
    nameAr: "معدل الاستبدال",
    category: "OPERATIONAL",
    formulaId: "OPS-004",
    formulaVersion: "1.0.0",
    unit: "PERCENT",
    owner: "Operations",
    refreshFrequency: "DAILY",
    description: "Exchange Orders / Total Shipped Orders.",
    sourceEngine: "ANALYTICS_ENGINE",
  },
  {
    kpiId: KPI_IDS.AVG_ORDER_VALUE,
    kpiName: "Average Order Value",
    nameAr: "متوسط قيمة الطلب",
    category: "OPERATIONAL",
    formulaId: "OPS-005",
    formulaVersion: "1.0.0",
    unit: "CURRENCY",
    owner: "Operations",
    refreshFrequency: "DAILY",
    description: "Total Revenue / Delivered Orders.",
    sourceEngine: "ANALYTICS_ENGINE",
  },
  // ── Marketing KPIs ────────────────────────────────────────────────────
  {
    kpiId: KPI_IDS.MARKETING_SPEND,
    kpiName: "Marketing Spend",
    nameAr: "الإنفاق التسويقي",
    category: "MARKETING",
    formulaId: "MKT-001",
    formulaVersion: "1.0.0",
    unit: "CURRENCY",
    owner: "Marketing",
    refreshFrequency: "DAILY",
    description: "Total advertising spend across all platforms (Meta + TikTok).",
    sourceEngine: "SYNC_ENGINE",
  },
  {
    kpiId: KPI_IDS.TRUE_CPA,
    kpiName: "True CPA",
    nameAr: "تكلفة الاكتساب الحقيقية",
    category: "MARKETING",
    formulaId: "MKT-002",
    formulaVersion: "1.0.0",
    unit: "CURRENCY",
    owner: "Marketing",
    refreshFrequency: "DAILY",
    description: "Marketing Spend / Delivered Orders. Real cost per acquired delivered order (007: TRUE CPA).",
    sourceEngine: "ANALYTICS_ENGINE",
  },
  {
    kpiId: KPI_IDS.MARKETING_ROI,
    kpiName: "Marketing ROI",
    nameAr: "عائد الاستثمار التسويقي",
    category: "MARKETING",
    formulaId: "MKT-003",
    formulaVersion: "1.0.0",
    unit: "PERCENT",
    owner: "Marketing",
    refreshFrequency: "DAILY",
    description: "(Revenue − Marketing Spend) / Marketing Spend. Marketing return on investment.",
    sourceEngine: "ANALYTICS_ENGINE",
  },
  // ── Inventory KPIs ────────────────────────────────────────────────────
  {
    kpiId: KPI_IDS.INVENTORY_VALUE,
    kpiName: "Inventory Value",
    nameAr: "قيمة المخزون",
    category: "INVENTORY",
    formulaId: "INV-002",
    formulaVersion: "1.0.0",
    unit: "CURRENCY",
    owner: "Inventory",
    refreshFrequency: "DAILY",
    description: "Σ (remainingQuantity × unitCost) across all active FIFO layers. From Inventory Engine.",
    sourceEngine: "INVENTORY_ENGINE",
  },
  {
    kpiId: KPI_IDS.INVENTORY_TURNOVER,
    kpiName: "Inventory Turnover",
    nameAr: "معدل دوران المخزون",
    category: "INVENTORY",
    formulaId: "INV-003",
    formulaVersion: "1.0.0",
    unit: "RATIO",
    owner: "Inventory",
    refreshFrequency: "WEEKLY",
    description: "COGS / Average Inventory Value. How quickly inventory is sold.",
    sourceEngine: "ANALYTICS_ENGINE",
  },
  {
    kpiId: KPI_IDS.DAYS_OF_INVENTORY,
    kpiName: "Days of Inventory",
    nameAr: "أيام المخزون",
    category: "INVENTORY",
    formulaId: "INV-004",
    formulaVersion: "1.0.0",
    unit: "DAYS",
    owner: "Inventory",
    refreshFrequency: "WEEKLY",
    description: "Average Inventory Value / (COGS / Days). Days until stock depletes at current sell rate.",
    sourceEngine: "ANALYTICS_ENGINE",
  },
] as const;

/** Lookup by KPI ID — O(1) access */
const KPI_MAP = new Map<string, KpiDefinition>(
  KPI_REGISTRY.map((k) => [k.kpiId, k]),
);

export function getKpiDefinition(kpiId: string): KpiDefinition | null {
  return KPI_MAP.get(kpiId) ?? null;
}

export function assertKpiExists(kpiId: string): KpiDefinition {
  const def = getKpiDefinition(kpiId);
  if (!def) {
    throw new Error(`Unknown KPI ID: "${kpiId}". Every KPI must be registered in the KPI Catalog (034).`);
  }
  return def;
}
