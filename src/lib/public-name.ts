/**
 * The public-facing name on `app_user`. Creators have no profile page, so this
 * is what a musician sees on a gig and in a connection request. Empty or
 * whitespace-only values used to publish as "Unknown creator".
 */

export const PUBLIC_NAME_MAX_LENGTH = 80;

export const PUBLIC_NAME_REQUIRED = "Add the name musicians should see.";
export const PUBLIC_NAME_TOO_LONG = `Keep the name under ${PUBLIC_NAME_MAX_LENGTH} characters.`;

/** Account settings, with a reason the page can turn into a completion prompt. */
export const ACCOUNT_NAME_PATH = "/account?reason=name";

export function hasPublicName(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Shared by signup and the account name form so the two paths cannot drift:
 * a name that signup accepts is a name the account page will keep.
 */
export function validatePublicName(value: unknown): { name: string; error?: string } {
  const name = typeof value === "string" ? value.trim() : "";
  if (!name) return { name, error: PUBLIC_NAME_REQUIRED };
  if (name.length > PUBLIC_NAME_MAX_LENGTH) return { name, error: PUBLIC_NAME_TOO_LONG };
  return { name };
}
