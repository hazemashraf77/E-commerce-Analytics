/**
 * Mock EazyOrder Adapter.
 * Repository: 000_CLAUDE_MASTER_INSTRUCTIONS.md — Mock Data (must resemble real data)
 *             PROJECT_RULES — IR-001 (mocks until real), CP-018 (mock-first rule)
 *             012_API_ARCHITECTURE.md — IOrderAdapter contract
 *
 * "Mock data should resemble real business activity including hard cases:
 *  returns, exchanges, multiple FIFO layers." (000_CLAUDE_MASTER_INSTRUCTIONS)
 *
 * Replace this adapter with EazyOrderLiveAdapter in the Integration sprint.
 * Business Engines will not require any changes (012: API Adapter Architecture).
 */

import type {
  IOrderAdapter,
  SyncResult,
  FetchOptions,
  AdapterConfig,
} from "@/modules/synchronization-engine/types/adapter.types";
import type { CanonicalOrder, CanonicalOrderItem } from "@/modules/synchronization-engine/types/adapter.types";
import type { EazyOrderRawOrder } from "./types/eazy-order.types";
import { mapEazyOrderToCanonical } from "./mappers/eazy-order.mapper";
import { createLogger } from "@/lib/logger";

const logger = createLogger("MockEazyOrderAdapter");

// ── Seeded mock data (realistic per 000_CLAUDE_MASTER_INSTRUCTIONS) ────────

const MOCK_ORDERS: EazyOrderRawOrder[] = [
  {
    id: "EO-001",
    created_at: "2024-01-10T09:00:00Z",
    status: "delivered",
    payment_method: "cod",
    customer_shipping_fee: 50,
    marketing_source: "meta",
    campaign_id: "META-CAMP-001",
    items: [
      { product_id: "PROD-001", product_name: "Classic T-Shirt", sku: "TS-BLK-M", quantity: 2, unit_price: 299, discount: 0 },
      { product_id: "PROD-002", product_name: "Cargo Pants",     sku: "CP-KHK-L", quantity: 1, unit_price: 599, discount: 50 },
    ],
  },
  {
    id: "EO-002",
    created_at: "2024-01-11T10:30:00Z",
    status: "returned",  // hard case: return (000_CLAUDE_MASTER_INSTRUCTIONS)
    payment_method: "cod",
    customer_shipping_fee: 50,
    marketing_source: "tiktok",
    items: [
      { product_id: "PROD-001", product_name: "Classic T-Shirt", sku: "TS-WHT-S", quantity: 1, unit_price: 299, discount: 0 },
    ],
  },
  {
    id: "EO-003",
    created_at: "2024-01-12T14:00:00Z",
    status: "delivered",
    payment_method: "online",
    customer_shipping_fee: 0,
    marketing_source: "direct",
    items: [
      { product_id: "PROD-003", product_name: "Hoodie",          sku: "HD-GRY-XL", quantity: 1, unit_price: 799, discount: 100 },
    ],
  },
  {
    id: "EO-004",
    created_at: "2024-01-13T08:15:00Z",
    status: "cancelled",  // hard case: cancellation
    payment_method: "cod",
    customer_shipping_fee: 50,
    items: [
      { product_id: "PROD-002", product_name: "Cargo Pants",     sku: "CP-KHK-M", quantity: 1, unit_price: 599, discount: 0 },
    ],
  },
  {
    id: "EO-005",
    created_at: "2024-01-14T11:45:00Z",
    status: "shipped",
    payment_method: "cod",
    customer_shipping_fee: 50,
    marketing_source: "meta",
    campaign_id: "META-CAMP-002",
    items: [
      { product_id: "PROD-001", product_name: "Classic T-Shirt", sku: "TS-BLK-L", quantity: 3, unit_price: 299, discount: 0 },
    ],
  },
];

// ── Adapter implementation ─────────────────────────────────────────────────

export class MockEazyOrderAdapter implements IOrderAdapter {
  readonly provider = "EAZY_ORDER" as const;
  readonly storeId: string;
  private readonly config: AdapterConfig;

  constructor(config: AdapterConfig) {
    this.config = config;
    this.storeId = config.storeId;
  }

  async ping(): Promise<boolean> {
    logger.debug("Mock EazyOrder ping — always healthy", {
      metadata: { storeId: this.storeId },
    });
    return true;
  }

  async fetchOrders(
    options: FetchOptions,
  ): Promise<SyncResult<CanonicalOrder & { items: CanonicalOrderItem[] }>> {
    logger.info("Mock EazyOrder fetchOrders called", {
      metadata: { storeId: this.storeId, ...options },
    });

    // Simulate incremental sync: filter by `since` if provided
    let source = MOCK_ORDERS;
    if (options.since && !options.fullSync) {
      const sinceDate = new Date(options.since);
      source = MOCK_ORDERS.filter((o) => new Date(o.created_at) > sinceDate);
    }

    // Simulate pagination (limit defaults to 50)
    const limit = options.limit ?? 50;
    const page = source.slice(0, limit);

    const records = page.map((raw) => {
      const { order, items } = mapEazyOrderToCanonical(raw, this.storeId);
      return { ...order, items };
    });

    logger.info("Mock orders fetched", {
      metadata: { count: records.length, storeId: this.storeId },
    });

    return {
      success: true,
      records,
      totalFetched: records.length,
      errors: [],
      cursor: records.length < limit ? undefined : "mock-cursor-next-page",
    };
  }
}
