/**
 * EasyOrders API client.
 * Production HTTP client — no mock, no placeholder responses.
 *
 * Confirmed API base:
 *   https://api.easy-orders.net/api/v1
 *
 * Auth:
 *   Api-Key: <EAZY_ORDER_API_KEY>
 */

import { createLogger } from "@/lib/logger";
import type {
  EazyOrderRawOrder,
  EazyOrderRawProduct,
  EazyOrderRawCustomer,
} from "../types/eazy-order.types";

const logger = createLogger("EasyOrdersClient");

const EAZY_BASE_URL = "https://api.easy-orders.net/api/v1";

interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}

type EazyListOrdersParams = {
  page?: number;
  per_page?: number;
  status?: string;
  updated_after?: string;
  created_after?: string;
};

type EazyListProductsParams = {
  page?: number;
  per_page?: number;
  updated_after?: string;
};

export class EasyOrdersClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(apiKey: string, storeUrl?: string) {
  this.apiKey = apiKey;
  this.baseUrl = EAZY_BASE_URL;
}

  private async request<T>(
    path: string,
    options: RequestInit = {},
    attempt = 1,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Api-Key": this.apiKey,
      "Accept": "application/json",
      "Content-Type": "application/json",
    };

    const res = await fetch(url, {
      ...options,
      headers: { ...headers, ...((options.headers as Record<string, string>) || {}) },
      signal: AbortSignal.timeout(30_000),
    });

    if (res.status === 429 && attempt <= 3) {
      const retryAfter = parseInt(res.headers.get("Retry-After") ?? "60", 10);
      logger.warn("EasyOrders rate limited — waiting", { metadata: { attempt, retryAfter } });
      await sleep(retryAfter * 1000);
      return this.request<T>(path, options, attempt + 1);
    }

    if ((res.status === 502 || res.status === 503 || res.status === 504) && attempt <= 3) {
      const delay = attempt * 5_000;
      logger.warn("EasyOrders transient error — retrying", {
        metadata: { status: res.status, attempt, delay },
      });
      await sleep(delay);
      return this.request<T>(path, options, attempt + 1);
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`EasyOrders API ${res.status}: ${body}`);
    }

    return res.json() as Promise<T>;
  }

  async *fetchOrders(params: EazyListOrdersParams = {}): AsyncGenerator<EazyOrderRawOrder[]> {
    let page = params.page ?? 1;
    const limit = params.per_page ?? 100;

    while (true) {
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(params.status ? { status: params.status } : {}),
        ...(params.updated_after ? { updated_after: params.updated_after } : {}),
        ...(params.created_after ? { created_after: params.created_after } : {}),
      });

      const response = await this.request<PaginatedResponse<EazyOrderRawOrder>>(
        `/orders?${qs.toString()}`
      );

      const rows = response.data ?? [];
      if (rows.length === 0) break;

      yield rows;

      const lastPage = response.meta?.last_page ?? page;
      if (page >= lastPage) break;

      page++;
      await sleep(200);
    }
  }

  async fetchOrder(orderId: string): Promise<EazyOrderRawOrder> {
    return this.request<EazyOrderRawOrder>(`/orders/${orderId}`);
  }

  async *fetchProducts(params: EazyListProductsParams = {}): AsyncGenerator<EazyOrderRawProduct[]> {
    let page = params.page ?? 1;
    const limit = params.per_page ?? 100;

    while (true) {
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(params.updated_after ? { updated_after: params.updated_after } : {}),
      });

      const response = await this.request<PaginatedResponse<EazyOrderRawProduct>>(
        `/products?${qs.toString()}`,
      );

      const rows = response.data ?? [];
      if (rows.length === 0) break;

      yield rows;

      const lastPage = response.meta?.last_page ?? page;
      if (page >= lastPage) break;

      page++;
      await sleep(200);
    }
  }

  async fetchCustomer(customerId: string): Promise<EazyOrderRawCustomer> {
    return this.request<EazyOrderRawCustomer>(`/customers/${customerId}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}