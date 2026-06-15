"use client";
/**
 * Finance Dashboard — PAGE 002 (016_DASHBOARD_PAGES.md)
 * Auth: FINANCE role (032_PERMISSION_MATRIX)
 * ER-002: Displays Financial Engine outputs only. Zero calculation.
 */
import { useState } from "react";
import type { DashboardPeriod, ViewMode } from "@/types/dashboard.types";
import { MOCK_FINANCIAL_KPIS, MOCK_COSTS, MOCK_REVENUE_TREND } from "@/lib/dashboard/mock-data";
import { KpiCard } from "@/components/kpi/KpiCard";
import { CostBadge, PeriodSelector, SectionHeader, ViewModeToggle, FormulaInspectorPanel } from "@/components/shared/index";
import { RevenueTrendChart, CostWaterfallChart, KpiComparisonChart } from "@/components/charts/index";

export default function FinanceDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("LAST_30_DAYS");
  const [viewMode, setViewMode] = useState<ViewMode>("orders");
  const [showProjected, setShowProjected] = useState(false);
  const [inspectorKpiId, setInspectorKpiId] = useState<string | undefined>();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-sm text-gray-500" dir="rtl">لوحة التحكم المالية</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          <PeriodSelector value={period} onChange={setPeriod} showProjectedToggle showProjected={showProjected} onProjectedToggle={setShowProjected} />
        </div>
      </div>
      {/* Financial KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {MOCK_FINANCIAL_KPIS.map(kpi => (
          <KpiCard key={kpi.kpiId} {...(kpi as any)} viewMode={viewMode} onInspect={() => setInspectorKpiId(kpi.kpiId)} />
        ))}
      </div>
      {/* Revenue timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionHeader title="Revenue Timeline" titleAr="جدول الإيرادات الزمني" />
        <RevenueTrendChart data={MOCK_REVENUE_TREND} showProjected={showProjected} />
        {showProjected && <p className="text-xs text-amber-600 text-center mt-1 italic">Dashed line = projected (not realized — FR-002)</p>}
      </div>
      {/* Expense analysis */}
      <div>
        <SectionHeader title="Expense Analysis" titleAr="تحليل المصاريف" action={<ViewModeToggle mode={viewMode} onChange={setViewMode} />} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          {Object.entries(MOCK_COSTS).map(([k, c]) => (
            <CostBadge key={k} label={c.label} labelAr="" total={c.value} perOrder={c.perOrder} perItem={c.perItem} viewMode={viewMode as any} />
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <CostWaterfallChart costs={Object.fromEntries(Object.entries(MOCK_COSTS).map(([k, c]) => [k, { label: c.label, value: c.value }]))} />
        </div>
      </div>
      {/* P vs P comparison */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionHeader title="Period Comparison" titleAr="مقارنة الفترات" />
        <KpiComparisonChart data={[{ metric: "Revenue", current: 84750, previous: 75400 }, { metric: "Gross Profit", current: 38200, previous: 35100 }, { metric: "Net Profit", current: 18540, previous: 17970 }]} />
      </div>
      {/* Shipping subsidy note (SHIP-001) */}
      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
        <p className="text-xs font-semibold text-indigo-700">Shipping Subsidy (SHIP-001)</p>
        <p className="text-xs text-indigo-600">Actual Shipping Cost − Customer Shipping Fee. May be positive, zero, or negative.</p>
        <p className="text-xs font-bold text-indigo-900 mt-1">EGP 2,610 — business absorbed this period</p>
      </div>
      {/* Cash note (FR-004) */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs font-semibold text-amber-700">Cash Flow is separate from Profit (FR-004)</p>
        <p className="text-xs text-amber-600">View Cash Flow Dashboard for liquidity analysis.</p>
      </div>
      <FormulaInspectorPanel kpiId={inspectorKpiId} isOpen={!!inspectorKpiId} onClose={() => setInspectorKpiId(undefined)} />
    </div>
  );
}
