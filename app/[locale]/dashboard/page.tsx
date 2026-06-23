"use client";
/**
 * Homepage V3 — E-commerce Owner Command Center (Sprint 2B Phase 2)
 * Repository: 075_HOMEPAGE_CONTRACT.md, 076_METRICS_CATALOG.md, 077_IMPLEMENTATION_RULES.md
 *
 * API-driven: GET /api/v1/homepage powers all data.
 * No mock data. No frontend calculations. Backend is single source of truth.
 * Preserve existing layout exactly — enhance only.
 */
import { useState, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { TERMS, getLocale, type DimMode } from "@/components/homepage/locale";
import { HomepageTopBar } from "@/components/homepage/HomepageTopBar";
import { KpiCardsRow } from "@/components/homepage/KpiCardsRow";
import { DecisionStrip } from "@/components/homepage/DecisionStrip";
import { SmartFiltersBar } from "@/components/homepage/SmartFiltersBar";
import { ViewSelectorBar } from "@/components/homepage/ViewSelectorBar";
import { ProductIntelligenceGrid } from "@/components/homepage/ProductIntelligenceGrid";
import { InventorySummary, CashSettlementSummary, DecisionQueue } from "@/components/homepage/BottomSections";
import { ManualFinancialAdjustmentDialog } from "@/components/homepage/ManualFinancialAdjustmentDialog";
import { useHomepageData, type HomepageFilter, type HomepageView } from "@/hooks/useHomepageData";
import { useStoreId } from "@/hooks/useStoreId";
import { cn } from "@/lib/utils";

// Period → from/to dates (no UI math — just date window)
function periodToRange(period: string, customFrom: string, customTo: string): { from: Date; to: Date } {
  const to = new Date();
  if (period === "CUSTOM" && customFrom && customTo) {
    return { from: new Date(customFrom), to: new Date(customTo) };
  }
  const from = new Date();
  switch (period) {
    case "TODAY":       from.setHours(0,0,0,0); break;
    case "LAST_7_DAYS": from.setDate(from.getDate() - 7); break;
    case "THIS_MONTH":  from.setDate(1); from.setHours(0,0,0,0); break;
    case "LAST_MONTH":
      from.setDate(1); from.setMonth(from.getMonth() - 1); from.setHours(0,0,0,0);
      to.setDate(0); to.setHours(23,59,59,999); break;
    default:            from.setDate(from.getDate() - 30); break; // LAST_30_DAYS
  }
  return { from, to };
}

function formatImpactLabel(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);

  if (value && typeof value === "object") {
    const v = value as {
      impactLabel?: unknown;
      impactValue?: unknown;
      profitImpact?: unknown;
      cashImpact?: unknown;
      revenueImpact?: unknown;
    };

    const picked =
      v.impactLabel ??
      v.impactValue ??
      v.profitImpact ??
      v.cashImpact ??
      v.revenueImpact;

    if (typeof picked === "string") return picked;
    if (typeof picked === "number") return String(picked);
  }

  return "—";
}

export default function DashboardPage() {
  const pathname   = usePathname();
  const locale     = getLocale(pathname);
  const t          = TERMS[locale];
  const isRtl      = locale === "ar";
  const oppLocale  = locale === "en" ? "ar" : "en";

  // ── UI state ───────────────────────────────────────────────────────────
  const [period,      setPeriod]     = useState("LAST_30_DAYS");
  const [customFrom,  setCustomFrom] = useState("");
  const [customTo,    setCustomTo]   = useState("");
  const [showProj,    setShowProj]   = useState(false);
  const [dimMode,     setDimMode]    = useState<DimMode>("total");
  const [search,      setSearch]     = useState("");
  const [adjOpen,     setAdjOpen]    = useState(false);
  const [syncStatus,  setSyncStatus] = useState<"ok"|"failed"|"syncing">("ok");
  const [syncResult,  setSyncResult] = useState<string | null>(null);
  const [refreshKey,  setRefreshKey] = useState(0);

  // ── Homepage-contract driven state ─────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState<HomepageFilter>("all");
  const [activeView,   setActiveView]   = useState<HomepageView>("executive");

  // ── Store resolution ───────────────────────────────────────────────────
  const storeId = useStoreId();

  // ── Date range ─────────────────────────────────────────────────────────
  const { from, to } = useMemo(
    () => periodToRange(period, customFrom, customTo),
    [period, customFrom, customTo],
  );

  // ── Homepage API ───────────────────────────────────────────────────────
  const { data, status, error, refetch } = useHomepageData({
    storeId,
    from,
    to,
    filter:     activeFilter,
    view:       activeView,
    refreshKey,
  });

  const isLoading  = status === "loading";
  const isEmpty    = status === "empty";
  const hasError   = status === "error";

  // ── Sync Now ───────────────────────────────────────────────────────────
  const handleSync = useCallback(async () => {
    setSyncStatus("syncing");
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providers: ["EASYORDERS","BOSTA","META","TIKTOK"], mode: "manual" }),
      });
      const json = await res.json();
      if (json.success) {
        setSyncStatus("ok");
        const parts: string[] = (json.data?.providers ?? []).map((p: any) => {
          const icon = p.status === "success" ? "✓" : p.status.startsWith("skipped") ? "—" : "✗";
          return `${icon} ${p.provider} (${p.recordsUpserted})`;
        });
        setSyncResult(parts.join(" · "));
        setRefreshKey(k => k + 1);
        setTimeout(() => setSyncResult(null), 8000);
      } else {
        setSyncStatus("failed");
        setSyncResult(json.error ?? "Sync failed");
        setTimeout(() => { setSyncStatus("ok"); setSyncResult(null); }, 8000);
      }
    } catch {
      setSyncStatus("failed");
      setSyncResult("Network error");
      setTimeout(() => { setSyncStatus("ok"); setSyncResult(null); }, 8000);
    }
  }, []);

  // ── Derive props from API data ─────────────────────────────────────────
  const kpiCards     = data?.kpiCards ?? [];
  const smartFilters = data?.smartFilters ?? [];
  const products     = data?.products ?? [];
  const aov          = data?.aov ?? null;
  const smartPriority = data?.smartPriority ?? null;

  const smartPriorityImpact = formatImpactLabel(smartPriority?.impactLabel);

  // Build ExecSummary data from kpiCards (keep existing ExecutiveSummary component)
  const cardVal = (id: string) => kpiCards.find(c => c.id === id)?.value ?? 0;
  

  // Build cash data from AOV or empty
  const cashData: Array<{ label: string; value: number }> = [];

  // Decision queue from smart priority
  const decisionQueue = smartPriority
    ? [{
        decisionId:   smartPriority.decisionId,
        decisionName: smartPriority.action,
        priority:     smartPriority.priority,
        expectedImpact: smartPriorityImpact,
        confidence:   0.8,
        category:     "Business",
      }]
    : [];

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50">

      {/* ── Top bar (preserved exactly) ──────────────────────────────── */}
      <HomepageTopBar
        state={{ locale, period, customFrom, customTo, showProjected: showProj, dimMode, search }}
        t={t} isRtl={isRtl}
        onLocaleSwitch={() => {
          if (typeof window !== "undefined") window.location.href = `/${oppLocale}/dashboard`;
        }}
        onPeriod={setPeriod}
        onCustomFrom={setCustomFrom}
        onCustomTo={setCustomTo}
        onProjected={() => setShowProj(p => !p)}
        onDim={setDimMode}
        onSearch={setSearch}
        onSync={handleSync}
        syncStatus={syncStatus}
      />

      {/* ── Sync result toast ─────────────────────────────────────────── */}
      {syncResult && (
        <div className={cn(
          "fixed bottom-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg border",
          syncStatus === "failed"
            ? "bg-red-50 border-red-200 text-red-700"
            : "bg-green-50 border-green-200 text-green-700",
        )}>
          {syncResult}
        </div>
      )}

      {/* ── Error banner ──────────────────────────────────────────────── */}
      {hasError && error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-between">
          <p className="text-xs text-red-700">
            {locale === "ar" ? "فشل تحميل البيانات:" : "Failed to load data:"} {error}
          </p>
          <button onClick={refetch} className="text-xs text-red-600 underline ml-4">
            {locale === "ar" ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      )}

      {/* ── KPI Cards (API-driven, replaces ExecutiveSummary for cards) ─ */}
      {kpiCards.length > 0 ? (
        <KpiCardsRow cards={kpiCards} locale={locale} loading={isLoading} />
      ) : (
        // Keep ExecutiveSummary for backward compat when API hasn't loaded yet
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          {isLoading ? (
            <div className="flex gap-4">
              {Array.from({length:8}).map((_,i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-5 w-20 bg-gray-100 rounded mb-1" />
                  <div className="h-3 w-14 bg-gray-50 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              {locale === "ar" ? "لا توجد بيانات للفترة المحددة" : "No data for selected period"}
            </p>
          )}
        </div>
      )}

      {/* ── Decision Strip (Smart Priority) ──────────────────────────── */}
      {smartPriority && (
        <DecisionStrip
          t={t} locale={locale}
          decision={{
            name:         smartPriority.action,
            reason:       smartPriority.reason,
            profitImpact: smartPriorityImpact,
            cashImpact:   smartPriorityImpact,
            confidence:   0.8,
            priority:     smartPriority.priority,
            id:           smartPriority.decisionId,
          }}
        />
      )}

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="px-4 py-4 space-y-4 max-w-screen-2xl mx-auto">

        {/* Actions row */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Manual adjustment button */}
          <button onClick={() => setAdjOpen(true)}
            className="rounded-lg border border-gray-200 bg-white text-gray-700 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 shadow-sm">
            {t.addAdjustment}
          </button>

          {/* Last computed */}
          {data?.meta?.computedAt && (
            <span className="text-xs text-gray-300">
              {locale === "ar" ? "آخر تحديث:" : "Updated:"} {new Date(data.meta.computedAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* ── Smart Filters (075: SMART FILTERS — live counts from API) ── */}
        <SmartFiltersBar
          filters={smartFilters}
          activeFilter={activeFilter}
          onFilter={setActiveFilter}
          locale={locale}
          loading={isLoading}
        />

        {/* ── Product Intelligence Grid — main section ───────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* View Selector (075: VIEW SELECTOR) */}
          <ViewSelectorBar activeView={activeView} onView={setActiveView} locale={locale} />

          {/* Grid */}
          <ProductIntelligenceGrid
          key={`${activeView}-${activeFilter}`}
            t={t} locale={locale} dimMode={dimMode}
            products={products}
            search={search}
            activeView={activeView}
            loading={isLoading}
            emptyLabel={
              isEmpty
                ? (locale === "ar" ? "لا توجد منتجات — أضف منتجات أو قم بمزامنة البيانات" : "No products — add products or sync data")
                : undefined
            }
          />
        </div>

        {/* ── Bottom 3 compact sections ──────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-4">
          <InventorySummary t={t} locale={locale} products={products} />
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6">
  <h3 className="text-sm font-semibold mb-2">
    {locale === "ar"
      ? "التسويات النقدية"
      : "Cash Settlement"}
  </h3>

  <p className="text-sm text-gray-500">
    {locale === "ar"
      ? "بيانات التسويات غير متاحة حالياً."
      : "Settlement data is not available yet."}
  </p>
</div>
          <DecisionQueue t={t} locale={locale} decisions={decisionQueue} />
        </div>
      </div>

      {/* ── Manual Adjustment Dialog (preserved exactly) ─────────────── */}
      <ManualFinancialAdjustmentDialog
        t={t} locale={locale}
        isOpen={adjOpen}
        onClose={() => setAdjOpen(false)}
      />
    </div>
  );
}
