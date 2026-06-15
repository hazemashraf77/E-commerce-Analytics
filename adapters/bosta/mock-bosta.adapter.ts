/**
 * Mock Bosta Adapter.
 * Repository: IR-001, CP-018 — mock until real credentials available
 *             000_CLAUDE_MASTER_INSTRUCTIONS — mock data: include hard cases
 *             (returns, exchanges, delivery failures)
 */

import type {
  IShippingAdapter,
  SyncResult,
  FetchOptions,
  AdapterConfig,
  CanonicalShipment,
  CanonicalSettlement,
} from "@/modules/synchronization-engine/types/adapter.types";
import type { BostaRawShipment, BostaRawSettlement } from "./types/bosta.types";
import { mapBostaShipmentToCanonical, mapBostaSettlementToCanonical } from "./mappers/bosta.mapper";
import { createLogger } from "@/lib/logger";

const logger = createLogger("MockBostaAdapter");

// ── Mock data — hard cases included per 000_CLAUDE_MASTER_INSTRUCTIONS ─────

const MOCK_SHIPMENTS: BostaRawShipment[] = [
  {
    _id: "BST-001", order_id: "EO-001",
    state: 60,  // DELIVERED
    zone: "Cairo", delivery_date: "2024-01-12T15:00:00Z",
    pricing: { total: 45, cod_amount: 1197 },
  },
  {
    _id: "BST-002", order_id: "EO-002",
    state: 70,  // RETURNED — hard case
    zone: "Giza",
    delivery_date: "2024-01-13T10:00:00Z",
    return_date: "2024-01-14T09:00:00Z",
    pricing: { total: 45, cod_amount: 0 },
  },
  {
    _id: "BST-003", order_id: "EO-003",
    state: 60,  // DELIVERED
    zone: "Alexandria", delivery_date: "2024-01-14T14:00:00Z",
    pricing: { total: 55, cod_amount: 0 },
  },
  {
    _id: "BST-004", order_id: "EO-004",
    state: 80,  // CANCELLED — hard case
    zone: "Cairo",
    pricing: { total: 0, cod_amount: 0 },
  },
  {
    _id: "BST-005", order_id: "EO-005",
    state: 40,  // OUT_FOR_DELIVERY
    zone: "Cairo",
    pricing: { total: 45, cod_amount: 897 },
  },
];

const MOCK_SETTLEMENTS: BostaRawSettlement[] = [
  {
    settlement_id: "SETTLE-001",
    date: "2024-01-20T00:00:00Z",
    expected_amount: 1242,
    actual_amount: 1197,  // difference: settlement reconciliation test case
    charges: { shipping: 90, returns: 45, exchanges: 0, additional: 0 },
    net_transfer: 1062,
  },
];

// ── Adapter ────────────────────────────────────────────────────────────────

export class MockBostaAdapter implements IShippingAdapter {
  readonly provider = "BOSTA" as const;
  readonly storeId: string;

  // orderIdMap injected by SyncService after orders are imported
  private orderIdMap: Map<string, string> = new Map();

  constructor(config: AdapterConfig) {
    this.storeId = config.storeId;
  }

  /** Called by SyncService once orders are written to DB */
  setOrderIdMap(map: Map<string, string>): void {
    this.orderIdMap = map;
  }

  async ping(): Promise<boolean> {
    return true;
  }

  async fetchShipments(options: FetchOptions): Promise<SyncResult<CanonicalShipment>> {
    logger.info("Mock Bosta fetchShipments called", { metadata: { ...options } });

    let source = MOCK_SHIPMENTS;
    if (options.since && !options.fullSync) {
      const sinceDate = new Date(options.since);
      source = MOCK_SHIPMENTS.filter(
        (s) => s.delivery_date && new Date(s.delivery_date) > sinceDate,
      );
    }

    const records: CanonicalShipment[] = [];
    for (const raw of source) {
      const canonical = mapBostaShipmentToCanonical(raw, this.orderIdMap);
      if (canonical) records.push(canonical);
    }

    return { success: true, records, totalFetched: records.length, errors: [] };
  }

  async fetchSettlements(options: FetchOptions): Promise<SyncResult<CanonicalSettlement>> {
    logger.info("Mock Bosta fetchSettlements called", { metadata: { ...options } });
    const records = MOCK_SETTLEMENTS.map(mapBostaSettlementToCanonical);
    return { success: true, records, totalFetched: records.length, errors: [] };
  }
}
