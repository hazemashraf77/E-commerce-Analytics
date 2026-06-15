"use client";
/**
 * Dashboard data hooks.
 * Repository: 014_DASHBOARD_ARCHITECTURE.md — data flow: API → hook → component
 * ER-002: Hooks fetch data; they NEVER calculate or transform business values.
 * Mock fallback per IR-001: UI viewable before real APIs return data.
 */

import { useState, useEffect, useCallback } from "react";
import type { DashboardPeriod } from "@/types/dashboard.types";
import {
  MOCK_FINANCIAL_KPIS,
  MOCK_SCORES,
  MOCK_DECISIONS,
  MOCK_SMART_ALERTS,
  MOCK_LIFECYCLE_CARDS,
  MOCK_CPA_BY_STAGE,
  MOCK_ROAS_BY_STAGE,
  MOCK_REVENUE_TREND,
  MOCK_COSTS,
  MOCK_OPERATIONAL_KPIS,
} from "@/lib/dashboard/mock-data";

// ── Generic fetch hook ─────────────────────────────────────────────────────

function useDashboardFetch<T>(
  url: string,
  mockData: T,
  deps: unknown[] = [],
): { data: T; loading: boolean; error: string | null; refresh: () => void } {
  const [data, setData] = useState<T>(mockData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json();
      if (json.success && json.data !== undefined) setData(json.data);
    } catch (err) {
      // Fallback to mock data if API unavailable (IR-001)
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, [url, ...deps]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}

// ── Domain hooks ───────────────────────────────────────────────────────────

export function useExecutiveKpis(storeId: string, period: DashboardPeriod) {
  return useDashboardFetch(
    `/api/v1/dashboard/kpis?storeId=${storeId}&period=${period}`,
    { kpis: MOCK_FINANCIAL_KPIS, financialSummary: MOCK_COSTS },
    [storeId, period],
  );
}

export function useScores() {
  return useDashboardFetch("/api/v1/scores", MOCK_SCORES, []);
}

export function useDecisions() {
  return useDashboardFetch("/api/v1/decisions", MOCK_DECISIONS, []);
}

export function useSmartAlerts() {
  return useDashboardFetch("/api/v1/decisions/alerts", MOCK_SMART_ALERTS, []);
}

export function useLifecycleCards(storeId: string, period: DashboardPeriod) {
  return useDashboardFetch(
    `/api/v1/dashboard/lifecycle?storeId=${storeId}&period=${period}`,
    MOCK_LIFECYCLE_CARDS,
    [storeId, period],
  );
}

export function useCpaByStage(storeId: string, period: DashboardPeriod) {
  return useDashboardFetch(
    `/api/v1/marketing/analytics?storeId=${storeId}&period=${period}`,
    MOCK_CPA_BY_STAGE,
    [storeId, period],
  );
}

export function useRoasByStage(storeId: string, period: DashboardPeriod) {
  return useDashboardFetch(
    `/api/v1/marketing/analytics?storeId=${storeId}&period=${period}`,
    MOCK_ROAS_BY_STAGE,
    [storeId, period],
  );
}

export function useRevenueTrend(storeId: string, period: DashboardPeriod) {
  return useDashboardFetch(
    `/api/v1/dashboard/snapshot?storeId=${storeId}&period=${period}`,
    MOCK_REVENUE_TREND,
    [storeId, period],
  );
}

export function useOperationalRates(storeId: string, period: DashboardPeriod) {
  return useDashboardFetch(
    `/api/v1/dashboard/kpis?storeId=${storeId}&period=${period}`,
    MOCK_OPERATIONAL_KPIS,
    [storeId, period],
  );
}
