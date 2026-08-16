import { describe, expect, it } from "vitest";

import { parseAdminEmails } from "@/lib/admin-auth";
import { clampText, compensationLabel, formatDate, projectTypeLabel, visibleTags } from "@/lib/display";
import {
  formLevelMessage,
  isValidEmail,
  isValidUrlOrEmpty,
  normalizeTagName,
  parseCsv,
  parseOptionalDate,
  parseOptionalInteger,
  pickEnum,
} from "@/lib/form-utils";
import { isMalformedIdError, isUuid } from "@/lib/ids";
import { displayLocation, distanceMiles, parseLocationSearch } from "@/lib/location";
import { getPasswordStrength, validatePassword } from "@/lib/password";
import { completedStepCount, nextIncompleteStep, nextStepAfter, previousStepBefore } from "@/lib/profile-progress";
import { filterSearchResults } from "@/lib/search";

/**
 * Pure logic where a subtle change is invisible in a browser. A wrong
 * `normalizeTagName` silently forks the tag taxonomy; a wrong `parseAdminEmails`
 * silently widens the admin allowlist. Neither shows up in an E2E screenshot.
 */

describe("normalizeTagName", () => {
  it("collapses whitespace and title-cases each word", () => {
    expect(normalizeTagName("  electric   GUITAR ")).toBe("Electric Guitar");
  });

  it("maps casing and spacing variants onto one canonical tag", () => {
    const canonical = normalizeTagName("Lead Guitar");
    for (const variant of ["lead guitar", "LEAD  GUITAR", " lead Guitar "]) {
      expect(normalizeTagName(variant)).toBe(canonical);
    }
  });

  it("title-cases after non-letter boundaries and keeps non-ASCII letters", () => {
    expect(normalizeTagName("r&b")).toBe("R&B");
    expect(normalizeTagName("hip-hop")).toBe("Hip-Hop");
    // Known limitation, pinned rather than silently changed: `\b` is an ASCII
    // word boundary, so an accented letter starts a new "word" and gets
    // upper-cased ("café" -> "CafÉ"). Changing this re-keys existing tag rows,
    // so it is a deliberate follow-up, not a drive-by fix.
    expect(normalizeTagName("café jazz")).toBe("CafÉ Jazz");
  });
});

describe("parseCsv", () => {
  it("splits, normalizes, and drops empties", () => {
    expect(parseCsv(" drums , , BASS guitar ")).toEqual(["Drums", "Bass Guitar"]);
  });

  it("returns an empty list for null and undefined", () => {
    expect(parseCsv(null)).toEqual([]);
    expect(parseCsv(undefined)).toEqual([]);
  });
});

describe("form-utils parsing", () => {
  it("parses optional integers, rejecting non-numeric input", () => {
    expect(parseOptionalInteger(" 12 ")).toBe(12);
    expect(parseOptionalInteger("")).toBeNull();
    expect(parseOptionalInteger("abc")).toBeNull();
  });

  it("parses optional dates at local midnight", () => {
    const parsed = parseOptionalDate("2026-03-04");
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(2);
    expect(parsed?.getDate()).toBe(4);
    expect(parseOptionalDate("not-a-date")).toBeNull();
    expect(parseOptionalDate("")).toBeNull();
  });

  it("only accepts enum values from the allowed list", () => {
    expect(pickEnum("PAID", ["PAID", "UNPAID"] as const)).toBe("PAID");
    expect(pickEnum("SOMETHING", ["PAID", "UNPAID"] as const)).toBeNull();
  });

  it("validates emails and http(s) URLs", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidUrlOrEmpty(null)).toBe(true);
    expect(isValidUrlOrEmpty("https://escento.app")).toBe(true);
    expect(isValidUrlOrEmpty("javascript:alert(1)")).toBe(false);
    expect(isValidUrlOrEmpty("escento.app")).toBe(false);
  });

  it("summarises multi-field errors and falls back for a single one", () => {
    expect(formLevelMessage({ a: "x", b: "y" }, "fallback")).toBe("Fix 2 fields to continue.");
    expect(formLevelMessage({ a: "x" }, "fallback")).toBe("fallback");
  });
});

describe("password rules", () => {
  it("requires 8 characters plus a letter and a number", () => {
    expect(validatePassword("short1")).toBe("Use at least 8 characters.");
    expect(validatePassword("alllettersnodigit")).toBe("Use at least one letter and one number.");
    expect(validatePassword("12345678")).toBe("Use at least one letter and one number.");
    expect(validatePassword("goodpass1")).toBeNull();
  });

  it("scores strength consistently with the requirement list", () => {
    expect(getPasswordStrength("").score).toBe(0);
    expect(getPasswordStrength("abc").score).toBe(0);
    expect(getPasswordStrength("abcd").label).toBe("Fair");
    expect(getPasswordStrength("password1").label).toBe("Strong");
    expect(getPasswordStrength("password1").requirements.every((r) => r.met)).toBe(true);
  });
});

describe("admin allowlist parsing", () => {
  it("lowercases and accepts comma, space, and newline separators", () => {
    expect([...parseAdminEmails("A@x.com, b@Y.com\nc@z.com")]).toEqual([
      "a@x.com",
      "b@y.com",
      "c@z.com",
    ]);
  });

  it("grants nobody when unset, empty, or malformed", () => {
    expect(parseAdminEmails(undefined).size).toBe(0);
    expect(parseAdminEmails("").size).toBe(0);
    expect(parseAdminEmails("not-an-email").size).toBe(0);
    // A bare domain must never be read as a wildcard.
    expect(parseAdminEmails("@escento.com").size).toBe(0);
  });
});

describe("search", () => {
  const rows = [
    { name: "Jazz Trumpet" },
    { name: "Blues Guitar" },
    { name: "Indie Rock Drummer" },
  ];
  const fields = (row: { name: string }) => [row.name];

  it("returns everything for an empty or too-short query", () => {
    expect(filterSearchResults(rows, "", fields)).toHaveLength(3);
    expect(filterSearchResults(rows, "a", fields)).toHaveLength(3);
  });

  it("matches substrings case- and punctuation-insensitively", () => {
    expect(filterSearchResults(rows, "jazz", fields)).toEqual([{ name: "Jazz Trumpet" }]);
    expect(filterSearchResults(rows, "BLUES!", fields)).toEqual([{ name: "Blues Guitar" }]);
  });

  it("tolerates a single typo but not an unrelated query", () => {
    expect(filterSearchResults(rows, "gitar", fields)).toEqual([{ name: "Blues Guitar" }]);
    expect(filterSearchResults(rows, "accordion", fields)).toEqual([]);
  });

  it("ranks exact substring matches ahead of near matches", () => {
    const mixed = [{ name: "Drumer Wanted" }, { name: "Drummer Wanted" }];
    const result = filterSearchResults(mixed, "drummer", (row) => [row.name]);
    expect(result[0]).toEqual({ name: "Drummer Wanted" });
  });
});

describe("location", () => {
  it("computes great-circle distance in miles", () => {
    // Austin -> Dallas is roughly 180 miles.
    const miles = distanceMiles(30.2672, -97.7431, 32.7767, -96.797);
    expect(miles).toBeGreaterThan(170);
    expect(miles).toBeLessThan(195);
    expect(distanceMiles(30.2672, -97.7431, 30.2672, -97.7431)).toBe(0);
  });

  it("renders the location label for each combination", () => {
    expect(displayLocation({ locationDisplayName: "Austin, TX", isRemote: true })).toBe(
      "Austin, TX · Remote available",
    );
    expect(displayLocation({ location: "Austin", isRemote: false })).toBe("Austin");
    expect(displayLocation({ isRemote: true })).toBe("Remote");
    expect(displayLocation({})).toBe("Location not specified");
  });

  it("only accepts radii the UI actually offers", () => {
    expect(parseLocationSearch({ radius: "25" }).radiusMiles).toBe(25);
    expect(parseLocationSearch({ radius: "999" }).radiusMiles).toBeNull();
    expect(parseLocationSearch({}).remoteFilter).toBe("include");
    expect(parseLocationSearch({ remote: "remote" }).remoteFilter).toBe("remote");
    expect(parseLocationSearch({ remote: "bogus" }).remoteFilter).toBe("include");
  });
});

describe("display helpers", () => {
  it("labels enum values and falls back to the raw value", () => {
    expect(compensationLabel("PAID")).toBeTruthy();
    expect(projectTypeLabel("NOT_A_TYPE")).toBeTruthy();
  });

  it("clamps long text on a boundary and leaves short text alone", () => {
    expect(clampText("short", 20)).toBe("short");
    const clamped = clampText("x".repeat(300), 50);
    expect(clamped).toBe(`${"x".repeat(49)}...`);
    expect(clampText("x".repeat(50), 50)).toHaveLength(50);
  });

  it("splits tags into a visible slice and a remainder count", () => {
    const { shown, hiddenCount } = visibleTags(["a", "b", "c", "d", "e"], 3);
    expect(shown).toEqual(["a", "b", "c"]);
    expect(hiddenCount).toBe(2);
    expect(visibleTags(["a"], 3).hiddenCount).toBe(0);
  });

  it("formats a date and tolerates null", () => {
    expect(formatDate(null)).toBeTruthy();
    expect(formatDate(new Date("2026-05-01T00:00:00Z"))).toMatch(/2026/);
  });
});

describe("profile wizard progress", () => {
  const empty = {
    displayName: "",
    school: null,
    locationDisplayName: null,
    yearsExperience: null,
    availabilityText: null,
    instagramUrl: null,
    youtubeUrl: null,
    spotifyUrl: null,
    soundcloudUrl: null,
    websiteUrl: null,
    instruments: [],
    genres: [],
  } satisfies Parameters<typeof completedStepCount>[0];

  it("walks the steps in order and stops at both ends", () => {
    expect(nextStepAfter("identity")).toBe("craft");
    expect(nextStepAfter("reach")).toBeNull();
    expect(previousStepBefore("craft")).toBe("identity");
    expect(previousStepBefore("identity")).toBeNull();
  });

  it("resumes at the first step holding nothing", () => {
    expect(nextIncompleteStep(empty)).toBe("identity");
    expect(completedStepCount(empty)).toBe(0);

    const named = { ...empty, displayName: "Ada" };
    expect(nextIncompleteStep(named)).toBe("craft");
    expect(completedStepCount(named)).toBe(1);
  });

  it("counts a step done on any single value, since later steps are skippable", () => {
    const withGenreOnly = { ...empty, displayName: "Ada", genres: ["Jazz"] };
    expect(nextIncompleteStep(withGenreOnly)).toBe("context");

    const complete = {
      ...empty,
      displayName: "Ada",
      instruments: ["Bass"],
      school: "UT",
      websiteUrl: "https://example.com",
    };
    expect(nextIncompleteStep(complete)).toBeNull();
    expect(completedStepCount(complete)).toBe(4);
  });

  it("treats a zero years-experience answer as answered", () => {
    const zeroYears = { ...empty, yearsExperience: 0 };
    expect(completedStepCount(zeroYears)).toBe(1);
  });
});

describe("isUuid", () => {
  it("accepts a canonical uuid in either case", () => {
    expect(isUuid("00000000-0000-4000-8000-000000000000")).toBe(true);
    expect(isUuid("A1B2C3D4-E5F6-4A7B-8C9D-0E1F2A3B4C5D")).toBe(true);
  });

  it("rejects the shapes that used to reach Postgres as 22P02", () => {
    for (const value of [
      "not-a-real-id",
      "",
      "00000000-0000-4000-8000-00000000000",
      "00000000-0000-4000-8000-0000000000000",
      "00000000_0000_4000_8000_000000000000",
      "zzzzzzzz-0000-4000-8000-000000000000",
      null,
      undefined,
      42,
    ]) {
      expect(isUuid(value)).toBe(false);
    }
  });
});

describe("isMalformedIdError", () => {
  it("recognises only the malformed-id Postgres code", () => {
    expect(isMalformedIdError({ code: "22P02" })).toBe(true);
    expect(isMalformedIdError({ code: "PGRST116" })).toBe(false);
    expect(isMalformedIdError(null)).toBe(false);
    expect(isMalformedIdError(undefined)).toBe(false);
  });
});
