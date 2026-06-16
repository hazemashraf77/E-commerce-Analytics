"use client";
import { useState } from "react";
import { FormulaMiniInspector } from "./FormulaMiniInspectorV3";
import type { Terms, DimMode } from "./locale";
import type { ProductKpiRow } from "@/modules/formula-engine";
import { cn } from "@/lib/utils";

interface GridProps {
  t: Terms;
  locale: "en" | "ar";
  dimMode: DimMode;
  products: ProductKpiRow[];
  search: string;
}

type TabIdx = 0|1|2|3|4|5|6|7|8|9;
type FilterKey = "all"|"profitable"|"losing"|"lowStock"|"highCpa"|"highReturns"|"attention";
type ViewKey = "ceo"|"finance"|"marketing"|"shipping"|"inventory";

const VIEW_TAB: Record<ViewKey, TabIdx> = { ceo:0, finance:4, marketing:5, shipping:6, inventory:7 };
const FILTER_FNS: Record<FilterKey, (p: ProductKpiRow) => boolean> = {
  all: () => true,
  profitable: p => p.trueProfit > 0,
  losing: p => p.trueProfit < 0,
  lowStock: p => p.inventoryStatus === "LOW_STOCK" || p.inventoryStatus === "OUT_OF_STOCK",
  highCpa: p => (p.trueCpa ?? 0) > 120,
  highReturns: p => (p.returnRate ?? 0) > 0.08,
  attention: p => p.inventoryStatus !== "IN_STOCK" || (p.ppap ?? 0) < 1 || (p.returnRate ?? 0) > 0.1,
};

const INV_CLS: Record<string, string> = { IN_STOCK:"text-green-600", LOW_STOCK:"text-amber-500", OUT_OF_STOCK:"text-red-600", DEAD_STOCK:"text-gray-400" };
const INV_SHORT: Record<string, string> = { IN_STOCK:"OK", LOW_STOCK:"Low", OUT_OF_STOCK:"Out", DEAD_STOCK:"Dead" };

// Term tooltip
function TermTip({ term, label, tip }: { term: string; label: string; tip: string }) {
  const [open, setOpen] = useState(false);
  return (
    <th className="px-2 py-2 text-left relative group">
      <span className="text-xs font-semibold text-gray-400 whitespace-nowrap cursor-help underline decoration-dotted"
        onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
        {label}
      </span>
      {open && (
        <div className="absolute z-50 top-7 left-0 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 w-52 shadow-lg whitespace-normal pointer-events-none">
          {tip}
        </div>
      )}
    </th>
  );
}

function safe(n: number | null | undefined, digits = 0): string {
  if (n == null || !isFinite(n)) return "—";
  return digits > 0 ? n.toFixed(digits) : Math.round(n).toLocaleString("en-EG");
}
function egp(n: number | null | undefined): string {
  return n == null || !isFinite(n) ? "—" : `EGP ${Math.round(n).toLocaleString("en-EG")}`;
}
function pct(n: number | null | undefined): string {
  return n == null || !isFinite(n) ? "—" : `${n.toFixed(1)}%`;
}
function mult(n: number | null | undefined): string {
  return n == null || !isFinite(n) ? "—" : `${n.toFixed(2)}×`;
}

function NameCell({ p }: { p: ProductKpiRow }) {
  return (
    <td className="px-3 py-2 sticky left-0 bg-white border-r border-gray-50 z-10">
      <div className="font-medium text-gray-900 truncate max-w-36 text-xs" title={p.productName}>{p.productName}</div>
      <div className="text-gray-400 font-mono text-xs">{p.sku}</div>
    </td>
  );
}

export function ProductIntelligenceGrid({ t, locale, dimMode, products, search }: GridProps) {
  const [tab, setTab] = useState<TabIdx>(0);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [view, setView]   = useState<ViewKey | null>(null);

  const filtered = products.filter(p =>
    (p.productName.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
    && FILTER_FNS[filter](p)
  );

  function selectView(k: ViewKey) {
    setView(k);
    setTab(VIEW_TAB[k]);
  }

  // dim value helper
  function dim(total: number, perOrder: number | null, perItem: number | null): string {
    if (dimMode === "perOrder") return perOrder != null ? egp(perOrder) : "—";
    if (dimMode === "perItem")  return perItem != null  ? egp(perItem)  : "—";
    return egp(total);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Controls */}
      <div className="px-3 pt-3 pb-2 border-b border-gray-50 space-y-2">
        {/* Saved views */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-400">{t.savedViews}</span>
          {(Object.entries(t.views) as [ViewKey, string][]).map(([k, v]) => (
            <button key={k} onClick={() => selectView(k)}
              className={cn("rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors",
                view === k ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:bg-gray-50")}>
              {v}
            </button>
          ))}
        </div>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(Object.entries(t.filters) as [FilterKey, string][]).map(([k, v]) => {
            const cnt = k === "all" ? products.length : products.filter(FILTER_FNS[k]).length;
            return (
              <button key={k} onClick={() => setFilter(k)}
                className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors",
                  filter === k ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:bg-gray-50")}>
                {v}{k !== "all" && cnt > 0 && <span className="ml-1 opacity-70">({cnt})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-gray-50 bg-gray-50/50">
        {t.tabs.map((tabLabel, i) => (
          <button key={i} onClick={() => { setTab(i as TabIdx); setView(null); }}
            className={cn("shrink-0 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
              tab === i ? "border-gray-900 text-gray-900 bg-white" : "border-transparent text-gray-400 hover:text-gray-600")}>
            {tabLabel}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400 sticky left-0 bg-gray-50 z-10 whitespace-nowrap">{t.col.product}</th>
              {tab === 0 && <>
                <TermTip term="delivered" label={t.col.delivered} tip={t.terms.delivered} />
                <TermTip term="rejected"  label={t.col.rejected}  tip={t.terms.rejected} />
                <TermTip term="returning" label={t.col.returning} tip={t.terms.returning} />
                <TermTip term="returned"  label={t.col.returned}  tip={t.terms.returned} />
                <TermTip term="exchange"  label={t.col.exchange}  tip={t.terms.exchange} />
                <TermTip term="refund"    label={t.col.refund}    tip={t.terms.refund} />
                <TermTip term="pending"   label={t.col.pending}   tip={t.terms.pending} />
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-400">{t.col.revenue}</th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-400">{t.col.totalCost}</th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-400">{t.col.trueProfit}</th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-400">{t.col.margin}</th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-400">{t.col.health}</th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-gray-400">{t.col.alert}</th>
              </>}
              {tab === 1 && <>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400 whitespace-nowrap">Created</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400 whitespace-nowrap">Confirmed</th>
                <TermTip term="picked"      label={t.terms.picked.split(" ").slice(-1)[0]}       tip={t.terms.picked} />
                <TermTip term="sentToBosta" label={t.sources.bosta}                              tip={t.terms.sentToBosta} />
                <th className="px-2 py-2 text-xs font-semibold text-gray-400 whitespace-nowrap">In Transit</th>
                <TermTip term="delivered"   label={t.col.delivered}  tip={t.terms.delivered} />
                <TermTip term="rejected"    label={t.col.rejected}   tip={t.terms.rejected} />
                <TermTip term="returning"   label={t.col.returning}  tip={t.terms.returning} />
                <TermTip term="returned"    label={t.col.returned}   tip={t.terms.returned} />
              </>}
              {tab === 2 && <>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.revenue}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">Rev/Order</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">Rev/Item</th>
              </>}
              {tab === 3 && <>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.cogs}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.packaging}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.shipping}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.returnShip}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.ads}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.totalCost}</th>
              </>}
              {tab === 4 && <>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.grossProfit}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.netProfit}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.trueProfit}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.margin}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.profitPerOrder}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.profitLeakage}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.ppap}</th>
              </>}
              {tab === 5 && <>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.adSpend}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.adCpa}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.deliveredCpa}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.trueCpa}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.deliveredRoas}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.trueRoas}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.ppap}</th>
              </>}
              {tab === 6 && <>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.shipping}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.returnShip}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.deliveryRate}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.returnRate}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.refusalRate}</th>
              </>}
              {tab === 7 && <>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.stock}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.invValue}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.cashLocked}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.days}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.velocity}</th>
              </>}
              {tab === 8 && <>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">Expected Cash</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.cashLocked}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.invValue}</th>
              </>}
              {tab === 9 && <>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">{t.col.health}</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">Biggest Risk</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">Opportunity</th>
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">Action</th>
              </>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(p => {
              const totalCost = (p.cogs||0)+(p.packagingCost||0)+(p.shippingCost||0)+(p.returnShippingCost||0)+(p.adSpend||0);
              const invStatus = p.inventoryStatus ?? "IN_STOCK";
              const alert = invStatus !== "IN_STOCK" ? (INV_SHORT[invStatus] ?? invStatus) : (p.ppap ?? 1) < 1 ? "PPAP<1" : "";
              const velocity = p.ordersDelivered > 0 ? (p.ordersDelivered / 30).toFixed(1) : "0";
              const risk = invStatus !== "IN_STOCK" ? `Stock: ${INV_SHORT[invStatus]}` : (p.ppap ?? 0) < 1 ? "PPAP < 1" : "—";
              const opp = (p.trueRoas ?? 0) >= 1.5 ? "Scale ads" : (p.deliveryRate ?? 0) >= 0.9 ? "Strong delivery" : "—";
              const action = invStatus === "LOW_STOCK" || invStatus === "OUT_OF_STOCK" ? "Reorder" : (p.ppap ?? 0) < 1 ? "Review ads" : "Monitor";

              return (
                <tr key={p.productId} className="hover:bg-gray-50/60 transition-colors">
                  <NameCell p={p} />
                  {tab === 0 && <>
                    <td className="px-2 py-2 text-center font-semibold text-green-600">{p.ordersDelivered}</td>
                    <td className="px-2 py-2 text-center text-red-500">{p.ordersRefused || "—"}</td>
                    <td className="px-2 py-2 text-center text-amber-500">{p.ordersReturned ? Math.ceil(p.ordersReturned / 2) : "—"}</td>
                    <td className="px-2 py-2 text-center text-amber-600">{p.ordersReturned || "—"}</td>
                    <td className="px-2 py-2 text-center text-gray-500">—</td>
                    <td className="px-2 py-2 text-center text-gray-500">—</td>
                    <td className="px-2 py-2 text-center text-gray-400">{p.ordersShipped - p.ordersDelivered - p.ordersRefused - p.ordersReturned > 0 ? p.ordersShipped - p.ordersDelivered - p.ordersRefused - p.ordersReturned : "—"}</td>
                    <td className="px-2 py-2 tabular-nums">
                      <div className="flex items-center gap-0.5">{dim(p.revenue, p.revenuePerOrder, p.revenuePerItem)}<FormulaMiniInspector formulaId="FIN-001" locale={locale} /></div>
                    </td>
                    <td className="px-2 py-2 tabular-nums text-gray-500">{egp(totalCost)}</td>
                    <td className="px-2 py-2 tabular-nums">
                      <div className={cn("flex items-center gap-0.5", p.trueProfit >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold")}>
                        {dim(p.trueProfit, p.profitPerOrder, p.profitPerItem)}
                        <FormulaMiniInspector formulaId="TRUE-001" locale={locale} />
                      </div>
                    </td>
                    <td className="px-2 py-2 tabular-nums">{pct(p.profitMarginPct)}</td>
                    <td className="px-2 py-2 text-center"><span className={cn("font-semibold text-xs", INV_CLS[invStatus])}>74</span></td>
                    <td className="px-2 py-2 text-center">
                      {alert ? <span className={cn("rounded-full text-xs px-1.5 py-0.5", p.trueProfit < 0 || invStatus !== "IN_STOCK" ? "text-red-500" : "text-amber-500")}>{alert}</span> : "—"}
                    </td>
                  </>}
                  {tab === 1 && <>
                    <td className="px-2 py-2 text-center">{p.ordersCreated}</td>
                    <td className="px-2 py-2 text-center">{p.ordersConfirmed}</td>
                    <td className="px-2 py-2 text-center text-blue-600">{p.ordersShipped}</td>
                    <td className="px-2 py-2 text-center text-blue-500">{p.ordersShipped}</td>
                    <td className="px-2 py-2 text-center">{Math.max(0, p.ordersShipped - p.ordersDelivered - p.ordersRefused)}</td>
                    <td className="px-2 py-2 text-center font-semibold text-green-600">{p.ordersDelivered}</td>
                    <td className="px-2 py-2 text-center text-red-500">{p.ordersRefused || "—"}</td>
                    <td className="px-2 py-2 text-center text-amber-500">{p.ordersReturned ? Math.ceil(p.ordersReturned / 2) : "—"}</td>
                    <td className="px-2 py-2 text-center text-amber-600">{p.ordersReturned || "—"}</td>
                  </>}
                  {tab === 2 && <>
                    <td className="px-2 py-2 tabular-nums"><div className="flex items-center gap-0.5">{dim(p.revenue, p.revenuePerOrder, p.revenuePerItem)}<FormulaMiniInspector formulaId="FIN-001" locale={locale} /></div></td>
                    <td className="px-2 py-2 tabular-nums">{egp(p.revenuePerOrder)}</td>
                    <td className="px-2 py-2 tabular-nums">{egp(p.revenuePerItem)}</td>
                  </>}
                  {tab === 3 && <>
                    <td className="px-2 py-2 tabular-nums"><div className="flex items-center gap-0.5">{egp(p.cogs)}<FormulaMiniInspector formulaId="INV-001" locale={locale} /></div></td>
                    <td className="px-2 py-2 tabular-nums">{egp(p.packagingCost)}</td>
                    <td className="px-2 py-2 tabular-nums">{egp(p.shippingCost)}</td>
                    <td className="px-2 py-2 tabular-nums">{egp(p.returnShippingCost)}</td>
                    <td className="px-2 py-2 tabular-nums">{egp(p.adSpend)}</td>
                    <td className="px-2 py-2 tabular-nums font-semibold">{egp(totalCost)}</td>
                  </>}
                  {tab === 4 && <>
                    <td className="px-2 py-2 tabular-nums text-green-600"><div className="flex items-center gap-0.5">{egp(p.grossProfit)}<FormulaMiniInspector formulaId="FIN-003" locale={locale} /></div></td>
                    <td className="px-2 py-2 tabular-nums">{egp(p.netProfit)}</td>
                    <td className={cn("px-2 py-2 tabular-nums font-semibold", p.trueProfit >= 0 ? "text-green-600" : "text-red-600")}><div className="flex items-center gap-0.5">{egp(p.trueProfit)}<FormulaMiniInspector formulaId="TRUE-001" locale={locale} /></div></td>
                    <td className="px-2 py-2 tabular-nums">{pct(p.profitMarginPct)}</td>
                    <td className="px-2 py-2 tabular-nums">{egp(p.profitPerOrder)}</td>
                    <td className="px-2 py-2 tabular-nums text-red-500">{egp(p.profitLeakage)}</td>
                    <td className={cn("px-2 py-2 tabular-nums font-semibold", (p.ppap ?? 0) >= 1 ? "text-green-600" : "text-red-600")}><div className="flex items-center gap-0.5">{safe(p.ppap, 2)}<FormulaMiniInspector formulaId="MKT-013" locale={locale} /></div></td>
                  </>}
                  {tab === 5 && <>
                    <td className="px-2 py-2 tabular-nums">{egp(p.adSpend)}</td>
                    <td className="px-2 py-2 tabular-nums"><div className="flex items-center gap-0.5">{egp(p.advertisingCpa)}<FormulaMiniInspector formulaId="MKT-004" locale={locale} /></div></td>
                    <td className="px-2 py-2 tabular-nums"><div className="flex items-center gap-0.5">{egp(p.deliveredCpa)}<FormulaMiniInspector formulaId="MKT-003" locale={locale} /></div></td>
                    <td className="px-2 py-2 tabular-nums font-semibold"><div className="flex items-center gap-0.5">{egp(p.trueCpa)}<FormulaMiniInspector formulaId="MKT-002" locale={locale} /></div></td>
                    <td className="px-2 py-2 tabular-nums"><div className="flex items-center gap-0.5">{mult(p.deliveredRoas)}<FormulaMiniInspector formulaId="MKT-011" locale={locale} /></div></td>
                    <td className={cn("px-2 py-2 tabular-nums font-semibold", (p.trueRoas ?? 0) >= 1 ? "text-green-600" : "text-red-600")}><div className="flex items-center gap-0.5">{mult(p.trueRoas)}<FormulaMiniInspector formulaId="MKT-012" locale={locale} /></div></td>
                    <td className={cn("px-2 py-2 tabular-nums font-semibold", (p.ppap ?? 0) >= 1 ? "text-green-600" : "text-red-600")}>{safe(p.ppap, 2)}</td>
                  </>}
                  {tab === 6 && <>
                    <td className="px-2 py-2 tabular-nums">{egp(p.shippingCost)}</td>
                    <td className="px-2 py-2 tabular-nums">{egp(p.returnShippingCost)}</td>
                    <td className={cn("px-2 py-2 tabular-nums font-semibold", (p.deliveryRate ?? 0) >= 0.85 ? "text-green-600" : "text-red-600")}><div className="flex items-center gap-0.5">{pct((p.deliveryRate ?? 0) * 100)}<FormulaMiniInspector formulaId="SHP-001" locale={locale} /></div></td>
                    <td className={cn("px-2 py-2 tabular-nums", (p.returnRate ?? 0) <= 0.05 ? "text-green-600" : "text-amber-500")}><div className="flex items-center gap-0.5">{pct((p.returnRate ?? 0) * 100)}<FormulaMiniInspector formulaId="SHP-002" locale={locale} /></div></td>
                    <td className={cn("px-2 py-2 tabular-nums", (p.refusalRate ?? 0) <= 0.04 ? "text-green-600" : "text-red-600")}><div className="flex items-center gap-0.5">{pct((p.refusalRate ?? 0) * 100)}<FormulaMiniInspector formulaId="SHP-003" locale={locale} /></div></td>
                  </>}
                  {tab === 7 && <>
                    <td className="px-2 py-2 text-center font-semibold">{p.stockAvailable}</td>
                    <td className="px-2 py-2 tabular-nums"><div className="flex items-center gap-0.5">{egp(p.inventoryValue)}<FormulaMiniInspector formulaId="INV-002" locale={locale} /></div></td>
                    <td className="px-2 py-2 tabular-nums text-amber-600">{egp(p.cashLocked)}</td>
                    <td className={cn("px-2 py-2 tabular-nums font-semibold", p.daysRemaining != null && p.daysRemaining <= 7 ? "text-red-600" : p.daysRemaining != null && p.daysRemaining <= 14 ? "text-amber-500" : "text-green-600")}>
                      <div className="flex items-center gap-0.5">
                        {p.daysRemaining != null ? `${Math.round(p.daysRemaining)}d` : "∞"}
                        <FormulaMiniInspector formulaId="INV-004" locale={locale} />
                      </div>
                    </td>
                    <td className="px-2 py-2 tabular-nums">{velocity} u/d</td>
                  </>}
                  {tab === 8 && <>
                    <td className="px-2 py-2 tabular-nums">{egp(p.revenue * 0.7)}</td>
                    <td className="px-2 py-2 tabular-nums text-amber-600">{egp(p.cashLocked)}</td>
                    <td className="px-2 py-2 tabular-nums">{egp(p.inventoryValue)}</td>
                  </>}
                  {tab === 9 && <>
                    <td className="px-2 py-2 text-center font-semibold">74</td>
                    <td className={cn("px-2 py-2 text-xs", risk !== "—" ? "text-red-500" : "text-gray-300")}>{risk}</td>
                    <td className={cn("px-2 py-2 text-xs", opp !== "—" ? "text-green-600" : "text-gray-300")}>{opp}</td>
                    <td className="px-2 py-2 text-xs text-gray-600">{action}</td>
                  </>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-gray-50 text-xs text-gray-300">
        {filtered.length} {locale === "ar" ? "منتج" : "products"} · ⓘ {locale === "ar" ? "لعرض تفاصيل المعادلة" : "for formula details"}
      </div>
    </div>
  );
}
