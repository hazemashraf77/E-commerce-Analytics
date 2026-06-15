/**
 * POST /api/v1/finance/adjustments
 * Creates a financial adjustment. "Every adjustment requires: Reason, User, Timestamp." (007)
 * Auth: FINANCE minimum (032)
 */
import { type NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { created, validationError } from "@/lib/api/response";
import { CreateAdjustmentSchema } from "@/lib/api/schemas";
import { prisma } from "@/lib/db/prisma";

async function handler(request: NextRequest, auth: AuthContext) {
  let body: unknown;
  try { body = await request.json(); } catch { return validationError("Request body must be valid JSON"); }

  const parsed = CreateAdjustmentSchema.safeParse(body);
  if (!parsed.success) return validationError("Invalid adjustment data", { issues: parsed.error.issues });

  const { orderId, adjustmentType, amount, reason, notes, occurredAt } = parsed.data;

  const adjustment = await prisma.financialAdjustment.create({
    data: {
      orderId: orderId ?? null,
      adjustmentType,
      amount,
      reason,
      notes: notes ?? null,
      createdBy: auth.userId,
      occurredAt: new Date(occurredAt),
    },
  });

  return created({ adjustmentId: adjustment.id, amount: adjustment.amount, reason: adjustment.reason });
}

export const POST = withAuth(handler, "FINANCE");
