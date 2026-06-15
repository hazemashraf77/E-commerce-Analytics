/**
 * Adapter contract types.
 * Repository: 012_API_ARCHITECTURE.md — Responsibilities of an Adapter,
 *             004_CANONICAL_DATA_MODEL.md — canonical entities.
 *
 * Rules enforced here:
 *  • Adapters never calculate KPIs, profit, or FIFO (012)
 *  • Business Engines never understand provider-specific payloads (012)
 *  • Every provider has its own independent adapter (012)
 */

import type {
  Order,
  OrderItem,
  Shipment,
  Settlement,
  Campaign,
  MarketingSpend,
} from "@prisma/client";

// ── Provider identity ──────────────────────────────────────────────────────

/** Supported providers per 012: SUPPORTED PROVIDERS (VERSION 1) */
export type Provider = "EAZY_ORDER" | "BOSTA" | "META" | "TIKTOK";

/** Sync scope maps to the documented execution dependency order (013) */
export type SyncScope = "ORDERS" | "SHIPMENTS" | "SETTLEMENTS" | "MARKETING";

// ── Error classification ───────────────────────────────────────────────────

/** Per 012: ERROR HANDLING — error types with recommended recovery */
export type AdapterErrorType =
  | "AUTHENTICATION_ERROR"
  | "RATE_LIMIT_ERROR"
  | "NETWORK_ERROR"
  | "VALIDATION_ERROR"
  | "PROVIDER_ERROR"
  | "TIMEOUT_ERROR"
  | "UNKNOWN_ERROR";

export interface AdapterError {
  type: AdapterErrorType;
  message: string;
  retryable: boolean; // false for VALIDATION_ERROR, AUTHENTICATION_ERROR (non-retryable per 013)
  providerCode?: string;
  raw?: unknown;
}

// ── Sync result ────────────────────────────────────────────────────────────

export interface SyncResult<T> {
  success: boolean;
  records: T[];
  totalFetched: number;
  errors: AdapterError[];
  cursor?: string; // for incremental sync (013: CHANGE DETECTION)
  rateLimitRemaining?: number;
}

// ── Canonical output types per adapter ────────────────────────────────────

export type CanonicalOrder = Omit<Order, "id" | "createdAt" | "updatedAt" | "importedAt">;
export type CanonicalOrderItem = Omit<OrderItem, "id" | "createdAt" | "updatedAt">;
export type CanonicalShipment = Omit<Shipment, "id" | "createdAt" | "updatedAt" | "importedAt">;
export type CanonicalSettlement = Omit<Settlement, "id" | "createdAt" | "updatedAt" | "importedAt">;
export type CanonicalCampaign = Omit<Campaign, "id" | "createdAt" | "updatedAt" | "importedAt">;
export type CanonicalMarketingSpend = Omit<MarketingSpend, "id" | "createdAt" | "updatedAt" | "importedAt">;

// ── Adapter configuration ──────────────────────────────────────────────────

export interface AdapterConfig {
  provider: Provider;
  storeId: string;
  /** Supplied from env; adapters own auth entirely (012: AUTHENTICATION) */
  credentials: Record<string, string>;
  /** Configurable schedule per 013: SCHEDULED SYNCHRONIZATION */
  syncIntervalMs?: number;
  timeoutMs?: number;
}

// ── Core adapter interfaces per 012: RESPONSIBILITIES OF AN ADAPTER ────────

/** Base interface all adapters implement */
export interface IProviderAdapter {
  readonly provider: Provider;
  readonly storeId: string;

  /** Health check — used by monitoring (013: PROVIDER HEALTH) */
  ping(): Promise<boolean>;
}

/** Order provider adapter (Eazy Order) */
export interface IOrderAdapter extends IProviderAdapter {
  fetchOrders(options: FetchOptions): Promise<SyncResult<CanonicalOrder & { items: CanonicalOrderItem[] }>>;
}

/** Shipping provider adapter (Bosta) */
export interface IShippingAdapter extends IProviderAdapter {
  fetchShipments(options: FetchOptions): Promise<SyncResult<CanonicalShipment>>;
  fetchSettlements(options: FetchOptions): Promise<SyncResult<CanonicalSettlement>>;
}

/** Marketing provider adapter (Meta, TikTok) */
export interface IMarketingAdapter extends IProviderAdapter {
  fetchCampaigns(options: FetchOptions): Promise<SyncResult<CanonicalCampaign>>;
  fetchSpend(options: FetchOptions): Promise<SyncResult<CanonicalMarketingSpend>>;
}

// ── Fetch options (incremental + full sync) ────────────────────────────────

export interface FetchOptions {
  /** ISO date string — fetch records modified after this timestamp (013: INCREMENTAL IMPORT) */
  since?: string;
  /** Provider cursor for pagination (013: CHANGE DETECTION) */
  cursor?: string;
  limit?: number;
  /** Forces full re-import ignoring cursor (013: INITIAL IMPORT) */
  fullSync?: boolean;
}
