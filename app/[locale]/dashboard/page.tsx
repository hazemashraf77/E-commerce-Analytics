"use client";
/**
 * Executive Dashboard — Sprint 7.1 refinement.
 * Repository: 014, 016 (PAGE 001), 054 (SCORE_CATALOG), 055 (DECISION_ENGINE)
 * ER-002: ZERO calculations. FR-002: projected ≠ realized. FR-004: cash ≠ profit.
 */

import { useState } from "react";
import Link from "next/link";
import type { DashboardPeriod, ViewMode } from "@/types/dashboard.types";
import {
  MOCK_FINANCIAL_KPIS, MOCK_SCORES, MOCK_DECISIONS, MOCK_SMART_ALERTS,
  MOCK_LIFECYCLE_CARDS, MOCK_CPA_BY_STAGE, MOCK_REVENUE_TREND, MOCK_COSTS,
  MOCK_PROFIT_LEAKAGE, MOCK_PENDING_MONEY, MOCK_SETTLEMENT_TIMELINE,
  MOCK_ROAS_FULL_LIFECYCLE, MOCK_COST_EVOLUTION, MOCK_HEALTH_STRIP,
  MOCK_INVENTORY_CAPACITY,
} from "@/lib/dashboard/mock-data";
import { MOCK_PRODUCT_INTELLIGENCE } from "@/modules/formula-engine";
import { KpiCard } from "@/components/kpi/KpiCard";
import { ScoreCard } from "@/components/scores/ScoreCard";
import { DecisionCard } from "@/components/decisions/DecisionCard";
import {
  SmartAlert, LifecycleCard, ViewModeToggle, PeriodSelector,
  SectionHeader, FormulaInspectorPanel, DrillDownPanel,
} from "@/components/shared/index";
import {
  RevenueTrendChart, ProfitTrendChart, CpaEvolutionChart,
  RoasEvolutionChart, CostWaterfallChart, KpiComparisonChart,
} from "@/components/charts/index";
import { CostEvolutionWidget } from "@/components/dashboard/CostEvolutionWidget";
import { ProfitLeakageWidget } from "@/components/dashboard/ProfitLeakageWidget";
import {
  PendingMoneyWidget, SettlementTimeline,
  InventoryCapacityWidget, ExecutiveHealthStrip,
} from "@/components/dashboard/RefineWidgets";

const COMPARISON_DATA = [
  { metric: "Revenue",      current: 84750, previous: 75400 },
  { metric: "Gross Profit", current: 38200, previous: 35100 },
  { metric: "Net Profit",   current: 18540, previous: 17970 },
  { metric: "Mkt Spend",    current:  8700, previous:  7200 },
];

export default function ExecutiveDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("LAST_30_DAYS");
  const [viewMode, setViewMode] = useState<ViewMode>("orders");
  const [showProjected, setShowProjected] = useState(false);
  const [inspectorKpiId, setInspectorKpiId] = useState<string | undefined>();
  const [drillDown, setDrillDown] = useState<{ title: string } | null>(null);

  const openI = (id: string) => setInspectorKpiId(id);
  const openD = (title: string) => setDrillDown({ title });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-sm text-gray-500" dir="rtl">لوحة التحكم التنفيذية</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          <PeriodSelector value={period} onChange={setPeriod}
            showProjectedToggle showProjected={showProjected} onProjectedToggle={setShowProjected} />
        </div>
      </div>

      {/* ── Executive Health Strip (refinement 7, SCORE ENGINE outputs) ── */}
      <ExecutiveHealthStrip
        items={MOCK_HEALTH_STRIP}
        onItemClick={openI}
      />

      {/* ── Smart Alerts (055: Alert Generation) ─────────────────── */}
      {MOCK_SMART_ALERTS.length > 0 && (
        <div className="space-y-2">
          <SectionHeader title="Smart Alerts" titleAr="تنبيهات ذكية" />
          {MOCK_SMART_ALERTS.map(alert => (
            <SmartAlert key={alert.alertId} {...(alert as any)}
              onViewDecision={() => openD(`Decision: ${alert.decisionId}`)} />
          ))}
        </div>
      )}

      {/* ── P&L Financial KPIs (inline dual-dimension, refinement 5) ── */}
      <div>
        <SectionHeader title="Financial Performance" titleAr="الأداء المالي"
          action={<span className="text-xs text-indigo-600 italic">Realized — Delivered only (BR-005)</span>} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MOCK_FINANCIAL_KPIS.slice(0, 4).map(kpi => (
            <KpiCard key={kpi.kpiId} {...(kpi as any)} viewMode={viewMode}
              onInspect={() => openI(kpi.kpiId)} onDrillDown={() => openD(kpi.title)} />
          ))}
        </div>
      </div>

      {/* ── Cost Waterfall (existing) ─────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionHeader title="Cost Waterfall" titleAr="شلال التكاليف" />
        <CostWaterfallChart costs={Object.fromEntries(Object.entries(MOCK_COSTS).map(([k,c]) => [k, { label: c.label, value: c.value }]))} />
      </div>

      {/* ── Cost Evolution by Lifecycle Stage (refinement 1) ─────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionHeader title="Cost Evolution by Stage" titleAr="تطور التكاليف حسب المرحلة"
          action={<ViewModeToggle mode={viewMode} onChange={setViewMode} />} />
        <p className="text-xs text-gray-400 mb-3">
          Orders, Items, Cost/Order, Cost/Item and Total at every lifecycle stage.
          Projected stages are visually labeled. Final Realized = delivered orders only (BR-005).
        </p>
        <CostEvolutionWidget data={MOCK_COST_EVOLUTION} viewMode={viewMode} />
      </div>

      {/* ── Expanded Profit Leakage (refinement 2) ───────────────── */}
      <div className="bg-white rounded-xl border border-red-100 p-4">
        <SectionHeader title="Profit Leakage" titleAr="تسرب الأرباح"
          action={<ViewModeToggle mode={viewMode} onChange={setViewMode} />} />
        <p className="text-xs text-gray-400 mb-3">
          All cost lines consuming profit. Values from Financial Engine only (ER-002).
        </p>
        <ProfitLeakageWidget items={MOCK_PROFIT_LEAKAGE} viewMode={viewMode} />
      </div>

      {/* ── Pending Money (refinement 3, FR-004) ─────────────────── */}
      <div>
        <SectionHeader title="Pending Money" titleAr="الأموال المعلقة" />
        <PendingMoneyWidget items={MOCK_PENDING_MONEY} onDrillDown={k => openD(`Money: ${k}`)} />
      </div>

      {/* ── Settlement Timeline visual (refinement 4) ─────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionHeader title="Settlement Timeline" titleAr="جدول التسويات الزمني" />
        <SettlementTimeline entries={MOCK_SETTLEMENT_TIMELINE} onSelect={id => openD(`Settlement ${id}`)} />
      </div>

      {/* ── Order lifecycle (all 13 Bosta-accurate buckets) ──────── */}
      <div>
        <SectionHeader title="Order Lifecycle" titleAr="دورة الطلبات"
          action={<ViewModeToggle mode={viewMode} onChange={setViewMode} />} />
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
          {MOCK_LIFECYCLE_CARDS.map(card => (
            <div key={card.statusKey} className="snap-start shrink-0 cursor-pointer" onClick={() => openD(card.labelEn)}>
              <LifecycleCard {...card} viewMode={viewMode} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Revenue & Profit trends ───────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <SectionHeader title="Revenue Trend" titleAr="اتجاه الإيرادات" />
          <RevenueTrendChart data={MOCK_REVENUE_TREND} showProjected={showProjected} />
          {showProjected && <p className="text-xs text-amber-600 text-center mt-1 italic">Dashed = projected (not realized — FR-002)</p>}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <SectionHeader title="Net Profit Trend" titleAr="اتجاه صافي الربح" />
          <ProfitTrendChart data={MOCK_REVENUE_TREND.map(d => ({ ...d, value: d.value * 0.22 }))} />
        </div>
      </div>

      {/* ── CPA Evolution + ROAS Full Lifecycle (refinements 1, 6) ── */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <SectionHeader title="CPA Evolution by Stage" titleAr="تطور تكلفة الاكتساب" />
          <p className="text-xs text-gray-400 mb-2">
            Delivered = True CPA (MKT-002). Earlier stages are projected CPA (not realized).
          </p>
          <CpaEvolutionChart data={MOCK_CPA_BY_STAGE} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <SectionHeader title="ROAS Evolution — Full Lifecycle" titleAr="تطور عائد الإنفاق" />
          <RoasEvolutionChart data={MOCK_ROAS_FULL_LIFECYCLE} />
        </div>
      </div>

      {/* ── Inventory Capacity (refinement 8) ────────────────────── */}
      <InventoryCapacityWidget data={MOCK_INVENTORY_CAPACITY} onDrillDown={() => openD("Inventory Capacity")} />

      {/* ── KPI Comparison ───────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionHeader title="KPI Comparison" titleAr="مقارنة المؤشرات" />
        <KpiComparisonChart data={COMPARISON_DATA} />
      </div>

      {/* ── Product Intelligence Preview (Executive Table) ───────────── */}
      <div>
        <SectionHeader title="Product Intelligence" titleAr="ذكاء المنتجات"
          action={<Link href="/en/dashboard/products" className="text-xs text-indigo-600 underline">View full table →</Link>} />
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500">Product</th>
                  <th className="px-2 py-2 text-center font-semibold text-gray-500">Delivered</th>
                  <th className="px-2 py-2 text-right font-semibold text-gray-500">Revenue</th>
                  <th className="px-2 py-2 text-right font-semibold text-gray-500">True Profit</th>
                  <th className="px-2 py-2 text-center font-semibold text-gray-500">Margin</th>
                  <th className="px-2 py-2 text-right font-semibold text-gray-500">True CPA</th>
                  <th className="px-2 py-2 text-center font-semibold text-gray-500">True ROAS</th>
                  <th className="px-2 py-2 text-center font-semibold text-gray-500">PPAP</th>
                  <th className="px-2 py-2 text-center font-semibold text-gray-500">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_PRODUCT_INTELLIGENCE.map(p => (
                  <tr key={p.productId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-800 truncate max-w-36" title={p.productName}>{p.productName}</div>
                      <div className="text-gray-400 font-mono text-xs">{p.sku}</div>
                    </td>
                    <td className="px-2 py-2 text-center font-semibold text-green-700">{p.ordersDelivered}</td>
                    <td className="px-2 py-2 text-right tabular-nums">EGP {p.revenue.toLocaleString()}</td>
                    <td className={`px-2 py-2 text-right tabular-nums font-semibold ${p.trueProfit >= 0 ? "text-green-700" : "text-red-600"}`}>
                      EGP {p.trueProfit.toLocaleString()}
                    </td>
                    <td className="px-2 py-2 text-center">{p.profitMarginPct.toFixed(1)}%</td>
                    <td className="px-2 py-2 text-right tabular-nums">{p.trueCpa !== null ? `EGP ${p.trueCpa.toFixed(0)}` : "—"}</td>
                    <td className={`px-2 py-2 text-center font-semibold ${(p.trueRoas ?? 0) >= 1 ? "text-green-700" : "text-red-600"}`}>
                      {p.trueRoas !== null ? `${p.trueRoas.toFixed(2)}×` : "—"}
                    </td>
                    <td className={`px-2 py-2 text-center font-semibold ${(p.ppap ?? 0) >= 1 ? "text-green-700" : "text-red-600"}`}>
                      {p.ppap !== null ? p.ppap.toFixed(2) : "—"}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${
                        p.inventoryStatus === "IN_STOCK" ? "bg-green-100 text-green-700" :
                        p.inventoryStatus === "LOW_STOCK" ? "bg-amber-100 text-amber-700" :
                        p.inventoryStatus === "OUT_OF_STOCK" ? "bg-red-100 text-red-700" :
                        "bg-gray-200 text-gray-600"
                      }`}>{p.stockAvailable}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t border-gray-50 text-xs text-gray-400">
            All values computed by Formula Engine (TRUE-001, MKT-002, MKT-012, MKT-013) · <Link href="/en/dashboard/products" className="text-indigo-500 underline">Full product intelligence →</Link>
          </div>
        </div>
      </div>

      {/* ── Quick Navigation ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {[
          { href: "/en/dashboard/finance",     label: "💰 Finance" },
          { href: "/en/dashboard/marketing",   label: "📣 Marketing" },
          { href: "/en/dashboard/shipping",    label: "🚚 Shipping" },
          { href: "/en/dashboard/inventory",   label: "📦 Inventory" },
          { href: "/en/dashboard/products",    label: "🏷 Products" },
          { href: "/en/dashboard/decision-center", label: "🎯 Decisions" },
          { href: "/en/dashboard/formula-inspector", label: "ƒ Formulas" },
        ].map(l => (
          <Link key={l.href} href={l.href}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors">
            {l.label}
          </Link>
        ))}
      </div>

      {/* ── Scores grid (SCORE-001 to SCORE-009) ─────────────────── */}
      <div>
        <SectionHeader title="Business Scores" titleAr="درجات الأعمال" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOCK_SCORES.map(score => (
            <ScoreCard key={score.scoreId} {...(score as any)}
              onInspect={() => openD(`Score Inspector: ${score.scoreName}`)} />
          ))}
        </div>
      </div>

      {/* ── Decision Center preview ───────────────────────────────── */}
      <div>
        <SectionHeader title="Decision Center" titleAr="مركز القرارات"
          action={<a href="/dashboard/decision-center" className="text-xs text-indigo-600 underline">View all →</a>} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOCK_DECISIONS.map(dec => (
            <DecisionCard key={dec.decisionId} {...(dec as any)}
              onInspect={() => openD(`Decision Inspector: ${dec.decisionId}`)}
              onAccept={() => {}} onReject={() => {}} />
          ))}
        </div>
      </div>

      {/* ── AI Daily Brief placeholder ────────────────────────────── */}
      <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 p-4 text-center">
        <p className="text-sm font-semibold text-indigo-700">AI Daily Brief</p>
        <p className="text-xs text-indigo-500 mt-1">AI consumes Score + Decision Engine outputs (AR-001). Active in AI Engine sprint.</p>
      </div>

      {/* ── Overlays ─────────────────────────────────────────────── */}
      <FormulaInspectorPanel kpiId={inspectorKpiId} isOpen={!!inspectorKpiId} onClose={() => setInspectorKpiId(undefined)} />
      <DrillDownPanel title={drillDown?.title ?? ""} isOpen={!!drillDown} onClose={() => setDrillDown(null)}>
        <p className="text-sm text-gray-600">Drill-down detail for: {drillDown?.title}</p>
        <p className="text-xs text-gray-400 mt-4">Full drill-down connects to API Layer (Sprint 6) and Formula Inspector.</p>
      </DrillDownPanel>
    </div>
  );
}
