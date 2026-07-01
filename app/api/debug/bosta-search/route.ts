import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";

const BOSTA_BASE = "https://app.bosta.co/api/v2";

type TestResult = {
  name: string;
  ok: boolean;
  status?: number;
  count?: number | null;
  listLength?: number | null;
  sampleKeys?: string[];
  sample?: unknown;
  error?: string;
  bodyPreview?: string;
};

async function tryRequest(name: string, apiKey: string, init: RequestInit): Promise<TestResult> {
  try {
    const res = await fetch(`${BOSTA_BASE}/deliveries/search`, {
      ...init,
      headers: {
        Authorization: apiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init.headers as Record<string, string> | undefined),
      },
      cache: "no-store",
    });

    const text = await res.text();

    if (!res.ok) {
      return {
        name,
        ok: false,
        status: res.status,
        bodyPreview: text.slice(0, 500),
      };
    }

    const json = JSON.parse(text);
    const list = json?.data?.list ?? json?.data?.deliveries ?? json?.list ?? [];
    const sample = Array.isArray(list) ? list[0] : null;

    return {
      name,
      ok: true,
      status: res.status,
      count: json?.data?.count ?? json?.count ?? null,
      listLength: Array.isArray(list) ? list.length : null,
      sampleKeys: sample && typeof sample === "object" ? Object.keys(sample).slice(0, 40) : [],
      sample,
      businessReference:
    sample?.businessReference ??
    sample?.business_reference ??
    sample?.merchantReference ??
    sample?.merchant_reference ??
    sample?.merchantOrderId ??
    sample?.merchant_order_id ??
    sample?.orderId ??
    sample?.order_id ??
    sample?.reference,
    };
  } catch (err) {
    return {
      name,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function GET() {
  const env = getServerEnv();

  if (!env.BOSTA_API_KEY) {
    return NextResponse.json({
      success: false,
      error: "BOSTA_API_KEY missing",
    }, { status: 500 });
  }

  const tests = await Promise.all([
    tryRequest("body_page_pageSize", env.BOSTA_API_KEY, {
      method: "POST",
      body: JSON.stringify({ page: 0, pageSize: 20 }),
    }),

    tryRequest("body_page_limit", env.BOSTA_API_KEY, {
      method: "POST",
      body: JSON.stringify({ page: 0, limit: 20 }),
    }),

    tryRequest("body_skip_limit", env.BOSTA_API_KEY, {
      method: "POST",
      body: JSON.stringify({ skip: 0, limit: 20 }),
    }),

    tryRequest("body_no_pagination", env.BOSTA_API_KEY, {
      method: "POST",
      body: JSON.stringify({}),
    }),

    tryRequest("query_page_pageSize_empty_body", env.BOSTA_API_KEY, {
      method: "POST",
      body: JSON.stringify({}),
    }),

    tryRequest("body_states_empty", env.BOSTA_API_KEY, {
      method: "POST",
      body: JSON.stringify({ page: 0, pageSize: 20, states: [] }),
    }),

    tryRequest("body_type_forward", env.BOSTA_API_KEY, {
      method: "POST",
      body: JSON.stringify({ page: 0, pageSize: 20, type: "SEND" }),
    }),

    tryRequest("body_state_delivered", env.BOSTA_API_KEY, {
      method: "POST",
      body: JSON.stringify({ page: 0, pageSize: 20, state: 45 }),
    }),
  ]);

  return NextResponse.json({
    success: true,
    testedAt: new Date().toISOString(),
    results: tests,
  });
}