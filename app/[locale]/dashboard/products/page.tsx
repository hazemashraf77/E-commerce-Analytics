"use client";
/**
 * Product Intelligence page.
 * Repository: 060_PRODUCT_INTELLIGENCE.md — full product KPI table requirement
 * All calculations are pre-computed by the KPI Calculator (formula-engine).
 * Dashboard displays only — zero business calculations here.
 */
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MOCK_PRODUCT_INTELLIGENCE } from "@/modules/formula-engine";
import type { ProductKpiRow } from "@/modules/formula-engine";

const MOCK_STORE_ID = "00000000-0000-0000-0000-000000000001";

type SortKey = keyof ProductKpiRow;

function fmt(n: number | null, decimals = 0, prefix = ""): string {
  if (n === null) return "—";
  return `${prefix}${n.toLocaleString("en-EG", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

function fmtCurrency(n: number | null): string {
  if (n === null) return "—";
  return `EGP ${n.toLocaleString("en-EG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtPct(n: number | null): string {
  if (n === null) return "—";
  return `${n.toFixed(1)}%`;
}

function fmtMultiplier(n: number | null): string {
  if (n === null) return "—";
  return `${n.toFixed(2)}×`;
}

const statusConfig = {
  IN_STOCK:     { label: "In Stock",    cls: "bg-green-100 text-green-800" },
  LOW_STOCK:    { label: "Low Stock",   cls: "bg-amber-100 text-amber-800" },
  OUT_OF_STOCK: { label: "Out",         cls: "bg-red-100 text-red-800" },
  DEAD_STOCK:   { label: "Dead Stock",  cls: "bg-gray-200 text-gray-700" },
};

function ProfitCell({ value, revenue }: { value: number; revenue: number }) {
  const pct = revenue > 0 ? (value / revenue * 100) : 0;
  const cls = value > 0 ? "text-green-700" : "text-red-600";
  return (
    <div>
      <div className={cn("font-semibold tabular-nums text-xs", cls)}>{fmtCurrency(value)}</div>
      <div className="text-xs text-gray-400">{fmtPct(pct)}</div>
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductKpiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("trueProfit");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    fetch(`/api/v1/products/analytics?storeId=${MOCK_STORE_ID}`)
      .then(r => r.json())
      .then(d => { if (d.success) setProducts(d.data); })
      .catch(() => setProducts(MOCK_PRODUCT_INTELLIGENCE))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...products].sort((a, b) => {
    const av = a[sortKey] as number | null ?? 0;
    const bv = b[sortKey] as number | null ?? 0;
    return sortDir === "desc" ? (bv as number) - (av as number) : (av as number) - (bv as number);
  });

  const totalRevenue   = products.reduce((s, p) => s + p.revenue, 0);
  const totalTrueProfit = products.reduce((s, p) => s + p.trueProfit, 0);
  const totalAdSpend   = products.reduce((s, p) => s + p.adSpend, 0);
  const totalDelivered = products.reduce((s, p) => s + p.ordersDelivered, 0);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function Th({ k, label }: { k: SortKey; label: string }) {
    return (
      <th
        onClick={() => toggleSort(k)}
        className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-gray-600 select-none"
      >
        {label}{sortKey === k ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
      </th>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Product Intelligence</h1>
        <p className="text-xs text-gray-400">All values computed by Formula Engine (KPI Calculator). Formulas: FIN-001–004, TRUE-001, MARG-001, MKT-002–013, SHP-001–005, INV-001–005</p>
      </div>

      {/* Executive summary row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: "Total Revenue", value: fmtCurrency(totalRevenue), note: "FIN-001" },
          { label: "True Profit",   value: fmtCurrency(totalTrueProfit), note: "TRUE-001", green: totalTrueProfit > 0 },
          { label: "Total Ad Spend", value: fmtCurrency(totalAdSpend), note: "MKT Spend" },
          { label: "Delivered Orders", value: String(totalDelivered), note: "Lifecycle" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
            <p className="text-xs text-gray-400">{c.label}</p>
            <p className={cn("text-xl font-bold tabular-nums mt-1", c.green ? "text-green-700" : "text-gray-900")}>{c.value}</p>
            <p className="text-xs text-indigo-500 font-mono mt-0.5">{c.note}</p>
          </div>
        ))}
      </div>

      {/* Product table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 sticky left-0 bg-gray-50 z-10">Product</th>
                {/* Lifecycle */}
                <Th k="ordersDelivered" label="Delivered" />
                <Th k="ordersReturned" label="Returned" />
                <Th k="ordersRefused" label="Refused" />
                {/* Financial */}
                <Th k="revenue" label="Revenue" />
                <Th k="cogs" label="COGS" />
                <Th k="packagingCost" label="Pack" />
                <Th k="shippingCost" label="Ship" />
                <Th k="adSpend" label="Ads" />
                <Th k="grossProfit" label="Gross %" />
                <Th k="trueProfit" label="True Profit" />
                {/* Rates */}
                <Th k="deliveryRate" label="Delivery %" />
                {/* Marketing */}
                <Th k="deliveredCpa" label="CPA" />
                <Th k="trueCpa" label="True CPA" />
                <Th k="deliveredRoas" label="ROAS" />
                <Th k="trueRoas" label="True ROAS" />
                <Th k="ppap" label="PPAP" />
                {/* Inventory */}
                <Th k="stockAvailable" label="Stock" />
                <Th k="daysRemaining" label="Days Left" />
                <th className="px-2 py-2 text-xs font-semibold text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr><td colSpan={20} className="text-center py-8 text-gray-400 animate-pulse">Loading product intelligence…</td></tr>
              )}
              {!loading && sorted.map(p => (
                <tr key={p.productId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 sticky left-0 bg-white z-10 border-r border-gray-50">
                    <div className="font-medium text-gray-800 whitespace-nowrap max-w-36 truncate" title={p.productName}>{p.productName}</div>
                    <div className="text-gray-400 font-mono">{p.sku}</div>
                  </td>
                  <td className="px-2 py-2 text-center font-semibold text-green-700">{p.ordersDelivered}</td>
                  <td className="px-2 py-2 text-center text-amber-600">{p.ordersReturned || "—"}</td>
                  <td className="px-2 py-2 text-center text-red-600">{p.ordersRefused || "—"}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{fmtCurrency(p.revenue)}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-gray-500">{fmtCurrency(p.cogs)}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-gray-500">{fmtCurrency(p.packagingCost)}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-gray-500">{fmtCurrency(p.shippingCost)}</td>
                  <td className="px-2 py-2 text-right tabular-nums text-gray-500">{fmtCurrency(p.adSpend)}</td>
                  <td className="px-2 py-2 text-right">
                    <ProfitCell value={p.grossProfit} revenue={p.revenue} />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <ProfitCell value={p.trueProfit} revenue={p.revenue} />
                  </td>
                  <td className="px-2 py-2 text-center">{fmtPct(p.deliveryRate)}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{fmtCurrency(p.deliveredCpa)}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{fmtCurrency(p.trueCpa)}</td>
                  <td className="px-2 py-2 text-center">{fmtMultiplier(p.deliveredRoas)}</td>
                  <td className={cn("px-2 py-2 text-center font-semibold", (p.trueRoas ?? 0) > 1 ? "text-green-700" : "text-red-600")}>
                    {fmtMultiplier(p.trueRoas)}
                  </td>
                  <td className={cn("px-2 py-2 text-center font-semibold", (p.ppap ?? 0) > 1 ? "text-green-700" : "text-red-600")}>
                    {fmt(p.ppap, 2)}
                  </td>
                  <td className="px-2 py-2 text-center tabular-nums">{p.stockAvailable}</td>
                  <td className="px-2 py-2 text-center tabular-nums">
                    {p.daysRemaining !== null ? `${Math.round(p.daysRemaining)}d` : "—"}
                  </td>
                  <td className="px-2 py-2 text-center">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusConfig[p.inventoryStatus].cls)}>
                      {statusConfig[p.inventoryStatus].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
            {sorted.length} products · All values computed by Formula Engine · Click column headers to sort
          </div>
        )}
      </div>
    </div>
  );
}
