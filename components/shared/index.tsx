"use client";
/**
 * Shared dashboard components.
 * Repository: 014_DASHBOARD_ARCHITECTURE.md, 055_DECISION_ENGINE.md (Smart Alerts),
 *             Sprint 7 requirements (lifecycle cards, Order+Item toggle, period selector)
 */
import React from "react";

import type {
  SmartAlertProps, LifecycleStatusCard, ViewModeToggleProps,
  PeriodSelectorProps, DashboardPeriod,
} from "@/types/dashboard.types";
import { cn } from "@/lib/utils";

// ── Smart Alert (055: Alert Generation) ──────────────────────────────────

const alertColors = {
  CRITICAL: "bg-red-50 border-red-400 text-red-800",
  HIGH:     "bg-orange-50 border-orange-400 text-orange-800",
  MEDIUM:   "bg-yellow-50 border-yellow-400 text-yellow-800",
  LOW:      "bg-gray-50 border-gray-300 text-gray-700",
};

const alertIcons = { CRITICAL: "🔴", HIGH: "🟠", MEDIUM: "🟡", LOW: "⚪" };

export function SmartAlert({ alertId, priority, title, message, category, scoreRef, kpiRef, createdAt, dismissed, onDismiss, onViewDecision }: SmartAlertProps) {
  if (dismissed) return null;
  return (
    <div className={cn("rounded-lg border-l-4 p-3 flex gap-3 items-start", alertColors[priority])}>
      <span className="text-lg shrink-0">{alertIcons[priority]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold">{title} <span className="font-normal text-gray-500">· {category}</span></p>
        <p className="text-xs mt-0.5">{message}</p>
        <div className="flex gap-2 mt-1.5 flex-wrap">
          {scoreRef && <span className="text-xs rounded bg-white/60 px-1.5 py-0.5 border">{scoreRef}</span>}
          {kpiRef   && <span className="text-xs rounded bg-white/60 px-1.5 py-0.5 border">{kpiRef}</span>}
          <button onClick={onViewDecision} className="text-xs underline underline-offset-2 ml-auto">View decision →</button>
          <button onClick={onDismiss} className="text-xs text-gray-400 hover:text-gray-600">Dismiss</button>
        </div>
      </div>
    </div>
  );
}

// ── Lifecycle status card ─────────────────────────────────────────────────

const lcColors = {
  green: "border-green-300 bg-green-50 text-green-800",
  amber: "border-amber-300 bg-amber-50 text-amber-800",
  red:   "border-red-300 bg-red-50 text-red-800",
  blue:  "border-blue-300 bg-blue-50 text-blue-800",
  gray:  "border-gray-200 bg-gray-50 text-gray-700",
};

interface LifecycleStatusCardProps extends LifecycleStatusCard {
  viewMode: "orders" | "items";
}

export function LifecycleCard({ labelEn, labelAr, bostaMapping, orderCount, itemCount, pctOfShipped, colorClass, viewMode }: LifecycleStatusCardProps) {
  const count = viewMode === "orders" ? orderCount : itemCount;
  const label = viewMode === "orders" ? "orders" : "items";
  return (
    <div className={cn("rounded-lg border-2 p-3 text-center min-w-28", lcColors[colorClass])}>
      <p className="text-xl font-bold tabular-nums">{count}</p>
      <p className="text-xs font-medium">{labelEn}</p>
      <p className="text-xs opacity-70" dir="rtl">{labelAr}</p>
      <p className="text-xs mt-1 opacity-60">{label}</p>
      {pctOfShipped > 0 && (
        <p className="text-xs font-semibold mt-1">{(pctOfShipped * 100).toFixed(0)}%</p>
      )}
      <p className="text-xs opacity-40 mt-1 truncate" title={bostaMapping}>{bostaMapping}</p>
    </div>
  );
}

// ── View mode toggle (Orders ↔ Items) ─────────────────────────────────────

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs font-medium">
      <button
        onClick={() => onChange("orders")}
        className={cn("px-3 py-1.5 transition-colors", mode === "orders" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50")}
      >
        Orders
      </button>
      <button
        onClick={() => onChange("items")}
        className={cn("px-3 py-1.5 transition-colors", mode === "items" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50")}
      >
        Items
      </button>
    </div>
  );
}

// ── Period selector ────────────────────────────────────────────────────────

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "TODAY", label: "Today" },
  { value: "YESTERDAY", label: "Yesterday" },
  { value: "LAST_7_DAYS", label: "7 Days" },
  { value: "LAST_30_DAYS", label: "30 Days" },
  { value: "THIS_MONTH", label: "This Month" },
  { value: "LAST_MONTH", label: "Last Month" },
  { value: "THIS_QUARTER", label: "Quarter" },
  { value: "THIS_YEAR", label: "Year" },
  { value: "CUSTOM", label: "Custom" },
];

export function PeriodSelector({ value, onChange, showProjectedToggle, showProjected, onProjectedToggle }: PeriodSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1">
        {PERIODS.map(p => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border",
              value === p.value
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Realized / Projected toggle (FR-002) */}
      {showProjectedToggle && (
        <label className="flex items-center gap-2 ml-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showProjected}
            onChange={e => onProjectedToggle?.(e.target.checked)}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Show Projected</span>
          <span className="text-xs text-amber-600 font-medium">(not realized)</span>
        </label>
      )}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────

export function SectionHeader({ title, titleAr, action }: { title: string; titleAr?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        {titleAr && <p className="text-xs text-gray-400" dir="rtl">{titleAr}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Cost badge ────────────────────────────────────────────────────────────

export function CostBadge({ label, labelAr, total, perOrder, perItem, viewMode }: {
  label: string; labelAr: string; total: number; perOrder: number; perItem: number;
  viewMode: "orders" | "items";
}) {
  const display = viewMode === "orders" ? perOrder : perItem;
  const perLabel = viewMode === "orders" ? "/order" : "/item";
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 text-center shadow-sm">
      <p className="text-xs font-medium text-gray-600 truncate">{label}</p>
      <p className="text-xs text-gray-400 truncate" dir="rtl">{labelAr}</p>
      <p className="text-lg font-bold text-gray-900 mt-1 tabular-nums">EGP {display.toLocaleString()}</p>
      <p className="text-xs text-gray-400">{perLabel}</p>
      <p className="text-xs text-gray-500 mt-1">Total: EGP {total.toLocaleString()}</p>
    </div>
  );
}

// ── Formula Inspector panel placeholder ───────────────────────────────────

export function FormulaInspectorPanel({ kpiId, isOpen, onClose }: { kpiId?: string; isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-2xl border-l border-gray-200 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold text-gray-800">Formula Inspector</h3>
          <p className="text-xs text-gray-400 font-mono">{kpiId ?? "—"}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-gray-600 text-center mt-8">
          Formula Inspector fetches formula definition from<br />
          <code className="text-xs bg-gray-100 px-1 rounded">/api/v1/formulas/inspect?kpiId={kpiId}</code>
        </p>
        <p className="text-xs text-gray-400 text-center mt-4">
          Full implementation in Formula Engine sprint.
        </p>
      </div>
    </div>
  );
}

// ── Drill-down panel placeholder ──────────────────────────────────────────

export function DrillDownPanel({ title, isOpen, onClose, children }: { title: string; isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
