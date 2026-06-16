/**
 * GET /api/v1/formulas/inspect?id=FIN-001
 * Returns formula definition from the Formula Registry.
 * Repository: 068_FORMULA_ENGINE.md — Formula Inspector
 * Auth: READ_ONLY
 */
import { type NextRequest } from "next/server";
import { withAuth, type AuthContext } from "@/lib/api/middleware";
import { ok, notFound } from "@/lib/api/response";
import { getFormula, FORMULA_REGISTRY } from "@/modules/formula-engine";

async function handler(request: NextRequest, auth: AuthContext) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return ok(Object.values(FORMULA_REGISTRY), { requestId: auth.requestId, count: Object.keys(FORMULA_REGISTRY).length });
  }
  const formula = getFormula(id);
  if (!formula) return notFound(`Formula ${id}`);
  return ok(formula, { requestId: auth.requestId });
}

export const GET = withAuth(handler, "READ_ONLY");
