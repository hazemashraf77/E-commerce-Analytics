import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

/**
 * GET /api/v1/health
 * Bootstrap health endpoint.
 * Per 029_API_SPECIFICATION.md: versioned /api/v1 prefix, JSON response.
 * Business data endpoints are added in their respective engine sprints.
 */
export async function GET(): Promise<NextResponse<ApiResponse<{ status: string }>>> {
  return NextResponse.json({
    success: true,
    data: { status: "ok" },
  });
}
