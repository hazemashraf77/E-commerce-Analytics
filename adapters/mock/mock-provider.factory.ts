/**
 * Mock provider factory.
 * Repository: IR-001, CP-018 — all integration runs against mocks until
 *             real credentials are provided.
 *
 * Usage:
 *   const adapters = createMockAdapters(storeId);
 *   registerAdapter(adapters.eazyOrder);
 *   registerAdapter(adapters.bosta);
 *   registerAdapter(adapters.meta);
 *   registerAdapter(adapters.tiktok);
 */

import { MockEazyOrderAdapter } from "@/adapters/eazy-order/mock-eazy-order.adapter";
import { MockBostaAdapter } from "@/adapters/bosta/mock-bosta.adapter";
import { MockMetaAdapter } from "@/adapters/meta/mock-meta.adapter";
import { MockTikTokAdapter } from "@/adapters/tiktok/mock-tiktok.adapter";

export interface MockAdapterSet {
  eazyOrder: MockEazyOrderAdapter;
  bosta: MockBostaAdapter;
  meta: MockMetaAdapter;
  tiktok: MockTikTokAdapter;
}

export function createMockAdapters(storeId: string): MockAdapterSet {
  const baseConfig = { storeId, credentials: {} };

  return {
    eazyOrder: new MockEazyOrderAdapter({ ...baseConfig, provider: "EAZY_ORDER" }),
    bosta: new MockBostaAdapter({ ...baseConfig, provider: "BOSTA" }),
    meta: new MockMetaAdapter({ ...baseConfig, provider: "META" }),
    tiktok: new MockTikTokAdapter({ ...baseConfig, provider: "TIKTOK" }),
  };
}
