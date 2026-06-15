"use client";
/**
 * Marketing Dashboard — PAGE 004 (016_DASHBOARD_PAGES.md)
 * Auth: MARKETING role (032_PERMISSION_MATRIX)
 */
import { useState } from "react";
import type { DashboardPeriod, ViewMode } from "@/types/dashboard.types";
import { MOCK_CPA_BY_STAGE, MOCK_ROAS_BY_STAGE, MOCK_SCORES } from "@/lib/dashboard/mock-data";
import { PeriodSelector, SectionHeader, ViewModeToggle, FormulaInspectorPanel } from "@/components/shared/index";
import { CpaEvolutionChart, RoasEvolutionChart } from "@/components/charts/index";
import { ScoreCard } from "@/components/scores/ScoreCard";

export default function MarketingDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("LAST_30_DAYS");
  const [viewMode, setViewMode] = useState<ViewMode>("orders");
  const [inspectorKpiId, setInspectorKpiId] = useState<string | undefined>();

  const campaignScore = MOCK_SCORES.find(s => s.scoreId === "SCORE-003")!;
  const marketingScore = MOCK_SCORES.find(s => s.scoreId === "SCORE-007")!;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Marketing Dashboard</h1>
          <p className="text-sm text-gray-500" dir="rtl">لوحة التحكم التسويقية</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
      </div>
      {/* Score cards */}
      <div className="grid md:grid-cols-2 gap-3">
        <ScoreCard {...(campaignScore as any)} onInspect={() => setInspectorKpiId(campaignScore.scoreId)} />
        <ScoreCard {...(marketingScore as any)} onInspect={() => setInspectorKpiId(marketingScore.scoreId)} />
      </div>
      {/* Platform KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Spend", value: "EGP 8,700", per: viewMode === "orders" ? "EGP 100/order" : "EGP 61/item" },
          { label: "True CPA (Delivered)", value: "EGP 100", per: "MKT-002" },
          { label: "Marketing ROI", value: "9.74×", per: "MKT-003" },
          { label: "Delivered Orders", value: "87", per: "from 100 shipped" },
        ].map(k => (
          <div key={k.label} className="rounded-xl border-2 border-gray-200 bg-white p-4 cursor-pointer hover:shadow-md" onClick={() => setInspectorKpiId("KPI-MKT-001")}>
            <p className="text-xs text-gray-500">{k.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{k.value}</p>
            <p className="text-xs text-gray-400 mt-1">{k.per}</p>
          </div>
        ))}
      </div>
      {/* CPA by lifecycle stage */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionHeader title="CPA by Lifecycle Stage" titleAr="تكلفة الاكتساب حسب المرحلة" />
        <p className="text-xs text-gray-400 mb-2">
          CPA at each stage (Created → Delivered). Delivered = True CPA (MKT-002). Others are projected CPA — not realized (FR-002).
        </p>
        <CpaEvolutionChart data={MOCK_CPA_BY_STAGE} />
      </div>
      {/* ROAS */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <SectionHeader title="ROAS Evolution" titleAr="تطور عائد الإنفاق" />
        <p className="text-xs text-amber-600 mb-2 italic">Projected ROAS uses undelivered order values — not realized revenue (FR-002)</p>
        <RoasEvolutionChart data={MOCK_ROAS_BY_STAGE} />
      </div>
      <FormulaInspectorPanel kpiId={inspectorKpiId} isOpen={!!inspectorKpiId} onClose={() => setInspectorKpiId(undefined)} />
    </div>
  );
}
