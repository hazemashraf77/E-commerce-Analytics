/**
 * Mock provider factory.
 * Repository: IR-001, CP-018 — all integration runs against mocks until
 *             real credentials are provided.
 *             073_API_INTEGRATION_BIBLE.md — Mock Data, graceful fallback
 *
 * Used when credentials are absent (preview/development mode).
 * resolveProviderStatus() determines whether to use real or mock adapter.
 */

import { MockEazyOrderAdapter } from "@/adapters/eazy-order/mock-eazy-order.adapter";
import { MockBostaAdapter } from "@/adapters/bosta/mock-bosta.adapter";
import { MockMetaAdapter } from "@/adapters/meta/mock-meta.adapter";
import { MockTikTokAdapter } from "@/adapters/tiktok/mock-tiktok.adapter";
import { mockGoogleAdapter } from "@/adapters/google/mock-google.adapter";
import { resolveProviderStatus } from "@/modules/synchronization-engine/registry/provider.registry";

export interface MockAdapterSet {
  eazyOrder: MockEazyOrderAdapter;
  bosta: MockBostaAdapter;
  meta: MockMetaAdapter;
  tiktok: MockTikTokAdapter;
  google: typeof mockGoogleAdapter;
}

export function createMockAdapters(storeId: string): MockAdapterSet {
  const baseConfig = { storeId, credentials: {} };

  return {
    eazyOrder: new MockEazyOrderAdapter({ ...baseConfig, provider: "EAZY_ORDER" }),
    bosta:     new MockBostaAdapter({ ...baseConfig, provider: "BOSTA" }),
    meta:      new MockMetaAdapter({ ...baseConfig, provider: "META" }),
    tiktok:    new MockTikTokAdapter({ ...baseConfig, provider: "TIKTOK" }),
    google:    mockGoogleAdapter,
  };
}

/**
 * Return true when all providers should use mock data.
 * True when NEXT_PUBLIC_SUPABASE_URL contains "placeholder" (preview mode).
 */
export function isPreviewMode(): boolean {
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
  );
}

/**
 * Check whether a specific provider is in mock mode.
 * Uses the Provider Registry to inspect required credentials.
 */
export function isProviderMocked(provider: "EAZY_ORDER" | "BOSTA" | "META" | "TIKTOK" | "GOOGLE"): boolean {
  return resolveProviderStatus(provider) === "MOCK";
}
