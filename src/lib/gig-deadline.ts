/**
 * Gig deadline semantics (MVP-05, issue #33).
 *
 * `gig.deadline` is a DATE, not a timestamp: a creator picks the last day they
 * want to hear from musicians, not an instant. So "expired" has to be decided by
 * comparing calendar days, and the only real question is whose calendar.
 *
 * The launch markets are all US cities spanning Central to Pacific, and the
 * servers run in UTC — where the date rolls over while it is still the deadline
 * day everywhere in the product. Pacific is the last US zone to turn over, so
 * evaluating "today" there keeps a gig actionable through the whole of its
 * deadline day for every user, at the cost of leaving it up for a few extra
 * hours in Central. Ending an opportunity early is the worse error of the two.
 */

export const GIG_DEADLINE_TIME_ZONE = "America/Los_Angeles";

const dateOnlyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: GIG_DEADLINE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Today in the deadline timezone as `YYYY-MM-DD` (en-CA formats exactly that). */
export function deadlineToday(now: Date = new Date()): string {
  return dateOnlyFormatter.format(now);
}

/**
 * A deadline as a plain `YYYY-MM-DD` string. Postgres DATE columns already come
 * back in that form; a `Date` is reduced to its calendar day in the deadline
 * timezone rather than in UTC, so a date picked in the evening does not shift.
 */
export function toDeadlineDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") {
    const trimmed = value.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) return dateOnlyFormatter.format(value);
  return null;
}

/** True once the deadline day has fully passed. The deadline day itself is not past. */
export function isDeadlinePast(
  value: Date | string | null | undefined,
  now: Date = new Date(),
): boolean {
  const deadline = toDeadlineDate(value);
  if (!deadline) return false;
  // ISO date strings compare correctly as strings.
  return deadline < deadlineToday(now);
}

/**
 * Whether a gig is still a live opportunity: open, and not past its deadline.
 * This is the single test used by discovery, the detail page, and the contact
 * controls, so "listed" and "contactable" cannot drift apart again.
 */
export function isGigActionable(
  gig: { status?: string | null; deadline?: string | null },
  now: Date = new Date(),
): boolean {
  if (gig.status !== "OPEN") return false;
  return !isDeadlinePast(gig.deadline, now);
}
