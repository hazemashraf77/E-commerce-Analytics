import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enqueueSyncJob } from "@/modules/synchronization-engine/queue/job.queue";
import type { ApiResponse } from "@/types";

const TriggerSchema = z.object({
  provider: z.enum(["EAZY_ORDER", "BOSTA", "META", "TIKTOK"]),
  scope: z.enum(["ORDERS", "SHIPMENTS", "SETTLEMENTS", "MARKETING"]),
  storeId: z.string().uuid(),
  fullSync: z.boolean().optional().default(false),
});

/**
 * POST /api/v1/sync/trigger
 * Manual sync trigger (013: MANUAL SYNCHRONIZATION).
 * Enqueues a job — returns immediately; processing is async (013: BACKGROUND EXECUTION).
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: { code: "INVALID_JSON", message: "Request body must be valid JSON" } }, { status: 400 });
  }

  const parsed = TriggerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_FAILED", message: parsed.error.message } },
      { status: 400 },
    );
  }

  const job = enqueueSyncJob({
    ...parsed.data,
    triggeredBy: "MANUAL",
  });

  return NextResponse.json({
    success: true,
    data: { jobId: job.jobId, status: job.status, jobType: job.jobType },
  });
}
