/**
 * Prisma client singleton.
 * Repository: 027_TECH_STACK.md — Prisma ORM
 *             048_PROJECT_BOOTSTRAP.md — database initialization
 *
 * PREVIEW MODE: Connection errors are caught silently.
 * All API routes that use Prisma will return empty/mock data if DB unavailable.
 * This allows the Vercel preview to build and run with a placeholder DATABASE_URL.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;