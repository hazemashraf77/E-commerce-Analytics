import { NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, notFound, validationError } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

async function GETHandler(
  request: NextRequest,
  auth: AuthContext,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: {
      id: params.id,
      isDeleted: false,
    },
  });

  if (!product) {
    return notFound("Product not found");
  }

  return ok(product, {
    requestId: auth.requestId,
  });
}

export const GET = withAuth(GETHandler, "READ_ONLY");