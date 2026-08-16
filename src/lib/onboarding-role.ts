/**
 * The one-time role choice. The product model has no dual roles and no role
 * switching, so the only decisions here are "is this a role we accept" and
 * "where does that role land after onboarding".
 */

export const APP_ROLES = ["MUSICIAN", "CREATOR"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && (APP_ROLES as readonly string[]).includes(value);
}

/**
 * Where a signed-in account belongs once its role is known. Used both after a
 * first assignment and when a repeat call finds a role already set — a repeat
 * caller is sent to their own home rather than being told the write failed.
 */
export function roleDestination(role: AppRole): string {
  return role === "MUSICIAN" ? "/profile/create" : "/gigs/manage";
}
