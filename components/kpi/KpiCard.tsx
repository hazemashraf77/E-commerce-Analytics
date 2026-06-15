"use client";
/**
 * KpiCard component.
 * Repository: 014_DASHBOARD_ARCHITECTURE.md — "Dashboard never calculates"
 *             043_UI_COMPONENT_LIBRARY.md — card pattern
 * ER-002: Displays API-provided values ONLY. Zero calculation.
 * Every card exposes Formula Inspector (007) and drill-down (014).
 */

import type { KpiCardProps, ViewMode } from "@/types/dashboard.types";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  excellent: "border-green-500 bg-green-50",
  good:      "border-green-300 bg-white",
  warning:   "border-amber-400 bg-amber-50",
  critical:  "border-red-500 bg-red-50",
};

const trendIcons: Record<string, string> = { up: "↑", down: "↓", flat: "→" };
const trendColors: Record<string, string> = {
  up: "text-green-600", down: "text-red-600", flat: "text-gray-500",
};
const dirColors: Record<string, string> = {
  up: "text-green-600", down: "text-red-600", flat: "text-gray-400",
};

interface KpiCardWithModeProps extends KpiCardProps {
  viewMode?: ViewMode;
}

export function KpiCard({
  kpiId, title, titleAr, value, valueDual, delta, trend, status,
  loading, footnote, onInspect, onDrillDown, viewMode = "orders",
}: KpiCardWithModeProps) {
  const borderClass = status ? statusColors[status] ?? "border-gray-200 bg-white" : "border-gray-200 bg-white";
  const displayLabel = valueDual
    ? viewMode === "orders" ? "per order" : "per item"
    : undefined;

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 p-4 shadow-sm transition-shadow",
        borderClass,
        "hover:shadow-md cursor-pointer",
      )}
      onClick={onDrillDown}
      role="button"
      aria-label={`${title} — click for detail`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{title}</p>
          <p className="text-xs text-gray-400 truncate" dir="rtl">{titleAr}</p>
        </div>

        {/* Formula Inspector button — always visible (007: every KPI card) */}
        <button
          onClick={(e) => { e.stopPropagation(); onInspect?.(); }}
          className="rounded px-1.5 py-0.5 text-xs font-mono text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shrink-0"
          title={`Formula Inspector — ${kpiId}`}
          aria-label="Open Formula Inspector"
        >
          ƒ
        </button>
      </div>

      {/* Primary value */}
      <div className="mt-2">
        {loading ? (
          <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900 tabular-nums">{value}</span>
          </div>
        )}
      </div>

      {/* Dual-dimension inline grid — always visible (refinement 5) */}
      {valueDual && !loading && (
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 rounded-lg bg-gray-50 border border-gray-100 px-2 py-1.5 text-xs">
          <span className="text-gray-400">Orders</span>
          <span className="text-right font-semibold text-gray-700 tabular-nums">{valueDual.orderCount.toLocaleString()}</span>
          <span className="text-gray-400">Items</span>
          <span className="text-right font-semibold text-gray-700 tabular-nums">{valueDual.itemCount.toLocaleString()}</span>
          <span className={cn("text-gray-400", viewMode === "orders" ? "font-semibold text-indigo-600" : "")}>/ Order</span>
          <span className={cn("text-right tabular-nums", viewMode === "orders" ? "font-bold text-indigo-700" : "font-medium text-gray-700")}>{valueDual.perOrder}</span>
          <span className={cn("text-gray-400", viewMode === "items" ? "font-semibold text-indigo-600" : "")}>/ Item</span>
          <span className={cn("text-right tabular-nums", viewMode === "items" ? "font-bold text-indigo-700" : "font-medium text-gray-700")}>{valueDual.perItem}</span>
          <span className="text-gray-400">Total</span>
          <span className="text-right font-bold text-gray-800 tabular-nums">{valueDual.total}</span>
        </div>
      )}

      {/* Delta */}
      {delta && !loading && (
        <div className="mt-2 flex items-center gap-1">
          <span className={cn("text-sm font-medium", dirColors[delta.direction])}>
            {trendIcons[delta.direction]} {delta.value}
          </span>
          <span className="text-xs text-gray-400">{delta.label}</span>
        </div>
      )}

      {/* Trend indicator */}
      {trend && !loading && (
        <div className={cn("absolute top-2 right-10 text-xs font-bold", trendColors[trend])}>
          {trendIcons[trend]}
        </div>
      )}

      {/* Footnote (e.g. "Realized only", "Cash, not profit") */}
      {footnote && (
        <p className="mt-2 text-xs text-gray-400 italic border-t border-gray-100 pt-1">{footnote}</p>
      )}

      {/* Drill-down hint */}
      <div className="absolute bottom-2 right-3 text-xs text-gray-300">→</div>
    </div>
  );
}
