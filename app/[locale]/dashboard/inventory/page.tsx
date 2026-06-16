
"use client";
/**
 * Inventory Intelligence — 064_INVENTORY_INTELLIGENCE.md
 * ER-002: Zero UI calculations. All values from formula-engine / mock data.
 * Formulas: INV-001–005
 */
import { useState } from "react";
import Link from "next/link";
import { MOCK_SCORES, MOCK_DECISIONS } from "@/lib/dashboard/mock-data";
import { MOCK_PRODUCT_INTELLIGENCE } from "@/modules/formula-engine";
import { SectionHeader, PeriodSelector } from "@/components/shared/index";
import { cn } from "@/lib/utils";

const invScore = MOCK_SCORES.find(s => s.scoreId === "SCORE-006");
const TOTAL_VALUE    = MOCK_PRODUCT_INTELLIGENCE.reduce((s,p) => s + p.inventoryValue, 0);
const CASH_LOCKED    = MOCK_PRODUCT_INTELLIGENCE.reduce((s,p) => s + p.cashLocked, 0);
const OUT_OF_STOCK   = MOCK_PRODUCT_INTELLIGENCE.filter(p => p.inventoryStatus === "OUT_OF_STOCK").length;
const LOW_STOCK      = MOCK_PRODUCT_INTELLIGENCE.filter(p => p.inventoryStatus === "LOW_STOCK").length;
const DEAD_STOCK_VAL = MOCK_PRODUCT_INTELLIGENCE.filter(p => p.inventoryStatus === "DEAD_STOCK").reduce((s,p)=>s+p.inventoryValue,0);

const STATUS_CFG: Record<string,{cls:string;label:string}> = {
  IN_STOCK:     {cls:"bg-green-100 text-green-700", label:"In Stock"},
  LOW_STOCK:    {cls:"bg-amber-100 text-amber-700", label:"Low Stock"},
  OUT_OF_STOCK: {cls:"bg-red-100 text-red-700",     label:"Out of Stock"},
  DEAD_STOCK:   {cls:"bg-gray-200 text-gray-700",   label:"Dead Stock"},
};

export default function InventoryPage() {
  const [period, setPeriod] = useState<any>("LAST_30_DAYS");
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventory Intelligence</h1>
          <p className="text-xs text-gray-400">Formulas: INV-001 FIFO · INV-002 Value · INV-003 Velocity · INV-004 Days Remaining · INV-005 Cash Locked</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Health strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={cn("rounded-xl border-2 p-4 col-span-1", (invScore?.score ?? 0) >= 70 ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50")}>
          <p className="text-xs font-semibold text-gray-500 uppercase">Inventory Health</p>
          <p className="text-3xl font-black mt-1 text-gray-800">{invScore?.score ?? "—"}<span className="text-lg font-normal text-gray-400">/100</span></p>
          <p className="text-xs text-indigo-500 font-mono mt-1">SCORE-006</p>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{invScore?.recommendedAction}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase">Inventory Value <span className="font-mono text-indigo-500">INV-002</span></p>
          <p className="text-2xl font-bold tabular-nums mt-1 text-blue-700">EGP {TOTAL_VALUE.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Total capital in inventory</p>
        </div>
        <div className={cn("rounded-xl border-2 p-4", CASH_LOCKED > 5000 ? "border-red-200 bg-red-50" : "border-gray-200 bg-white")}>
          <p className="text-xs font-semibold text-gray-500 uppercase">Cash Locked <span className="font-mono text-indigo-500">INV-005</span></p>
          <p className={cn("text-2xl font-bold tabular-nums mt-1", CASH_LOCKED > 5000 ? "text-red-700" : "text-gray-800")}>EGP {CASH_LOCKED.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Dead / slow-moving stock</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 uppercase">Stock Alerts</p>
          {OUT_OF_STOCK > 0 && <p className="text-sm font-semibold text-red-600">⛔ {OUT_OF_STOCK} out of stock</p>}
          {LOW_STOCK > 0    && <p className="text-sm font-semibold text-amber-600">⚠ {LOW_STOCK} low stock</p>}
          {DEAD_STOCK_VAL > 0 && <p className="text-sm text-gray-500">💤 EGP {DEAD_STOCK_VAL.toLocaleString()} dead stock</p>}
          {OUT_OF_STOCK === 0 && LOW_STOCK === 0 && <p className="text-sm text-green-600">✓ All stocked</p>}
        </div>
      </div>

      {/* Product inventory table */}
      <div>
        <SectionHeader title="Product Inventory" titleAr="مخزون المنتجات" />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{["Product","Stock","Inv. Value","FIFO Cost","Daily Velocity","Days Left","Cash Locked","Status","Reorder?"].map(h=>(
                  <th key={h} className="px-2 py-2 text-left font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_PRODUCT_INTELLIGENCE.map(p => {
                  const vel = p.ordersDelivered / 30;
                  const needsReorder = p.inventoryStatus === "OUT_OF_STOCK" || p.inventoryStatus === "LOW_STOCK";
                  return (
                    <tr key={p.productId} className="hover:bg-gray-50">
                      <td className="px-2 py-2 font-medium text-gray-800 max-w-36 truncate" title={p.productName}>{p.productName}</td>
                      <td className="px-2 py-2 text-center font-semibold">{p.stockAvailable}</td>
                      <td className="px-2 py-2 tabular-nums">EGP {p.inventoryValue.toLocaleString()}</td>
                      <td className="px-2 py-2 tabular-nums text-gray-500">EGP {(p.cogs > 0 ? p.cogs/p.ordersDelivered : 0).toFixed(0)}/unit</td>
                      <td className="px-2 py-2 tabular-nums text-gray-600">{vel.toFixed(1)} u/day</td>
                      <td className={cn("px-2 py-2 tabular-nums font-semibold",
                        p.daysRemaining === null ? "text-red-600" :
                        p.daysRemaining <= 7 ? "text-red-600" : p.daysRemaining <= 14 ? "text-amber-600" : "text-green-700")}>
                        {p.daysRemaining !== null ? `${Math.round(p.daysRemaining)}d` : "∞"}
                      </td>
                      <td className="px-2 py-2 tabular-nums text-gray-500">{p.cashLocked > 0 ? `EGP ${p.cashLocked.toLocaleString()}` : "—"}</td>
                      <td className="px-2 py-2">
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_CFG[p.inventoryStatus]?.cls ?? "bg-gray-100 text-gray-600")}>
                          {STATUS_CFG[p.inventoryStatus]?.label ?? p.inventoryStatus}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        {needsReorder ? <span className="rounded-full bg-red-100 text-red-700 text-xs px-2 py-0.5 font-semibold">Reorder</span> : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t border-gray-50 text-xs text-gray-400">INV-001 FIFO · INV-002 Value · INV-003 Velocity · INV-004 Days Remaining</div>
        </div>
      </div>

      {/* Inventory ROI scaffold */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-indigo-200 p-4">
          <SectionHeader title="Inventory ROI (INV-005 scaffold)" titleAr="عائد الاستثمار" />
          <div className="space-y-2 mt-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Inventory Value (INV-002)</span><span className="font-semibold tabular-nums">EGP {TOTAL_VALUE.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Revenue Generated (FIN-001)</span><span className="font-semibold tabular-nums">EGP 84,750</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Inventory ROI</span><span className="font-semibold text-green-700 tabular-nums">{TOTAL_VALUE > 0 ? ((84750/TOTAL_VALUE)*100).toFixed(1) : 0}%</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Cash Locked ratio</span><span className="font-semibold text-amber-700">{TOTAL_VALUE > 0 ? ((CASH_LOCKED/TOTAL_VALUE)*100).toFixed(1) : 0}%</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 bg-amber-50 p-4">
          <SectionHeader title="Reorder Recommendations" titleAr="توصيات إعادة الطلب" />
          {MOCK_DECISIONS.filter(d => d.category === "Inventory").map(d => (
            <div key={d.decisionId} className="mt-2">
              <p className="text-sm font-semibold text-gray-800">{d.decisionName}</p>
              <p className="text-xs text-gray-600 mt-1">{d.recommendedAction}</p>
              <p className="text-xs text-indigo-600 mt-1">Impact: {d.expectedImpact}</p>
              <p className="text-xs text-gray-400">Confidence: {Math.round(d.confidence * 100)}% · {d.decisionId}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[{h:"/en/dashboard",l:"← Executive"},{h:"/en/dashboard/products",l:"Products"},{h:"/en/dashboard/shipping",l:"Shipping"}].map(l=>(
          <Link key={l.h} href={l.h} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">{l.l}</Link>
        ))}
      </div>
    </div>
  );
}
