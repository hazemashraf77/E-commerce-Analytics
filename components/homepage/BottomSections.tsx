"use client";
import type { Terms } from "./locale";
import type { ProductKpiRow } from "@/modules/formula-engine";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ── InventorySummary ──────────────────────────────────────────────────────

interface InvProps {
  t: Terms;
  locale: "en" | "ar";
  products: ProductKpiRow[];
}

export function InventorySummary({ t, locale, products }: InvProps) {
  const totalValue = products.reduce((s, p) => s + (p.inventoryValue ?? 0), 0);
  const cashLocked = products.reduce((s, p) => s + (p.cashLocked ?? 0), 0);
  const deadStock  = products.filter(p => p.inventoryStatus === "DEAD_STOCK");
  const belowReorder = products.filter(p => p.inventoryStatus === "OUT_OF_STOCK" || p.inventoryStatus === "LOW_STOCK");
  const within7  = products.filter(p => p.daysRemaining != null && p.daysRemaining <= 7);

  const rows = [
    { label: t.invValue,       value: `EGP ${Math.round(totalValue).toLocaleString("en-EG")}`, cls: "text-gray-800" },
    { label: t.cashLockedLbl,  value: `EGP ${Math.round(cashLocked).toLocaleString("en-EG")}`, cls: cashLocked > 5000 ? "text-amber-600" : "text-gray-600" },
    { label: t.deadStock,      value: `${deadStock.length} ${locale === "ar" ? "منتج" : "products"}`,  cls: deadStock.length > 0 ? "text-red-500" : "text-gray-400" },
    { label: t.belowReorder,   value: `${belowReorder.length} ${locale === "ar" ? "منتج" : "products"}`,cls: belowReorder.length > 0 ? "text-red-500" : "text-gray-400" },
    { label: t.within7d,       value: `${within7.length} ${locale === "ar" ? "منتج" : "products"}`,    cls: within7.length > 0 ? "text-amber-500" : "text-gray-400" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{t.invSnapshot}</p>
      <div className="space-y-2">
        {rows.map(r => (
          <div key={r.label} className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{r.label}</span>
            <span className={cn("text-xs font-semibold tabular-nums", r.cls)}>{r.value}</span>
          </div>
        ))}
      </div>
      <Link href="/en/dashboard/inventory" className="block text-xs text-indigo-500 hover:underline mt-3">
        {locale === "ar" ? "عرض المخزون الكامل →" : "Full inventory →"}
      </Link>
    </div>
  );
}

// ── CashSettlementSummary ─────────────────────────────────────────────────

interface CashProps {
  t: Terms;
  locale: "en" | "ar";
  cashData: Array<{ label: string; value: number }>;
}

export function CashSettlementSummary({ t, locale, cashData }: CashProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{t.cashSnapshot}</p>
      <div className="space-y-2">
        {cashData.map(r => (
          <div key={r.label} className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{r.label}</span>
            <span className="text-xs font-semibold tabular-nums text-gray-800">
              EGP {Math.round(r.value).toLocaleString("en-EG")}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 p-2 rounded-lg bg-amber-50 border border-amber-100 text-xs text-amber-700">
        {locale === "ar" ? "النقد ≠ الربح (FR-004). التسويات هي تحركات نقدية، ليست إيرادات." : "Cash ≠ Profit (FR-004). Settlements are cash events, not revenue."}
      </div>
      <Link href="/en/dashboard/finance" className="block text-xs text-indigo-500 hover:underline mt-3">
        {locale === "ar" ? "عرض التفاصيل المالية →" : "Full financial detail →"}
      </Link>
    </div>
  );
}

// ── DecisionQueue ─────────────────────────────────────────────────────────

interface QueueProps {
  t: Terms;
  locale: "en" | "ar";
  decisions: Array<{
    decisionId: string; decisionName: string; priority: string;
    expectedImpact: string; confidence: number; category: string;
  }>;
}

export function DecisionQueue({ t, locale, decisions }: QueueProps) {
  const top3 = decisions.slice(0, 3);
  const priorityCls: Record<string, string> = {
    CRITICAL: "text-red-600 bg-red-50 border-red-100",
    HIGH:     "text-red-500 bg-red-50 border-red-100",
    MEDIUM:   "text-amber-600 bg-amber-50 border-amber-100",
    LOW:      "text-gray-500 bg-gray-50 border-gray-100",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{t.decisionQueue}</p>
      <div className="space-y-3">
        {top3.map(d => (
          <div key={d.decisionId} className="flex items-start gap-2">
            <span className={cn("rounded-full text-xs font-bold px-1.5 py-0.5 shrink-0 border", priorityCls[d.priority] ?? priorityCls.LOW)}>
              {d.priority[0]}
            </span>
            <div>
              <p className="text-xs font-semibold text-gray-800">{d.decisionName}</p>
              <p className="text-xs text-gray-400 line-clamp-1">{d.expectedImpact}</p>
              <p className="text-xs text-gray-300 mt-0.5">{t.rulePreview}</p>
            </div>
          </div>
        ))}
      </div>
      <Link href="/en/dashboard/decision-center" className="block text-xs text-indigo-500 hover:underline mt-3">
        {locale === "ar" ? "عرض جميع القرارات →" : "View all decisions →"}
      </Link>
    </div>
  );
}
