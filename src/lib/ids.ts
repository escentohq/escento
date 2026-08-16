/**
 * Public detail routes take a database id straight from the URL. Musician
 * profiles and gigs are keyed by `uuid`, so anything that is not a UUID reaches
 * Postgres as a malformed comparison and comes back as a `22P02` error — an
 * error boundary, not the branded 404 a stale or mistyped link deserves.
 *
 * Route segments check this before querying; the service layer treats `22P02`
 * as "no such row" as well, so a bad id is a 404 from either direction.
 */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

/** Postgres: invalid text representation (a malformed uuid, most often). */
export const INVALID_TEXT_REPRESENTATION = "22P02";

export function isMalformedIdError(error: { code?: string } | null | undefined): boolean {
  return error?.code === INVALID_TEXT_REPRESENTATION;
}
