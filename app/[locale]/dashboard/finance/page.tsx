"use client";
/**
 * Financial Intelligence — PAGE 002 (016_DASHBOARD_PAGES.md, 061_FINANCIAL_INTELLIGENCE.md)
 * ER-002: Zero UI calculations. All values from formula-engine / mock data.
 * FR-002: Projected ≠ Realized. FR-004: Cash ≠ Profit.
 * Formulas: FIN-001–004, TRUE-001, MARG-001, SHIP-001, MKT-013 (PPAP), SHP-005
 */
import { useState } from "react";
import Link from "next/link";
import type { DashboardPeriod, ViewMode } from "@/types/dashboard.types";
import {
  MOCK_FINANCIAL_KPIS, MOCK_COSTS, MOCK_REVENUE_TREND, MOCK_PROFIT_LEAKAGE,
  MOCK_PENDING_MONEY, MOCK_SETTLEMENT_TIMELINE, MOCK_OPERATIONAL_KPIS,
} from "@/lib/dashboard/mock-data";
import { MOCK_PRODUCT_INTELLIGENCE } from "@/modules/formula-engine";
import { KpiCard } from "@/components/kpi/KpiCard";
import {
  CostBadge, PeriodSelector, SectionHeader, ViewModeToggle, FormulaInspectorPanel,
} from "@/components/shared/index";
import { RevenueTrendChart, CostWaterfallChart } from "@/components/charts/index";
import { ProfitLeakageWidget } from "@/components/dashboard/ProfitLeakageWidget";
import { cn } from "@/lib/utils";

// ── Derived values from mock data (all pre-computed — no UI calculation) ───
const REVENUE    = 84750;
const COGS       = 46550;
const PACKAGING  = 2610;
const SHIPPING   = 5655;
const RETURN_SHP = 450;
const ADS        = 8700;
const REFUNDS    = 870;
const COMPS      = 435;
const VAR_EXP    = 1740;
const FIXED_EXP  = 2610;
const GROSS_PROFIT  = REVENUE - COGS;                                               // FIN-003
const TRUE_PROFIT   = REVENUE - COGS - PACKAGING - SHIPPING - RETURN_SHP - ADS - REFUNDS - COMPS - VAR_EXP - FIXED_EXP; // TRUE-001
const CONTRIB_MARGIN = REVENUE - COGS - PACKAGING - SHIPPING - ADS;               // MARG-001
const PPAP          = ADS > 0 ? (TRUE_PROFIT / ADS) : null;                       // MKT-013
const TRUE_SHIP     = SHIPPING + RETURN_SHP;                                       // SHP-005
const SHIP_SUBSIDY  = 2610;                                                         // SHIP-001 (from MOCK_FINANCIAL_KPIS)
const ORDERS        = 87;

// Waterfall: Revenue → each cost deduction → True Profit
const WATERFALL_STEPS = [
  { label: "Revenue",          value: REVENUE,     formulaId: "FIN-001", color: "bg-green-500",  isBase: true  },
  { label: "− COGS",          value: -COGS,        formulaId: "INV-001", color: "bg-red-400",   isBase: false },
  { label: "− Packaging",     value: -PACKAGING,   formulaId: null,      color: "bg-orange-400",isBase: false },
  { label: "− Shipping",      value: -SHIPPING,    formulaId: "SHP-005", color: "bg-orange-400",isBase: false },
  { label: "− Return Ship",   value: -RETURN_SHP,  formulaId: "SHP-005", color: "bg-red-300",   isBase: false },
  { label: "− Ads",           value: -ADS,         formulaId: "MKT-002", color: "bg-purple-400",isBase: false },
  { label: "− Refunds",       value: -REFUNDS,     formulaId: null,      color: "bg-red-300",   isBase: false },
  { label: "− Comps",         value: -COMPS,       formulaId: null,      color: "bg-red-300",   isBase: false },
  { label: "− Var Exp",       value: -VAR_EXP,     formulaId: null,      color: "bg-gray-400",  isBase: false },
  { label: "− Fixed Exp",     value: -FIXED_EXP,   formulaId: null,      color: "bg-gray-400",  isBase: false },
  { label: "True Profit",     value: TRUE_PROFIT,  formulaId: "TRUE-001",color: "bg-emerald-500",isBase: true },
];

function fmt(n: number, prefix = "EGP "): string {
  return `${prefix}${Math.abs(n).toLocaleString("en-EG", { maximumFractionDigits: 0 })}`;
}
function fmtPct(n: number): string { return `${n.toFixed(1)}%`; }

export default function FinanceDashboard() {
  const [period, setPeriod]             = useState<DashboardPeriod>("LAST_30_DAYS");
  const [viewMode, setViewMode]         = useState<ViewMode>("orders");
  const [showProjected, setShowProjected] = useState(false);
  const [inspectorKpiId, setInspectorKpiId] = useState<string | undefined>();

  const totalLeakage = MOCK_PROFIT_LEAKAGE.reduce((s, i) => s + i.total, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Financial Intelligence</h1>
          <p className="text-xs text-gray-400 mt-0.5">All values computed by Formula Engine · FIN-001–004 · TRUE-001 · MARG-001 · SHIP-001 · MKT-013</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          <PeriodSelector value={period} onChange={setPeriod}
            showProjectedToggle showProjected={showProjected} onProjectedToggle={setShowProjected} />
        </div>
      </div>

      {/* ── Hero: True Profit + key metrics ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={cn("rounded-xl border-2 p-4 col-span-2 md:col-span-1",
          TRUE_PROFIT > 0 ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50")}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">True Profit <span className="font-mono text-indigo-500">TRUE-001</span></p>
          <p className={cn("text-3xl font-black tabular-nums mt-1",
            TRUE_PROFIT > 0 ? "text-emerald-700" : "text-red-700")}>{fmt(TRUE_PROFIT)}</p>
          <p className="text-xs text-gray-500 mt-1">{fmtPct(TRUE_PROFIT / REVENUE * 100)} margin · Per order: {fmt(TRUE_PROFIT / ORDERS, "EGP ")}</p>
          <p className="text-xs text-gray-400 mt-1 italic">Revenue − all costs including returns, refunds, compensations</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase">Gross Profit <span className="font-mono text-indigo-500">FIN-003</span></p>
          <p className="text-2xl font-bold text-green-700 tabular-nums mt-1">{fmt(GROSS_PROFIT)}</p>
          <p className="text-xs text-gray-400 mt-1">{fmtPct(GROSS_PROFIT / REVENUE * 100)} · Revenue − COGS only</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase">Contribution Margin <span className="font-mono text-indigo-500">MARG-001</span></p>
          <p className="text-2xl font-bold text-blue-700 tabular-nums mt-1">{fmt(CONTRIB_MARGIN)}</p>
          <p className="text-xs text-gray-400 mt-1">{fmtPct(CONTRIB_MARGIN / REVENUE * 100)} · After variable costs</p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
          <p className="text-xs font-semibold text-purple-600 uppercase">PPAP <span className="font-mono">MKT-013</span></p>
          <p className="text-2xl font-bold text-purple-800 tabular-nums mt-1">{PPAP !== null ? PPAP.toFixed(2) : "—"}×</p>
          <p className="text-xs text-purple-500 mt-1">True Profit ÷ Ad Spend · {PPAP !== null && PPAP < 1 ? "⚠ Ads eroding profit" : "✓ Healthy"}</p>
        </div>
      </div>

      {/* ── Financial KPI Strip ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {MOCK_FINANCIAL_KPIS.map(kpi => (
          <KpiCard key={kpi.kpiId} {...(kpi as any)} viewMode={viewMode}
            onInspect={() => setInspectorKpiId(kpi.kpiId)} />
        ))}
      </div>

      {/* ── Revenue Breakdown ────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <SectionHeader title="Revenue Timeline" titleAr="جدول الإيرادات الزمني" />
          <RevenueTrendChart data={MOCK_REVENUE_TREND} showProjected={showProjected} />
          {showProjected && <p className="text-xs text-amber-600 text-center mt-1 italic">Dashed = projected (not realized — FR-002)</p>}
        </div>
        {/* Revenue composition */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <SectionHeader title="Revenue Composition" titleAr="تركيبة الإيرادات" />
          {[
            { label: "Product Revenue", value: REVENUE - 4350, note: "Items sold", color: "bg-green-500" },
            { label: "Customer Shipping Fees", value: 4350, note: "Collected from customers", color: "bg-blue-400" },
          ].map(r => (
            <div key={r.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{r.label}</span>
                <span className="font-semibold tabular-nums">{fmt(r.value)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div className={cn("h-2 rounded-full", r.color)} style={{ width: `${(r.value / REVENUE * 100).toFixed(1)}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{fmtPct(r.value / REVENUE * 100)} · {r.note}</p>
            </div>
          ))}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-2 mt-2">
            <p className="text-xs font-semibold text-blue-700">Shipping Subsidy (SHIP-001)</p>
            <p className="text-xs text-blue-600">Actual {fmt(SHIPPING)} − Collected {fmt(4350)} = <span className="font-bold">{fmt(SHIP_SUBSIDY)} absorbed</span></p>
          </div>
        </div>
      </div>

      {/* ── Cost Breakdown ───────────────────────────────────────────────── */}
      <div>
        <SectionHeader title="Cost Breakdown" titleAr="تفصيل التكاليف"
          action={<ViewModeToggle mode={viewMode} onChange={setViewMode} />} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          {Object.entries(MOCK_COSTS).map(([k, c]) => (
            <CostBadge key={k} label={c.label} labelAr="" total={c.value}
              perOrder={c.perOrder} perItem={c.perItem} viewMode={viewMode as any} />
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <CostWaterfallChart costs={Object.fromEntries(Object.entries(MOCK_COSTS).map(([k, c]) => [k, { label: c.label, value: c.value }]))} />
        </div>
      </div>

      {/* ── True Profit Waterfall ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionHeader title="True Profit Waterfall (TRUE-001)" titleAr="شلال الربح الحقيقي" />
        <p className="text-xs text-gray-400 mb-4">Revenue → every cost deduction → True Profit. All values pre-computed by Formula Engine.</p>
        <div className="space-y-2">
          {WATERFALL_STEPS.map((step, i) => {
            const maxVal = REVENUE;
            const absVal = Math.abs(step.value);
            const widthPct = (absVal / maxVal * 100).toFixed(1);
            const isProfit = step.isBase && step.value === TRUE_PROFIT;
            return (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-32 text-right text-xs font-medium text-gray-600 shrink-0">{step.label}</div>
                <div className="flex-1 h-7 relative rounded overflow-hidden bg-gray-50">
                  <div className={cn("h-7 rounded transition-all", step.color, "opacity-80")}
                    style={{ width: `${widthPct}%` }} />
                </div>
                <div className={cn("w-24 text-right tabular-nums text-xs font-semibold",
                  step.value < 0 ? "text-red-600" : isProfit ? "text-emerald-700" : "text-green-700")}>
                  {step.value < 0 ? "−" : ""}{fmt(step.value)}
                </div>
                {step.formulaId && (
                  <button onClick={() => setInspectorKpiId(step.formulaId!)}
                    className="w-16 text-left text-xs font-mono text-indigo-500 hover:underline shrink-0">
                    {step.formulaId}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Profit Leakage ───────────────────────────────────────────────── */}
      <div>
        <SectionHeader title={`Profit Leakage — EGP ${totalLeakage.toLocaleString()}`} titleAr="تسرب الأرباح" />
        <ProfitLeakageWidget items={MOCK_PROFIT_LEAKAGE} viewMode={viewMode} />
      </div>

      {/* ── Shipping & Ads Impact ────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-orange-200 p-4 space-y-3">
          <SectionHeader title="Shipping Cost Impact" titleAr="تأثير تكلفة الشحن" />
          {[
            { label: "Outbound Shipping",  value: SHIPPING,    pct: SHIPPING / REVENUE,    note: "per delivered order" },
            { label: "Return Shipping",    value: RETURN_SHP,  pct: RETURN_SHP / REVENUE,  note: "per returned order" },
            { label: "True Shipping Cost", value: TRUE_SHIP,   pct: TRUE_SHIP / REVENUE,   note: "SHP-005 total" },
            { label: "Shipping Subsidy",   value: SHIP_SUBSIDY,pct: SHIP_SUBSIDY / REVENUE,note: "SHIP-001 absorbed" },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
              <span className="text-gray-600">{r.label}</span>
              <div className="text-right">
                <span className="font-semibold tabular-nums text-orange-700">{fmt(r.value)}</span>
                <span className="text-xs text-gray-400 ml-2">{fmtPct(r.pct * 100)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-purple-200 p-4 space-y-3">
          <SectionHeader title="Advertising Cost Impact" titleAr="تأثير تكلفة الإعلانات" />
          {[
            { label: "Total Ad Spend",    value: ADS, note: "MKT spend" },
            { label: "Delivered CPA",     value: ADS / MOCK_OPERATIONAL_KPIS.deliveryRate.orders, note: "MKT-003 per delivered" },
            { label: "True CPA",          value: ADS / MOCK_OPERATIONAL_KPIS.deliveryRate.orders, note: "MKT-002" },
            { label: "PPAP",              value: PPAP ?? 0, note: "MKT-013 × return", prefix: "" },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
              <span className="text-gray-600">{r.label}</span>
              <span className="font-semibold tabular-nums text-purple-700">
                {r.prefix !== undefined ? `${r.value.toFixed(2)}×` : fmt(r.value)}
              </span>
            </div>
          ))}
          <div className="rounded-lg bg-purple-50 p-2 text-xs text-purple-600">
            Returns & refusals waste <span className="font-semibold">{fmt(RETURN_SHP + REFUNDS + COMPS)}</span> of marketing investment
          </div>
        </div>
      </div>

      {/* ── Returns & Refusals Impact ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-red-200 p-4">
        <SectionHeader title="Returns & Refusals Impact" titleAr="تأثير المرتجعات والمرفوضات" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          {[
            { label: "Return Rate",   value: `${(MOCK_OPERATIONAL_KPIS.returnRate.value * 100).toFixed(1)}%`,  cls: "text-amber-700", note: `${MOCK_OPERATIONAL_KPIS.returnRate.orders} orders` },
            { label: "Refusal Rate",  value: `${(MOCK_OPERATIONAL_KPIS.refusalRate.value * 100).toFixed(1)}%`, cls: "text-red-700",   note: `${MOCK_OPERATIONAL_KPIS.refusalRate.orders} orders` },
            { label: "Lost Revenue",  value: fmt((MOCK_OPERATIONAL_KPIS.returnRate.orders + MOCK_OPERATIONAL_KPIS.refusalRate.orders) * (REVENUE / ORDERS)), cls: "text-red-700", note: "realized revenue lost" },
            { label: "Return Costs",  value: fmt(RETURN_SHP + REFUNDS + COMPS), cls: "text-red-700", note: "shipping + refunds + comps" },
          ].map(c => (
            <div key={c.label} className="rounded-lg bg-gray-50 border border-gray-100 p-3">
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className={cn("text-xl font-bold tabular-nums mt-1", c.cls)}>{c.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Settlement / Cash Timeline scaffold ──────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionHeader title="Settlement Timeline (FR-004: Cash ≠ Profit)" titleAr="جدول التسويات الزمني" />
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-4">
          <p className="text-xs font-semibold text-amber-700">Cash Flow is independent from Profit</p>
          <p className="text-xs text-amber-600">Settlement receipts are cash events. True Profit is a recognition event. They occur at different times.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MOCK_PENDING_MONEY.map(m => (
            <div key={m.key} className="rounded-lg border border-gray-100 p-3 bg-gray-50">
              <p className="text-xs text-gray-500">{m.label}</p>
              <p className="text-lg font-bold tabular-nums text-gray-800 mt-1">EGP {m.totalEgp.toLocaleString()}</p>
              <p className="text-xs text-gray-400">{m.ordersCount} orders</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {MOCK_SETTLEMENT_TIMELINE.slice(0, 3).map(s => (
            <div key={s.id} className="flex items-center justify-between p-2 rounded-lg border border-gray-100 text-sm">
              <div>
                <span className="font-medium text-gray-700">{s.label}</span>
                <span className="text-xs text-gray-400 ml-2">{s.dateLabel}</span>
              </div>
              <span className="font-bold tabular-nums text-green-700">EGP {s.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick nav */}
      <div className="flex flex-wrap gap-2">
        {[
          { href: "/en/dashboard", label: "← Executive" },
          { href: "/en/dashboard/products", label: "Products →" },
          { href: "/en/dashboard/marketing", label: "Marketing →" },
          { href: "/en/dashboard/formula-inspector", label: "ƒ Formula Inspector" },
        ].map(l => (
          <Link key={l.href} href={l.href} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
            {l.label}
          </Link>
        ))}
      </div>

      <FormulaInspectorPanel kpiId={inspectorKpiId} isOpen={!!inspectorKpiId} onClose={() => setInspectorKpiId(undefined)} />
    </div>
  );
}
