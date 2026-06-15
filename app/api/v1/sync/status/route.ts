import { NextResponse } from "next/server";
import { getQueueStats, getDeadLetterQueue } from "@/modules/synchronization-engine/queue/job.queue";
import { getProviderHealth } from "@/modules/synchronization-engine/application/sync.engine";
import type { ApiResponse } from "@/types";

/**
 * GET /api/v1/sync/status
 * Returns queue statistics and provider health (013: SYNCHRONIZATION MONITORING).
 * Repository: 029_API_SPECIFICATION.md — versioned /api/v1 prefix.
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  const stats = getQueueStats();
  const health = getProviderHealth();
  const dlq = getDeadLetterQueue();

  return NextResponse.json({
    success: true,
    data: {
      queues: stats,
      providers: health,
      deadLetterCount: dlq.length,
    },
  });
}
