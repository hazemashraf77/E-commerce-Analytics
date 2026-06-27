import { NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, notFound, validationError } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

async function GETHandler(
  request: NextRequest,
  auth: AuthContext,
  params?: Record<string, string>,
) {
  if (!params?.id) {
    return validationError("Product id required");
  }

  console.log("SEARCHING FOR:", params.id);

  console.log(
  await prisma.product.findMany({
    select: {
      id: true,
      isDeleted: true,
    },
  }),
);

  const product = await prisma.product.findFirst({
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
