/**
 * GET /api/v1/jobs/[jobId]
 * "Clients shall monitor completion using /api/v1/jobs/{jobId}" (029: LONG-RUNNING OPERATIONS)
 * Auth: READ_ONLY minimum
 */
import { type NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, notFound } from "@/lib/api/response";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

async function handler(request: NextRequest, auth: AuthContext, params?: Record<string, string>) {
  const jobId = params?.jobId;
  if (!jobId || !z.string().uuid().safeParse(jobId).success) {
    return notFound("Job");
  }

  const job = await prisma.syncJob.findUnique({
    where: { id: jobId },
    select: { id: true, provider: true, status: true, startedAt: true, completedAt: true, recordsFound: true, recordsSynced: true, recordsFailed: true, errorMessage: true },
  });

  if (!job) return notFound("Job");
  return ok(job, { requestId: auth.requestId });
}

export const GET = withAuth(handler, "READ_ONLY");
