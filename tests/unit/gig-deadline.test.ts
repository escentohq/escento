import { describe, expect, it } from "vitest";

import {
  GIG_DEADLINE_TIME_ZONE,
  deadlineToday,
  isDeadlinePast,
  isGigActionable,
  toDeadlineDate,
} from "@/lib/gig-deadline";

/**
 * Deadline boundaries (MVP-05, issue #33). These are the cases a browser test
 * cannot pin down, because they depend on what "today" means: the audit found a
 * gig with a 2026-08-14 deadline still live and contactable on 2026-08-15.
 */

/** 2026-08-15, 06:00 UTC — still 2026-08-14 in the deadline timezone. */
const EARLY_UTC_MORNING = new Date("2026-08-15T06:00:00Z");
/** 2026-08-15, 20:00 UTC — 2026-08-15 in the deadline timezone. */
const UTC_EVENING = new Date("2026-08-15T20:00:00Z");

describe("deadlineToday", () => {
  it("uses the deadline timezone, not UTC", () => {
    expect(GIG_DEADLINE_TIME_ZONE).toBe("America/Los_Angeles");
    expect(deadlineToday(EARLY_UTC_MORNING)).toBe("2026-08-14");
    expect(deadlineToday(UTC_EVENING)).toBe("2026-08-15");
  });
});

describe("toDeadlineDate", () => {
  it("keeps a plain date string and trims a timestamp to its day", () => {
    expect(toDeadlineDate("2026-08-15")).toBe("2026-08-15");
    expect(toDeadlineDate("2026-08-15T00:00:00.000Z")).toBe("2026-08-15");
  });

  it("returns null for empty and unparseable values", () => {
    expect(toDeadlineDate(null)).toBeNull();
    expect(toDeadlineDate("")).toBeNull();
    expect(toDeadlineDate("not-a-date")).toBeNull();
    expect(toDeadlineDate(new Date("nope"))).toBeNull();
  });
});

describe("isDeadlinePast", () => {
  it("treats the deadline day itself as still open", () => {
    expect(isDeadlinePast("2026-08-15", UTC_EVENING)).toBe(false);
  });

  it("treats yesterday as past and tomorrow as future", () => {
    expect(isDeadlinePast("2026-08-14", UTC_EVENING)).toBe(true);
    expect(isDeadlinePast("2026-08-16", UTC_EVENING)).toBe(false);
  });

  it("does not expire a gig early just because UTC already rolled over", () => {
    // 06:00 UTC on the 15th is 23:00 on the 14th in the deadline timezone: a
    // gig due the 14th is still answerable for another hour.
    expect(isDeadlinePast("2026-08-14", EARLY_UTC_MORNING)).toBe(false);
  });

  it("never expires a gig that has no deadline", () => {
    expect(isDeadlinePast(null, UTC_EVENING)).toBe(false);
    expect(isDeadlinePast(undefined, UTC_EVENING)).toBe(false);
  });
});

describe("isGigActionable", () => {
  it("requires both an open status and a live deadline", () => {
    expect(isGigActionable({ status: "OPEN", deadline: "2026-08-15" }, UTC_EVENING)).toBe(true);
    expect(isGigActionable({ status: "OPEN", deadline: null }, UTC_EVENING)).toBe(true);
    expect(isGigActionable({ status: "OPEN", deadline: "2026-08-14" }, UTC_EVENING)).toBe(false);
    expect(isGigActionable({ status: "CLOSED", deadline: "2026-12-01" }, UTC_EVENING)).toBe(false);
  });
});
