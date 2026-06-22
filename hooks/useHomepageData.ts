"use client";
/**
 * useHomepageData — fetches GET /api/v1/homepage
 *
 * Repository: 075_HOMEPAGE_CONTRACT.md — "Backend is single source of truth"
 * Repository: 077_IMPLEMENTATION_RULES.md — "No mock data. No frontend calculations."
 *
 * Re-fetches when storeId, from, to, filter, or view change.
 * Exposes loading / error / empty states per 077: LOADING STATES.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { KpiCard, SmartFilterCount, SmartPriority, AovSummary } from "@/services/homepage.service";
import type { ProductKpiRow } from "@/modules/formula-engine";

export type HomepageView = "executive" | "finance" | "marketing" | "inventory" | "shipping" | "orders" | "all";
export type HomepageFilter =
  | "all" | "profitable" | "loss_making" | "high_cpa" | "low_roas"
  | "opportunity" | "high_returns" | "low_delivery" | "low_stock"
  | "dead_stock" | "slow_moving" | "fast_moving" | "needs_review"
  | "profit_leak" | "inventory_risk";

export interface HomepageData {
  kpiCards:      KpiCard[];
  smartFilters:  SmartFilterCount[];
  smartPriority: SmartPriority | null;
  products:      ProductKpiRow[];
  aov:           AovSummary;
  meta: {
    view:             string;
    filter:           string;
    productCount:     number;
    totalProductCount:number;
    computedAt:       string;
    periodDays:       number;
    from:             string;
    to:               string;
    source:           string;
  };
}

export type FetchStatus = "idle" | "loading" | "success" | "error" | "empty";

interface UseHomepageDataOptions {
  storeId:   string | null;
  from:      Date;
  to:        Date;
  filter:    HomepageFilter;
  view:      HomepageView;
  /** Bump this to force a refresh (e.g. after sync) */
  refreshKey?: number;
}

interface UseHomepageDataResult {
  data:    HomepageData | null;
  status:  FetchStatus;
  error:   string | null;
  refetch: () => void;
}

export function useHomepageData(opts: UseHomepageDataOptions): UseHomepageDataResult {
  const [data,   setData]   = useState<HomepageData | null>(null);
  const [status, setStatus] = useState<FetchStatus>("idle");
  const [error,  setError]  = useState<string | null>(null);

  // Abort controller ref — cancel in-flight requests on param change
  const abortRef = useRef<AbortController | null>(null);

  const fetch_ = useCallback(async () => {
    if (!opts.storeId) {
    setData(null);
    setError(null);
    setStatus("empty");
    return;
}

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setError(null);

    const qs = new URLSearchParams({
    storeId: opts.storeId,
    from: opts.from.toISOString(),
    to: opts.to.toISOString(),
    filter: opts.filter,
    view: opts.view,
    refresh: String(opts.refreshKey ?? 0),
});

    try {
      const res = await fetch(`/api/v1/homepage?${qs.toString()}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `API ${res.status}`);
      }

      const json = await res.json() as { data?: HomepageData; success?: boolean };
     const payload = json.data;

if (!payload) {
  throw new Error("Homepage payload missing");
}

      if (!payload || !payload.products) {
        throw new Error("Unexpected API response shape");
      }

      setData(payload);
      setStatus(payload.products.length === 0 ? "empty" : "success");
    } catch (err) {
      if ((err as Error).name === "AbortError") return; // intentional cancel
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setStatus("error");
    }
  }, [opts.storeId, opts.from.toISOString(), opts.to.toISOString(), opts.filter, opts.view, opts.refreshKey]);

  useEffect(() => {
    fetch_();
    return () => { abortRef.current?.abort(); };
  }, [fetch_]);

  return { data, status, error, refetch: fetch_ };
}
