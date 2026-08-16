/**
 * Validation for any user-supplied redirect target (`?next=`, `?callbackUrl=`).
 *
 * `startsWith("/")` alone is not enough: `//evil.com` and `/\evil.com` are both
 * protocol-relative and send the browser off-site. Everything that redirects to
 * a caller-supplied path goes through here so the three call sites cannot drift.
 */
export function safeInternalPath(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/")) return fallback;
  // Second character decides: "//host" and "/\host" are protocol-relative.
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
