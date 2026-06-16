"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { HomepageState, DimMode, Terms } from "./locale";

interface TopBarProps {
  state: HomepageState;
  t: Terms;
  isRtl: boolean;
  onLocaleSwitch: () => void;
  onPeriod: (p: string) => void;
  onCustomFrom: (v: string) => void;
  onCustomTo: (v: string) => void;
  onProjected: () => void;
  onDim: (d: DimMode) => void;
  onSearch: (v: string) => void;
  onSync: () => void;
  syncStatus: "ok" | "failed" | "syncing";
}

const QUICK_PERIODS = [
  { key: "TODAY", labelKey: "today" as const },
  { key: "LAST_7_DAYS", labelKey: "last7" as const },
  { key: "LAST_30_DAYS", labelKey: "last30" as const },
  { key: "THIS_MONTH", labelKey: "thisMonth" as const },
  { key: "LAST_MONTH", labelKey: "lastMonth" as const },
  { key: "CUSTOM", labelKey: "custom" as const },
] as const;

const SOURCES_CONFIG = [
  { key: "easyOrders" as const, status: "ok" },
  { key: "bosta" as const,      status: "ok" },
  { key: "meta" as const,       status: "warn" },
  { key: "tiktok" as const,     status: "ok" },
] as const;

export function HomepageTopBar({ state, t, isRtl, onLocaleSwitch, onPeriod, onCustomFrom, onCustomTo, onProjected, onDim, onSearch, onSync, syncStatus }: TopBarProps) {
  const { period, customFrom, customTo, showProjected, dimMode, search } = state;

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      {/* Row 1: Title + lang + period + sync */}
      <div className="flex items-center gap-3 px-4 py-2 flex-wrap border-b border-gray-50">
        <span className="text-sm font-bold text-gray-900 shrink-0">{t.pageTitle}</span>

        {/* Language switch */}
        <button onClick={onLocaleSwitch}
          className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50 shrink-0">
          {t.langSwitch}
        </button>

        {/* Quick period buttons */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden shrink-0">
          {QUICK_PERIODS.map(({ key, labelKey }) => (
            <button key={key} onClick={() => onPeriod(key)}
              className={cn("px-2.5 py-1 text-xs font-medium transition-colors border-r border-gray-200 last:border-0",
                period === key ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50")}>
              {t[labelKey]}
            </button>
          ))}
        </div>

        {/* Custom range */}
        {period === "CUSTOM" && (
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-gray-400">{t.from}</span>
            <input type="date" value={customFrom} onChange={e => onCustomFrom(e.target.value)}
              className="rounded border border-gray-200 px-1.5 py-1 text-xs" />
            <span className="text-xs text-gray-400">{t.to}</span>
            <input type="date" value={customTo} onChange={e => onCustomTo(e.target.value)}
              className="rounded border border-gray-200 px-1.5 py-1 text-xs" />
          </div>
        )}

        <div className="flex-1" />

        {/* Source badges */}
        {SOURCES_CONFIG.map(s => (
          <div key={s.key} className="flex items-center gap-1 shrink-0">
            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0",
              s.status === "ok" ? "bg-green-500" : s.status === "warn" ? "bg-amber-400" : "bg-red-500")} />
            <span className="text-xs text-gray-400">{t.sources[s.key]}</span>
          </div>
        ))}

        {/* Sync */}
        <div className="flex items-center gap-2 shrink-0">
          {syncStatus === "failed" && (
            <span className="text-xs text-amber-600">{t.syncFailed}</span>
          )}
          {syncStatus === "ok" && (
            <span className="text-xs text-gray-400">{t.lastSync}: 2 min ago</span>
          )}
          {syncStatus === "syncing" && (
            <span className="text-xs text-indigo-600 animate-pulse">Syncing…</span>
          )}
          <button onClick={onSync}
            className="rounded-lg bg-gray-900 text-white px-3 py-1 text-xs font-semibold hover:bg-gray-700 shrink-0">
            {t.syncNow}
          </button>
        </div>
      </div>

      {/* Row 2: Actual/Projected + Total/Order/Item + Search */}
      <div className="flex items-center gap-3 px-4 py-1.5 flex-wrap">
        {/* Actual / Projected */}
        <div className="relative group shrink-0">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => !showProjected || onProjected()}
              className={cn("px-2.5 py-1 text-xs font-medium transition-colors",
                !showProjected ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50")}>
              {t.actual}
            </button>
            <button onClick={() => showProjected || onProjected()}
              className={cn("px-2.5 py-1 text-xs font-medium transition-colors border-l border-gray-200",
                showProjected ? "bg-amber-500 text-white" : "text-gray-500 hover:bg-gray-50")}>
              {t.projected}
            </button>
          </div>
          <div className="absolute top-7 left-0 z-50 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
            <p><strong>{t.actual}:</strong> {t.actualTip}</p>
            <p className="mt-1"><strong>{t.projected}:</strong> {t.projectedTip}</p>
          </div>
        </div>

        {/* Total / Order / Item */}
        <div className="relative group shrink-0">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {([["total", t.total], ["perOrder", t.perOrder], ["perItem", t.perItem]] as [DimMode, string][]).map(([k, label]) => (
              <button key={k} onClick={() => onDim(k)}
                className={cn("px-2.5 py-1 text-xs font-medium transition-colors border-l border-gray-200 first:border-0",
                  dimMode === k ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50")}>
                {label}
              </button>
            ))}
          </div>
          <div className="absolute top-7 left-0 z-50 hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
            <p><strong>{t.total}:</strong> {t.totalTip}</p>
            <p className="mt-1"><strong>{t.perOrder}:</strong> {t.perOrderTip}</p>
            <p className="mt-1"><strong>{t.perItem}:</strong> {t.perItemTip}</p>
          </div>
        </div>

        {/* Search */}
        <input value={search} onChange={e => onSearch(e.target.value)}
          placeholder={t.search}
          className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs w-40 focus:outline-none focus:ring-1 focus:ring-gray-300" />
      </div>
    </div>
  );
}
