"use client";
/**
 * Dashboard chart components.
 * Repository: 014_DASHBOARD_ARCHITECTURE.md — Charts consume pre-computed data only.
 * ER-002: Zero business calculation in chart components.
 * All props are pre-formatted values from Analytics Engine.
 */

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { TimeSeriesDataPoint, CpaByStageDataPoint, RoasByStageDataPoint } from "@/types/dashboard.types";

// ── Revenue trend chart ────────────────────────────────────────────────────

interface RevenueTrendChartProps {
  data: TimeSeriesDataPoint[];
  showProjected?: boolean;    // FR-002: projected visually distinct
  loading?: boolean;
}

export function RevenueTrendChart({ data, showProjected, loading }: RevenueTrendChartProps) {
  if (loading) return <div className="h-48 animate-pulse rounded-lg bg-gray-100" />;
  return (
    <ResponsiveContainer width="100%" height={192}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
        <Tooltip formatter={(v: number) => [`EGP ${v.toFixed(0)}`, "Revenue"]} />
        <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={false} name="Revenue (Realized)" />
        {showProjected && (
          <Line type="monotone" dataKey="valueProjected" stroke="#a5b4fc" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Projected (not realized)" />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Net profit trend (with zero reference line) ───────────────────────────

interface ProfitTrendChartProps {
  data: TimeSeriesDataPoint[];
  loading?: boolean;
}

export function ProfitTrendChart({ data, loading }: ProfitTrendChartProps) {
  if (loading) return <div className="h-48 animate-pulse rounded-lg bg-gray-100" />;
  return (
    <ResponsiveContainer width="100%" height={192}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip formatter={(v: number) => [`EGP ${v.toFixed(0)}`, "Net Profit"]} />
        <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 2" />
        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} name="Net Profit" />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── CPA by lifecycle stage ────────────────────────────────────────────────

interface CpaEvolutionChartProps {
  data: CpaByStageDataPoint[];
  loading?: boolean;
}

export function CpaEvolutionChart({ data, loading }: CpaEvolutionChartProps) {
  if (loading) return <div className="h-48 animate-pulse rounded-lg bg-gray-100" />;
  return (
    <ResponsiveContainer width="100%" height={192}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}`} />
        <Tooltip formatter={(v: number) => [`EGP ${v.toFixed(1)}`, "CPA"]} />
        <Bar dataKey="cpa" fill="#4f46e5" name="CPA" radius={[4, 4, 0, 0]} />
        <Bar dataKey="orders" fill="#a5b4fc" name="Orders" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── ROAS by full lifecycle (5 stages) ────────────────────────────────────

interface RoasChartProps {
  data: RoasByStageDataPoint[];
  loading?: boolean;
}

export function RoasEvolutionChart({ data, loading }: RoasChartProps) {
  if (loading) return <div className="h-48 animate-pulse rounded-lg bg-gray-100" />;

  // Color bars by realized vs projected (FR-002 visual separation)
  const chartData = data.map(d => ({
    ...d,
    realizedRoas:  d.isRealized ? d.roas : 0,
    projectedRoas: d.isRealized ? 0       : d.roas,
  }));

  return (
    <div className="space-y-2">
      <div className="flex gap-3 text-xs mb-1">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-500" />
          Realized ROAS (delivered revenue)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm bg-amber-200 border border-amber-400 border-dashed" />
          Projected ROAS (not realized — FR-002)
        </span>
      </div>
      <ResponsiveContainer width="100%" height={192}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="stage" tick={{ fontSize: 9 }} interval={0} angle={-12} textAnchor="end" height={40} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}×`} />
          <Tooltip
            formatter={(v: number, name: string) => [
              `${v.toFixed(2)}×`,
              name === "realizedRoas" ? "Realized ROAS" : "Projected ROAS (not realized)",
            ]}
          />
          <Bar dataKey="realizedRoas"  fill="#f59e0b" name="realizedRoas"  radius={[4,4,0,0]} />
          <Bar dataKey="projectedRoas" fill="#fde68a" name="projectedRoas" radius={[4,4,0,0]}
               stroke="#f59e0b" strokeWidth={1} strokeDasharray="4 2" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Cost waterfall (horizontal stacked) ───────────────────────────────────

interface CostWaterfallChartProps {
  costs: Record<string, { label: string; value: number }>;
  loading?: boolean;
}

export function CostWaterfallChart({ costs, loading }: CostWaterfallChartProps) {
  if (loading) return <div className="h-32 animate-pulse rounded-lg bg-gray-100" />;
  const entries = Object.entries(costs).map(([key, c]) => ({ key, ...c }));
  return (
    <ResponsiveContainer width="100%" height={128}>
      <BarChart data={entries} layout="vertical" margin={{ top: 0, right: 16, left: 80, bottom: 0 }}>
        <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
        <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={80} />
        <Tooltip formatter={(v: number) => [`EGP ${v.toLocaleString()}`, "Amount"]} />
        <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── KPI comparison chart (period-over-period) ─────────────────────────────

interface KpiComparisonPoint {
  metric: string;
  current: number;
  previous: number;
}

export function KpiComparisonChart({ data, loading }: { data: KpiComparisonPoint[]; loading?: boolean }) {
  if (loading) return <div className="h-48 animate-pulse rounded-lg bg-gray-100" />;
  return (
    <ResponsiveContainer width="100%" height={192}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="metric" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip />
        <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="current" fill="#4f46e5" name="Current Period" radius={[4, 4, 0, 0]} />
        <Bar dataKey="previous" fill="#c7d2fe" name="Previous Period" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
