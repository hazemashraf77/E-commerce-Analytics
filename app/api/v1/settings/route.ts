/**
 * GET  /api/v1/settings?storeId=
 * PATCH /api/v1/settings  — upserts a store setting (ADMINISTRATOR only per 032)
 */
import { type NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, validationError } from "@/lib/api/response";
import { StoreIdSchema, UpdateSettingSchema } from "@/lib/api/schemas";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

async function getHandler(request: NextRequest, auth: AuthContext) {
  const parsed = z.object({ storeId: StoreIdSchema }).safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return validationError("storeId required");
  const settings = await prisma.setting.findMany({ where: { storeId: parsed.data.storeId } });
  return ok(settings, { requestId: auth.requestId });
}

async function patchHandler(request: NextRequest, auth: AuthContext) {
  let body: unknown;
  try { body = await request.json(); } catch { return validationError("Invalid JSON"); }
  const parsed = UpdateSettingSchema.safeParse(body);
  if (!parsed.success) return validationError("Invalid setting data", { issues: parsed.error.issues });
  const { storeId, key, value } = parsed.data;
  const setting = await prisma.setting.upsert({
    where: { storeId_key: { storeId, key } },
    update: { value },
    create: { storeId, key, value },
  });
  return ok(setting, { requestId: auth.requestId });
}

export const GET = withAuth(getHandler, "READ_ONLY");
export const PATCH = withAuth(patchHandler, "ADMINISTRATOR");
