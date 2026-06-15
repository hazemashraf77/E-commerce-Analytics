import { z } from "zod";
import { AppError } from "./errors";

/**
 * Validation helpers per 048 (Shared Utilities). Business validation
 * RULES belong to Business Engines and the Canonical Validation layer
 * (004_CANONICAL_DATA_MODEL.md) — these helpers only execute schemas
 * provided by their owners.
 */
export function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown, context: string): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new AppError({
      code: "VALIDATION_FAILED",
      message: `Validation failed for ${context} — ${details}`,
      severity: "HIGH",
    });
  }
  return result.data;
}
