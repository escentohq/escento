/**
 * The role vocabulary. Since issue #6 an account can hold both capabilities, so
 * these two strings name a capability as much as they name a first choice: they
 * are what `app_user.role` stores (the immutable first claim) and what
 * `AppSession.capabilities` is an array of. The decisions here stay the same —
 * "is this a role we accept" and "where does it land after onboarding".
 */

export const APP_ROLES = ["MUSICIAN", "CREATOR"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && (APP_ROLES as readonly string[]).includes(value);
}

/**
 * Where a signed-in account belongs once a capability is known. Used after a
 * first assignment, after a later capability grant, and when a repeat call finds
 * a role already set — a repeat caller is sent to their own home rather than
 * being told the write failed.
 */
export function roleDestination(role: AppRole): string {
  return role === "MUSICIAN" ? "/profile/create" : "/gigs/manage";
}
