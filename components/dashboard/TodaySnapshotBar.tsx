"use client";
/**
 * TodaySnapshotBar — UI Polish 5 (Sprint 8).
 * Displays today's key metrics from Analytics / Financial Engine outputs.
 * Cash and Profit remain visually separated (FR-004).
 * ER-002: Zero calculation. All values pre-computed by Analytics Engine.
 */
import type { TodaySnapshot } from "@/lib/dashboard/mock-data";
import { cn } from "@/lib/utils";

interface Props {
  snapshot: TodaySnapshot;
  loading?: boolean;
}

export function TodaySnapshotBar({ snapshot, loading }: Props) {
  const metrics: Array<{ key: string; label: string; labelAr: string; value: string | number; isCash?: boolean; isProfit?: boolean; hint?: string }> = [
    { key: "revenue",    label: "Revenue Today",   labelAr: "الإيرادات اليوم",    value: `EGP ${snapshot.revenueToday.toLocaleString()}` },
    { key: "orders",     label: "Orders Today",    labelAr: "طلبات اليوم",        value: snapshot.ordersToday },
    { key: "items",      label: "Items Today",     labelAr: "وحدات اليوم",        value: snapshot.itemsToday },
    { key: "delivered",  label: "Delivered Today", labelAr: "مسلّم اليوم",        value: snapshot.deliveredToday },
    { key: "profit",     label: "Profit Today",    labelAr: "ربح اليوم",          value: `EGP ${snapshot.profitToday.toLocaleString()}`, isProfit: true, hint: "Net Profit — FIN-002" },
    { key: "ads",        label: "Ads Spend",       labelAr: "إنفاق إعلاني",       value: `EGP ${snapshot.adsSpendToday.toLocaleString()}` },
    { key: "cash",       label: "Cash Received",   labelAr: "نقد مستلم",          value: `EGP ${snapshot.cashReceivedToday.toLocaleString()}`, isCash: true, hint: "Cash, not profit (FR-004)" },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
        Today's Snapshot — {new Date().toLocaleDateString("en-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </div>
      <div className="flex overflow-x-auto">
        {metrics.map((m, i) => (
          <div
            key={m.key}
            className={cn(
              "flex-1 min-w-24 px-4 py-3 border-r border-gray-100 last:border-r-0",
              m.isProfit ? "bg-green-50"  : "",
              m.isCash   ? "bg-amber-50"  : "",
              loading    ? "animate-pulse" : "",
            )}
          >
            <p className="text-xs text-gray-400 truncate">{m.label}</p>
            <p className="text-xs text-gray-300 truncate" dir="rtl">{m.labelAr}</p>
            {loading ? (
              <div className="h-5 w-16 bg-gray-200 rounded mt-1" />
            ) : (
              <p className={cn(
                "text-lg font-bold tabular-nums mt-0.5",
                m.isProfit ? "text-green-700" : "",
                m.isCash   ? "text-amber-700" : "text-gray-900",
              )}>
                {m.value}
              </p>
            )}
            {m.hint && (
              <p className={cn("text-xs mt-0.5 italic", m.isProfit ? "text-green-500" : "text-amber-500")}>
                {m.hint}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
