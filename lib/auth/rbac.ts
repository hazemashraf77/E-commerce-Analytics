/**
 * RBAC foundation per 032_PERMISSION_MATRIX.md.
 *
 * Role names and hierarchy are taken verbatim from the documented Role
 * Hierarchy: Administrator → Manager → Finance → Inventory → Marketing
 * → Read Only. The full permission matrix (resource/action grants) is
 * implemented in the security sprint — ONLY the documented scaffold
 * exists here. No permissions are invented (CP-002).
 */

export const ROLES = [
  "ADMINISTRATOR",
  "MANAGER",
  "FINANCE",
  "INVENTORY",
  "MARKETING",
  "READ_ONLY",
] as const;

export type Role = (typeof ROLES)[number];

/** Lower index = higher authority, per the documented hierarchy. */
const HIERARCHY: readonly Role[] = ROLES;

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

/**
 * True when `actual` sits at or above `required` in the documented
 * hierarchy. Fine-grained grants come from the Permission Matrix sprint.
 */
export function hasRoleAtLeast(actual: Role, required: Role): boolean {
  return HIERARCHY.indexOf(actual) <= HIERARCHY.indexOf(required);
}
