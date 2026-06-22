"use client";
/**
 * KpiCardsRow
 * Repository: 075_HOMEPAGE_CONTRACT.md — KPI CARDS
 * "Maximum 8 cards. Cards are Backend driven. No charts."
 *
 * Renders kpiCards directly from API response.
 * Frontend only formats display and controls visibility.
 * No client-side calculation of any kind.
 */

import { cn } from "@/lib/utils";
import type { KpiCard } from "@/services/homepage.service";
import { FormulaMiniInspector } from "@/components/homepage/FormulaMiniInspectorV3";

interface KpiCardsRowProps {
  cards:   KpiCard[];
  locale:  "en" | "ar";
  loading: boolean;
}

const TREND_ICON: Record<string, string> = {
  up:   "↑",
  down: "↓",
  flat: "→",
};

export function KpiCardsRow({ cards, locale, loading }: KpiCardsRowProps) {
  if (loading && cards.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 px-4 py-3 bg-white border-b border-gray-100">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-6 w-24 bg-gray-100 rounded mb-1" />
            <div className="h-3 w-16 bg-gray-50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 divide-x divide-gray-100">
        {cards.map(card => {
          const isPositive = card.value >= 0;
          const isHealthy  = card.unit === "%" ? card.value >= 80 : isPositive;
          const valueColor =
            card.id === "delivery_rate"
              ? card.value >= 85 ? "text-green-600" : "text-red-600"
            : card.id === "true_cpa"
              ? "text-gray-900"
            : card.unit === "EGP" && card.value < 0
              ? "text-red-600"
            : card.unit === "×" && card.value < 1 && card.value > 0
              ? "text-amber-600"
            : "text-gray-900";

          return (
            <div key={card.id} className="px-3 py-3 flex flex-col min-w-0">
              {/* Value + inspector */}
              <div className="flex items-center gap-1 min-w-0">
                <span className={cn("text-base font-bold tabular-nums truncate", valueColor)}>
                  {card.formatted}
                </span>
                <FormulaMiniInspector
                  formulaId={card.formulaId}
                  resultValue={card.formatted}
                  locale={locale}
                  position="left"
                />
              </div>

              {/* Label */}
              <span className="text-xs text-gray-400 mt-0.5 truncate">
                {locale === "ar" ? card.labelAr : card.label}
              </span>

              {/* Trend (when available) */}
              {card.trend != null && (
                <span className={cn(
                  "text-xs mt-0.5 font-medium",
                  card.trend > 0 ? "text-green-500" : card.trend < 0 ? "text-red-500" : "text-gray-400",
                )}>
                  {card.trend > 0 ? "↑" : card.trend < 0 ? "↓" : "→"}
                  {" "}{Math.abs(card.trend).toFixed(1)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
