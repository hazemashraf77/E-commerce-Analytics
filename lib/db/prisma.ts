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
import { createLogger } from "@/lib/logger";

const logger = createLogger("Database");

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]   // reduced from ["query","warn","error"] to cut noise
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Lazy connect — do not block module load or throw on missing DB
// Preview: DATABASE_URL is a placeholder; connection will fail silently
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("placeholder")) {
  prisma.$connect().catch((err: unknown) => {
    logger.error("Database connection failed — API routes will return empty data", {
      metadata: { error: String(err) },
    });
  });
}

export default prisma;
