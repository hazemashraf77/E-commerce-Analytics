"use client";
/**
 * ProfitLeakageWidget — Sprint 7.1 refinement 2.
 * Shows all cost categories consuming profit, with Orders/Items/Per Order/Per Item.
 * ER-002: Renders Analytics Engine outputs only. No calculation.
 */
import type { ProfitLeakageItem } from "@/lib/dashboard/mock-data";
// Rows rendered in the order received from backend (sorted DESC by totalCost by Analytics Engine — UI Polish 2)
import { cn } from "@/lib/utils";

const severityConfig = {
  high:   { bar: "bg-red-500",    badge: "bg-red-100 text-red-700" },
  medium: { bar: "bg-orange-400", badge: "bg-orange-100 text-orange-700" },
  low:    { bar: "bg-yellow-300", badge: "bg-yellow-100 text-yellow-700" },
} as const;

interface Props {
  items: ProfitLeakageItem[];
  viewMode: "orders" | "items";
}

export function ProfitLeakageWidget({ items, viewMode }: Props) {
  const totalLeakage = items.reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-1">
      {/* Total summary */}
      <div className="flex items-center justify-between rounded-lg bg-red-50 border border-red-200 px-3 py-2 mb-3">
        <span className="text-sm font-semibold text-red-700">Total Costs</span>
        <span className="text-sm font-bold text-red-900 tabular-nums">
          EGP {totalLeakage.toLocaleString()}
        </span>
        <span className="text-xs text-red-600">
          {/* pctOfRevenue is pre-computed by Analytics Engine per item — sum displayed here */}
          {items.reduce((s, i) => s + i.pctOfRevenue, 0).toFixed(1)}% of revenue
        </span>
      </div>

      {/* Column header */}
      <div className="grid grid-cols-12 gap-1 px-1 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
        <span className="col-span-3">Cost</span>
        <span className="col-span-3 text-right">Total</span>
        <span className="col-span-2 text-right">/ Order</span>
        <span className="col-span-2 text-right">/ Item</span>
        <span className="col-span-2 text-right">% Rev</span>
      </div>

      {items.map((item) => {
        const cfg = severityConfig[item.severity];
        const barWidth = item.pctOfRevenue; // pre-computed by Analytics Engine (ER-002)
        const activeVal = viewMode === "orders" ? item.perOrder : item.perItem;

        return (
          <div key={item.key} className="group rounded-lg border border-gray-100 bg-white hover:bg-gray-50 p-2 cursor-pointer transition-colors">
            <div className="grid grid-cols-12 gap-1 items-center text-sm">
              <div className="col-span-3">
                <span className={cn("rounded-full px-1.5 py-0.5 text-xs font-medium", cfg.badge)}>
                  {item.label}
                </span>
                <p className="text-xs text-gray-400 mt-0.5" dir="rtl">{item.labelAr}</p>
              </div>
              <span className="col-span-3 text-right tabular-nums font-semibold text-gray-800">
                EGP {item.total.toLocaleString()}
              </span>
              <span className={cn("col-span-2 text-right tabular-nums text-xs", viewMode === "orders" ? "font-bold text-gray-800" : "text-gray-500")}>
                EGP {item.perOrder}
              </span>
              <span className={cn("col-span-2 text-right tabular-nums text-xs", viewMode === "items" ? "font-bold text-gray-800" : "text-gray-500")}>
                EGP {item.perItem}
              </span>
              <span className="col-span-2 text-right text-xs text-gray-500">
                {item.pctOfRevenue.toFixed(1)}%
              </span>
            </div>

            {/* Proportion bar */}
            <div className="mt-1.5 h-1 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", cfg.bar)}
                style={{ width: `${barWidth.toFixed(1)}%` }}
              />
            </div>

            <p className="text-xs text-gray-400 mt-0.5 group-hover:text-gray-600">
              Active: EGP {activeVal} per {viewMode === "orders" ? "order" : "item"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
