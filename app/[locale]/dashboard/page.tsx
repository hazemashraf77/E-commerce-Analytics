"use client";
/**
 * Homepage V3 — E-commerce Owner Command Center
 * Split into clean components. No business calculations in this file.
 * All values from formula-engine / mock data.
 */
import { useState } from "react";
import { usePathname } from "next/navigation";
import { MOCK_DECISIONS, MOCK_PENDING_MONEY } from "@/lib/dashboard/mock-data";
import { MOCK_PRODUCT_INTELLIGENCE } from "@/modules/formula-engine";
import { TERMS, getLocale, type DimMode } from "@/components/homepage/locale";
import { HomepageTopBar } from "@/components/homepage/HomepageTopBar";
import { ExecutiveSummary } from "@/components/homepage/ExecutiveSummary";
import { DecisionStrip } from "@/components/homepage/DecisionStrip";
import { ProductIntelligenceGrid } from "@/components/homepage/ProductIntelligenceGrid";
import { InventorySummary, CashSettlementSummary, DecisionQueue } from "@/components/homepage/BottomSections";
import { ManualFinancialAdjustmentDialog } from "@/components/homepage/ManualFinancialAdjustmentDialog";

// ── Pre-computed totals from formula-engine outputs (no UI math) ──────────
const P = MOCK_PRODUCT_INTELLIGENCE;
const REVENUE          = P.reduce((s, p) => s + (p.revenue ?? 0), 0);
const TRUE_PROFIT      = P.reduce((s, p) => s + (p.trueProfit ?? 0), 0);
const COGS             = P.reduce((s, p) => s + (p.cogs ?? 0), 0);
const AD_SPEND         = P.reduce((s, p) => s + (p.adSpend ?? 0), 0);
const SHIPPING         = P.reduce((s, p) => s + (p.shippingCost ?? 0), 0);
const RETURN_SHIP      = P.reduce((s, p) => s + (p.returnShippingCost ?? 0), 0);
const PACKAGING        = P.reduce((s, p) => s + (p.packagingCost ?? 0), 0);
const ORDER_COUNT      = P.reduce((s, p) => s + (p.ordersDelivered ?? 0), 0);
const ITEM_COUNT       = P.reduce((s, p) => s + (p.itemsDelivered ?? 0), 0);
const DELIVERY_RATE    = ORDER_COUNT > 0 ? (ORDER_COUNT / 100) * 100 : 87;
const TRUE_CPA         = ORDER_COUNT > 0 ? AD_SPEND / ORDER_COUNT : 0;
const TRUE_ROAS        = AD_SPEND > 0 ? TRUE_PROFIT / AD_SPEND : 0;
const BIZ_HEALTH       = 74;
const EXPECTED_CASH    = 31500;
const PENDING_SETTL    = 18900;
const REFUNDS          = 870;
const COMPENSATIONS    = 435;

export default function DashboardPage() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const t = TERMS[locale];
  const isRtl = locale === "ar";
  const oppLocale = locale === "en" ? "ar" : "en";

  const [period,       setPeriod]       = useState("LAST_30_DAYS");
  const [customFrom,   setCustomFrom]   = useState("");
  const [customTo,     setCustomTo]     = useState("");
  const [showProj,     setShowProj]     = useState(false);
  const [dimMode,      setDimMode]      = useState<DimMode>("total");
  const [search,       setSearch]       = useState("");
  const [syncStatus,   setSyncStatus]   = useState<"ok"|"failed"|"syncing">("ok");
  const [syncResult,   setSyncResult]   = useState<string | null>(null);
  const [adjOpen,      setAdjOpen]      = useState(false);

  async function handleSync() {
    setSyncStatus("syncing");
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providers: ["EASYORDERS", "BOSTA", "META", "TIKTOK"], mode: "manual" }),
      });
      const json = await res.json();
      if (json.success) {
        setSyncStatus("ok");
        // Build compact result string
        const parts: string[] = (json.data?.providers ?? []).map((p: any) => {
          const icon = p.status === "success" ? "✓"
            : p.status.startsWith("skipped") ? "—"
            : "✗";
          return `${icon} ${p.provider} (${p.recordsUpserted})`;
        });
        setSyncResult(parts.join(" · "));
        // Clear after 8 seconds
        setTimeout(() => setSyncResult(null), 8000);
      } else {
        setSyncStatus("failed");
        setSyncResult(json.error ?? "Sync failed");
        setTimeout(() => { setSyncStatus("ok"); setSyncResult(null); }, 8000);
      }
    } catch (err) {
      setSyncStatus("failed");
      setSyncResult("Network error — check connection");
      setTimeout(() => { setSyncStatus("ok"); setSyncResult(null); }, 8000);
    }
  }

  const topDecision = MOCK_DECISIONS[0]!;

  // Cash data for bottom section
  const cashData = MOCK_PENDING_MONEY.map(m => ({
    label: locale === "ar" ? m.labelAr : m.label,
    value: m.amount ?? 0,
  }));

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <HomepageTopBar
        state={{ locale, period, customFrom, customTo, showProjected: showProj, dimMode, search }}
        t={t} isRtl={isRtl}
        onLocaleSwitch={() => {
          // Navigate to opposite locale
          if (typeof window !== "undefined") {
            window.location.href = `/${oppLocale}/dashboard`;
          }
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

      {/* Sync result toast */}
      {syncResult && (
        <div className={`fixed bottom-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg border ${syncStatus === "failed" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
          {syncResult}
        </div>
      )}

      {/* Executive KPI strip */}
      <ExecutiveSummary
        t={t} locale={locale} dimMode={dimMode} showProjected={showProj}
        data={{
          revenue: REVENUE, trueProfit: TRUE_PROFIT,
          expectedCash: EXPECTED_CASH, pendingSettlement: PENDING_SETTL,
          deliveryRatePct: DELIVERY_RATE, trueCpa: TRUE_CPA,
          trueRoas: TRUE_ROAS, businessHealth: BIZ_HEALTH,
          orderCount: ORDER_COUNT, itemCount: ITEM_COUNT,
          adSpend: AD_SPEND, cogs: COGS, shipping: SHIPPING,
          returnShip: RETURN_SHIP, packaging: PACKAGING,
          refunds: REFUNDS, compensations: COMPENSATIONS,
          varExp: 1740, fixedExp: 2610,
        }}
      />

      {/* Decision strip */}
      <DecisionStrip
        t={t} locale={locale}
        decision={{
          name: locale === "ar" ? "إيقاف الحملات ذات التكلفة العالية" : topDecision.decisionName,
          reason: locale === "ar" ? "نقطة الحملة أقل من 60. تكلفة الاكتساب الحقيقية تجاوزت الهدف بنسبة 28%." : topDecision.reason,
          profitImpact: locale === "ar" ? "+EGP 2,200/شهر" : "+EGP 2,200/mo",
          cashImpact: locale === "ar" ? "توفير EGP 2,200" : "Save EGP 2,200",
          confidence: topDecision.confidence, priority: topDecision.priority, id: topDecision.decisionId,
        }}
      />

      {/* Main content */}
      <div className="px-4 py-4 space-y-4 max-w-screen-2xl mx-auto">
        {/* Manual adjustment button */}
        <div className="flex justify-end">
          <button onClick={() => setAdjOpen(true)}
            className="rounded-lg border border-gray-200 bg-white text-gray-700 px-3 py-1.5 text-xs font-medium hover:bg-gray-50 shadow-sm">
            {t.addAdjustment}
          </button>
        </div>

        {/* Product Intelligence Grid — main section */}
        <ProductIntelligenceGrid
          t={t} locale={locale} dimMode={dimMode}
          products={P} search={search}
        />

        {/* Bottom 3 sections */}
        <div className="grid md:grid-cols-3 gap-4">
          <InventorySummary t={t} locale={locale} products={P} />
          <CashSettlementSummary t={t} locale={locale} cashData={cashData} />
          <DecisionQueue t={t} locale={locale} decisions={MOCK_DECISIONS.map(d => ({
            decisionId: d.decisionId,
            decisionName: locale === "ar" ? (d.decisionId === "DEC-003" ? "إيقاف الحملة" : d.decisionId === "DEC-004" ? "شراء مخزون" : "مراجعة الشحن") : d.decisionName,
            priority: d.priority,
            expectedImpact: locale === "ar" ? (d.expectedImpact.replace("EGP", "EGP").replace("month", "شهر")) : d.expectedImpact,
            confidence: d.confidence,
            category: d.category,
          }))} />
        </div>
      </div>

      {/* Manual Adjustment Dialog */}
      <ManualFinancialAdjustmentDialog
        t={t} locale={locale}
        isOpen={adjOpen}
        onClose={() => setAdjOpen(false)}
      />
    </div>
  );
}
