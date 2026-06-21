export function normalizeProductText(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s+/g, " ");
}

export function normalizeSku(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

export function isLikelySameProductName(a: string, b: string): boolean {
  const x = normalizeProductText(a);
  const y = normalizeProductText(b);

  if (!x || !y) return false;
  if (x === y) return true;

  return x.includes(y) || y.includes(x);
}

export function buildExternalIds(provider: string, externalId: string): Record<string, string> {
  return {
    [provider.trim().toUpperCase()]: externalId.trim(),
  };
}

export function getExternalId(
  externalIds: unknown,
  provider: string,
): string | null {
  if (!externalIds || typeof externalIds !== "object") return null;

  const map = externalIds as Record<string, unknown>;
  const value = map[provider] ?? map[provider.toUpperCase()] ?? map[provider.toLowerCase()];

  return typeof value === "string" && value.trim() ? value.trim() : null;
}