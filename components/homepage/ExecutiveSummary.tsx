"use client";
import { FormulaMiniInspector, type InspectorInputLine } from "./FormulaMiniInspectorV3";
import type { Terms, DimMode } from "./locale";
import { cn } from "@/lib/utils";

interface ExecProps {
  t: Terms;
  locale: "en" | "ar";
  dimMode: DimMode;
  showProjected: boolean;
  data: {
    revenue: number; trueProfit: number; expectedCash: number;
    pendingSettlement: number; deliveryRatePct: number;
    trueCpa: number; trueRoas: number; businessHealth: number;
    orderCount: number; itemCount: number;
    adSpend: number; cogs: number; shipping: number;
    returnShip: number; packaging: number; refunds: number;
    compensations: number; varExp: number; fixedExp: number;
  };
}

function dimValue(total: number, orders: number, items: number, mode: DimMode, prefix = "EGP "): string {
  const v = mode === "perOrder" ? (orders > 0 ? total / orders : 0)
    : mode === "perItem" ? (items > 0 ? total / items : 0)
    : total;
  if (!isFinite(v)) return "—";
  return `${prefix}${Math.round(v).toLocaleString("en-EG")}`;
}

export function ExecutiveSummary({ t, locale, dimMode, showProjected, data }: ExecProps) {
  const { revenue, trueProfit, expectedCash, pendingSettlement,
    deliveryRatePct, trueCpa, trueRoas, businessHealth,
    orderCount, itemCount, adSpend, cogs, shipping,
    returnShip, packaging, refunds, compensations } = data;

  const trueProfitDisplay = showProjected
    ? `EGP ${Math.round(trueProfit * 1.1).toLocaleString("en-EG")} ≈`
    : dimValue(trueProfit, orderCount, itemCount, dimMode);
  const revenueDisplay = dimValue(revenue, orderCount, itemCount, dimMode);

  const truerofitLines: InspectorInputLine[] = [
    { label: t.revenue,          value: `EGP ${Math.round(revenue).toLocaleString("en-EG")}` },
    { label: t.col.cogs,         value: `EGP ${Math.round(cogs).toLocaleString("en-EG")}`,        isSubtracted: true },
    { label: t.col.packaging,    value: `EGP ${Math.round(packaging).toLocaleString("en-EG")}`,   isSubtracted: true },
    { label: t.col.shipping,     value: `EGP ${Math.round(shipping).toLocaleString("en-EG")}`,    isSubtracted: true },
    { label: t.col.returnShip,   value: `EGP ${Math.round(returnShip).toLocaleString("en-EG")}`,  isSubtracted: true },
    { label: t.col.ads,          value: `EGP ${Math.round(adSpend).toLocaleString("en-EG")}`,     isSubtracted: true },
    { label: locale === "ar" ? "مصاريف عامة" : "General Expenses", value: "EGP 1,740", isSubtracted: true },
    { label: locale === "ar" ? "استردادات" : "Refunds",            value: `EGP ${Math.round(refunds).toLocaleString("en-EG")}`, isSubtracted: true },
    { label: locale === "ar" ? "تعويضات" : "Compensations",        value: `EGP ${Math.round(compensations).toLocaleString("en-EG")}`, isSubtracted: true },
    { label: locale === "ar" ? "تسويات يدوية" : "Manual Adjustments", value: "EGP 0", isSubtracted: true },
    { label: locale === "ar" ? "الربح الحقيقي" : "True Profit",   value: `EGP ${Math.round(trueProfit).toLocaleString("en-EG")}`, isResult: true },
  ];

  const cpaDivider = orderCount > 0 ? orderCount : 1;
  const cpaLines: InspectorInputLine[] = [
    { label: locale === "ar" ? "إنفاق إعلاني" : "Ad Spend",       value: `EGP ${Math.round(adSpend).toLocaleString("en-EG")}` },
    { label: locale === "ar" ? "÷ طلبات مُسلَّمة" : "÷ Delivered Orders", value: String(orderCount) },
    { label: locale === "ar" ? "التكلفة الحقيقية" : "True CPA",   value: `EGP ${Math.round(trueCpa).toLocaleString("en-EG")}`, isResult: true },
  ];

  const roasLines: InspectorInputLine[] = [
    { label: locale === "ar" ? "الربح الحقيقي" : "True Profit",   value: `EGP ${Math.round(trueProfit).toLocaleString("en-EG")}` },
    { label: locale === "ar" ? "÷ إنفاق إعلاني" : "÷ Ad Spend",  value: `EGP ${Math.round(adSpend).toLocaleString("en-EG")}` },
    { label: locale === "ar" ? "عائد الإنفاق الحقيقي" : "True ROAS", value: `${trueRoas.toFixed(2)}×`, isResult: true },
  ];

  const kpis = [
    {
      label: t.revenue, value: revenueDisplay, formulaId: "FIN-001",
      inputs: [{ label: locale === "ar" ? "مبيعات المنتجات + رسوم الشحن" : "Product Sales + Shipping Fees", value: revenueDisplay }],
      sources: [t.sources.easyOrders],
    },
    {
      label: t.trueProfit,
      value: trueProfitDisplay,
      formulaId: "TRUE-001",
      inputs: truerofitLines,
      sources: [t.sources.easyOrders, t.sources.bosta, t.sources.meta, t.sources.tiktok],
      cls: trueProfit >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      label: t.expectedCash, value: `EGP ${Math.round(expectedCash).toLocaleString("en-EG")}`, formulaId: "FIN-002",
      inputs: [{ label: locale === "ar" ? "تسويات مستلمة + في الطريق" : "Received + In-transit settlements", value: `EGP ${Math.round(expectedCash).toLocaleString("en-EG")}` }],
      sources: [t.sources.bosta],
    },
    {
      label: t.pendingSettlement, value: `EGP ${Math.round(pendingSettlement).toLocaleString("en-EG")}`, formulaId: "FIN-002",
      inputs: [{ label: locale === "ar" ? "تسويات معلقة" : "Pending settlements", value: `EGP ${Math.round(pendingSettlement).toLocaleString("en-EG")}` }],
      sources: [t.sources.bosta],
    },
    {
      label: t.deliveryRate, value: `${(deliveryRatePct ?? 0).toFixed(1)}%`, formulaId: "SHP-001",
      inputs: [
        { label: locale === "ar" ? "طلبات مُسلَّمة" : "Delivered Orders", value: String(orderCount) },
        { label: locale === "ar" ? "÷ إجمالي المشحون" : "÷ Total Shipped", value: "100" },
        { label: locale === "ar" ? "معدل التسليم" : "Delivery Rate", value: `${deliveryRatePct.toFixed(1)}%`, isResult: true },
      ],
      sources: [t.sources.bosta],
      cls: deliveryRatePct >= 85 ? "text-green-600" : "text-red-600",
    },
    {
      label: t.trueCpa, value: `EGP ${Math.round(trueCpa).toLocaleString("en-EG")}`, formulaId: "MKT-002",
      inputs: cpaLines,
      sources: [t.sources.meta, t.sources.tiktok, t.sources.bosta],
    },
    {
      label: t.trueRoas, value: `${(trueRoas ?? 0).toFixed(2)}×`, formulaId: "MKT-012",
      inputs: roasLines,
      sources: [t.sources.meta, t.sources.tiktok],
      cls: trueRoas >= 1 ? "text-green-600" : "text-red-600",
    },
    {
      label: t.businessHealth, value: `${businessHealth}/100`, formulaId: "FIN-003",
      inputs: [{ label: locale === "ar" ? "نقاط صحة الأعمال (SCORE-001)" : "Business Health Score (SCORE-001)", value: `${businessHealth}/100` }],
      sources: [t.sources.easyOrders, t.sources.bosta, t.sources.meta, t.sources.tiktok],
      cls: businessHealth >= 70 ? "text-green-600" : businessHealth >= 50 ? "text-amber-500" : "text-red-600",
    },
  ];

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="flex flex-wrap items-stretch divide-x divide-gray-100">
        {kpis.map((kpi, i) => (
          <div key={i} className="flex flex-col px-4 py-3 min-w-fit">
            <div className="flex items-center gap-1">
              <span className={cn("text-base font-bold tabular-nums", kpi.cls ?? "text-gray-900")}>
                {kpi.value}
              </span>
              <FormulaMiniInspector
                formulaId={kpi.formulaId}
                resultValue={kpi.value}
                inputLines={kpi.inputs}
                dataSources={kpi.sources}
                lastUpdated="2 min ago"
                locale={locale}
                position={i >= 5 ? "right" : "left"}
              />
            </div>
            <span className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">{kpi.label}</span>
            {showProjected && (kpi.formulaId === "TRUE-001" || kpi.formulaId === "FIN-001") && (
              <span className="text-xs text-amber-500 mt-0.5">{locale === "ar" ? "متوقع" : "projected"}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
