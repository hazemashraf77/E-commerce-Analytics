"use client";
/** Orders Dashboard — 016_DASHBOARD_PAGES.md. ER-002: No calculations. */
import { useState } from "react";
import type { DashboardPeriod, ViewMode } from "@/types/dashboard.types";
import { MOCK_LIFECYCLE_CARDS, MOCK_SCORES } from "@/lib/dashboard/mock-data";
import { PeriodSelector, SectionHeader, ViewModeToggle, LifecycleCard } from "@/components/shared/index";
import { ScoreCard } from "@/components/scores/ScoreCard";

export default function OrdersDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("LAST_30_DAYS");
  const [viewMode, setViewMode] = useState<ViewMode>("orders");
  const relevantScores = MOCK_SCORES.slice(0, 2);
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Orders Dashboard</h1>
        <div className="flex items-center gap-3">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {relevantScores.map(s => <ScoreCard key={s.scoreId} {...(s as any)} />)}
      </div>
      <SectionHeader title="Order Lifecycle" titleAr="دورة الطلبات" />
      <div className="flex gap-2 overflow-x-auto pb-2">
        {MOCK_LIFECYCLE_CARDS.map(c => <div key={c.statusKey} className="shrink-0"><LifecycleCard {...c} viewMode={viewMode} /></div>)}
      </div>
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
        Full orders detail implementation — connects to API Layer from Sprint 6.
      </div>
    </div>
  );
}
