"use client";
/**
 * SmartFiltersBar
 * Repository: 075_HOMEPAGE_CONTRACT.md — SMART FILTERS
 * "Dynamic. Live counts. Selecting a filter updates Products Table immediately."
 *
 * Receives filter counts from API (no client-side counting).
 * Never duplicates backend logic.
 */

import { cn } from "@/lib/utils";
import type { SmartFilterCount } from "@/services/homepage.service";
import type { HomepageFilter } from "@/hooks/useHomepageData";

interface SmartFiltersBarProps {
  filters:       SmartFilterCount[];
  activeFilter:  HomepageFilter;
  onFilter:      (key: HomepageFilter) => void;
  locale:        "en" | "ar";
  loading:       boolean;
}

// Arabic labels — full translation per 075 "Arabic mode must be 100% Arabic"
const AR_LABELS: Record<string, string> = {
  all:           "الكل",
  profitable:    "رابحة",
  loss_making:   "خاسرة",
  high_cpa:      "تكلفة عالية",
  low_roas:      "عائد منخفض",
  opportunity:   "فرصة",
  high_returns:  "إرجاعات عالية",
  low_delivery:  "تسليم منخفض",
  low_stock:     "مخزون منخفض",
  dead_stock:    "مخزون راكد",
  slow_moving:   "بطيء الحركة",
  fast_moving:   "سريع الحركة",
  needs_review:  "يحتاج مراجعة",
  profit_leak:   "تسرب ربح",
  inventory_risk:"خطر مخزون",
};

export function SmartFiltersBar({
  filters, activeFilter, onFilter, locale, loading,
}: SmartFiltersBarProps) {
  if (loading && filters.length === 0) {
    // Skeleton
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-7 w-20 rounded-full bg-gray-100 animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 flex-nowrap scrollbar-hide">
      {filters.map(f => {
        const isActive = f.key === activeFilter;
        const label = locale === "ar" ? (AR_LABELS[f.key] ?? f.label) : f.label;
        const hasCount = f.count > 0 || f.key === "all";

        return (
          <button
            key={f.key}
            onClick={() => onFilter(f.key as HomepageFilter)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors border",
              isActive
                ? "bg-gray-900 text-white border-gray-900"
                : hasCount
                  ? "border-gray-200 text-gray-600 bg-white hover:border-gray-400 hover:text-gray-900"
                  : "border-gray-100 text-gray-300 bg-white cursor-default",
            )}
            disabled={!hasCount && !isActive}
            aria-pressed={isActive}
          >
            {label}
            {f.key !== "all" && (
              <span className={cn("ml-1 font-mono", isActive ? "opacity-70" : "text-gray-400")}>
                ({f.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
