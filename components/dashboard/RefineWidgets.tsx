"use client";
/**
 * Sprint 7.1 widgets: PendingMoneyWidget, SettlementTimeline,
 * InventoryCapacityWidget, ExecutiveHealthStrip.
 * ER-002 / FR-004: Cash clearly separated from profit. Zero calculations.
 */
import type {
  PendingMoneyItem,
  SettlementTimelineEntry,
} from "@/lib/dashboard/mock-data";
import type { ScoreGrade } from "@/types/dashboard.types";
import { cn } from "@/lib/utils";

// ── Pending Money (refinement 3) ──────────────────────────────────────────

const moneyConfig: Record<string, { bg: string; border: string; icon: string }> = {
  realized: { bg: "bg-green-50",  border: "border-green-400", icon: "✓" },
  pending:  { bg: "bg-blue-50",   border: "border-blue-400",  icon: "⏳" },
  expected: { bg: "bg-yellow-50", border: "border-yellow-400",icon: "◷" },
  lost:     { bg: "bg-red-50",    border: "border-red-400",   icon: "✗" },
};

interface PendingMoneyProps {
  items: PendingMoneyItem[];
  onDrillDown?: (key: string) => void;
}

export function PendingMoneyWidget({ items, onDrillDown }: PendingMoneyProps) {
  const total = items.reduce((s, i) => s + (i.key !== "lost" ? i.amount : 0), 0);

  return (
    <div className="space-y-3">
      {/* FR-004 notice */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 font-medium">
        ⚠️ Cash Flow is independent from Profit (FR-004). These values represent money movement, not financial performance.
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item) => {
          const cfg = moneyConfig[item.key] ?? moneyConfig["pending"]!;
          return (
            <div
              key={item.key}
              className={cn("rounded-xl border-2 p-4 cursor-pointer hover:shadow-md transition-shadow", cfg.bg, cfg.border)}
              onClick={() => onDrillDown?.(item.key)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5" dir="rtl">{item.labelAr}</p>
                </div>
                <span className="text-lg">{cfg.icon}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2 tabular-nums">
                EGP {item.amount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1 italic">{item.note}</p>
              {!item.isRealized && (
                <p className="text-xs text-amber-600 mt-1 font-medium">Not yet realized</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 flex justify-between text-sm">
        <span className="text-gray-600 font-medium">Net Cash Position</span>
        <span className="font-bold text-gray-900 tabular-nums">EGP {total.toLocaleString()}</span>
        <span className="text-xs text-gray-400 self-center">(Realized + Pending + Expected − Lost)</span>
      </div>
    </div>
  );
}

// ── Settlement Timeline visual (refinement 4) ─────────────────────────────

const horizonColors: Record<string, string> = {
  today:     "border-green-400  bg-green-50",
  tomorrow:  "border-blue-400   bg-blue-50",
  next3days: "border-indigo-400 bg-indigo-50",
  next7days: "border-purple-400 bg-purple-50",
  future:    "border-gray-300   bg-gray-50",
};

const statusBadge: Record<string, string> = {
  EXPECTED:    "bg-yellow-100 text-yellow-700",
  RECEIVED:    "bg-green-100  text-green-700",
  RECONCILED:  "bg-blue-100   text-blue-700",
  DISPUTED:    "bg-red-100    text-red-700",
};

interface SettlementTimelineProps {
  entries: SettlementTimelineEntry[];
  onSelect?: (id: string) => void;
}

export function SettlementTimeline({ entries, onSelect }: SettlementTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gray-200 z-0" />

      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              "relative flex gap-4 rounded-xl border-2 p-3 cursor-pointer hover:shadow-md transition-shadow z-10 ml-2",
              horizonColors[entry.horizon] ?? "border-gray-300 bg-gray-50",
            )}
            onClick={() => onSelect?.(entry.id)}
          >
            {/* Timeline dot */}
            <div className="absolute -left-3 top-4 w-3.5 h-3.5 rounded-full bg-white border-2 border-current" />

            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 items-center">
              <div>
                <p className="text-xs font-bold text-gray-700">{entry.horizonLabel}</p>
                <p className="text-xs text-gray-400">{entry.expectedDate}</p>
                <p className="text-xs text-gray-400 mt-0.5">{entry.shipmentsCount} shipments</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expected</p>
                <p className="text-sm font-bold text-gray-900 tabular-nums">
                  EGP {entry.expectedAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Actual</p>
                <p className={cn("text-sm font-bold tabular-nums", entry.actualAmount > 0 ? "text-green-700" : "text-gray-400")}>
                  {entry.actualAmount > 0 ? `EGP ${entry.actualAmount.toLocaleString()}` : "—"}
                </p>
              </div>
              <div className="flex items-center justify-end">
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusBadge[entry.status])}>
                  {entry.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total row */}
      <div className="mt-3 rounded-lg bg-gray-100 border border-gray-300 px-4 py-2 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">Total Expected</span>
        <span className="text-sm font-bold text-gray-900 tabular-nums">
          EGP {entries.reduce((s, e) => s + e.expectedAmount, 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

// ── Inventory Capacity (refinement 8) ─────────────────────────────────────

interface InventoryCapacityData {
  currentUnits: number;
  avgUnitsPerOrder: number;
  estimatedOrderCapacity: number;
  lowStockProducts: number;
  outOfStockProducts: number;
}

interface InventoryCapacityProps {
  data: InventoryCapacityData;
  onDrillDown?: () => void;
}

export function InventoryCapacityWidget({ data, onDrillDown }: InventoryCapacityProps) {
  const capacityPct = Math.min((data.estimatedOrderCapacity / 1500) * 100, 100); // 1500 = mock target capacity

  return (
    <div
      className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onDrillDown}
    >
      <h3 className="text-sm font-semibold text-indigo-800 mb-3">Inventory Capacity</h3>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-900 tabular-nums">
            {data.currentUnits.toLocaleString()}
          </p>
          <p className="text-xs text-indigo-600">Current Units</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-900 tabular-nums">
            {data.avgUnitsPerOrder.toFixed(2)}
          </p>
          <p className="text-xs text-indigo-600">Avg Units / Order</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-700 tabular-nums">
            ~{data.estimatedOrderCapacity.toLocaleString()}
          </p>
          <p className="text-xs text-indigo-600">Est. Order Capacity</p>
        </div>
      </div>

      {/* Capacity bar */}
      <div className="h-3 w-full rounded-full bg-indigo-200 overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{ width: `${capacityPct.toFixed(1)}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-indigo-600">
        <span>{data.lowStockProducts} low stock</span>
        <span>{data.outOfStockProducts} out of stock</span>
        <span>{capacityPct.toFixed(0)}% capacity</span>
      </div>
    </div>
  );
}

// ── Executive Health Strip (refinement 7) ─────────────────────────────────

interface HealthStripItem {
  scoreId: string;
  label: string;
  labelAr: string;
  score: number;
  grade: ScoreGrade;
}

const gradeBar: Record<ScoreGrade, string> = {
  excellent:   "bg-green-500",
  "very-good": "bg-green-400",
  good:        "bg-yellow-400",
  average:     "bg-orange-400",
  poor:        "bg-orange-500",
  critical:    "bg-red-600",
};

const gradeBadge: Record<ScoreGrade, string> = {
  excellent:   "bg-green-100  text-green-800",
  "very-good": "bg-green-50   text-green-700",
  good:        "bg-yellow-100 text-yellow-800",
  average:     "bg-orange-100 text-orange-800",
  poor:        "bg-orange-200 text-orange-900",
  critical:    "bg-red-100    text-red-800",
};

interface ExecutiveHealthStripProps {
  items: HealthStripItem[];
  onItemClick?: (scoreId: string) => void;
}

export function ExecutiveHealthStrip({ items, onItemClick }: ExecutiveHealthStripProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        Business Health Overview — Score Engine outputs (054_SCORE_CATALOG)
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => (
          <div
            key={item.scoreId}
            className={cn(
              "shrink-0 rounded-lg border px-3 py-2 min-w-28 cursor-pointer hover:shadow-md transition-shadow text-center",
              gradeBadge[item.grade],
            )}
            onClick={() => onItemClick?.(item.scoreId)}
          >
            <p className="text-xs font-medium truncate">{item.label}</p>
            <p className="text-xs opacity-60 truncate" dir="rtl">{item.labelAr}</p>
            <p className="text-2xl font-bold mt-1 tabular-nums">{item.score}</p>
            {/* Mini bar */}
            <div className="h-1.5 w-full rounded-full bg-black/10 mt-1 overflow-hidden">
              <div
                className={cn("h-full rounded-full", gradeBar[item.grade])}
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
