import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { resolveActiveView, surfaceForView } from "@/lib/active-view";
import type { AppRole } from "@/lib/onboarding-role";

const BOTH: AppRole[] = ["MUSICIAN", "CREATOR"];

describe("resolveActiveView", () => {
  it("honors the cookie when the account holds that capability", () => {
    expect(resolveActiveView(BOTH, "CREATOR", "MUSICIAN")).toBe("CREATOR");
    expect(resolveActiveView(BOTH, "MUSICIAN", "CREATOR")).toBe("MUSICIAN");
  });

  /**
   * The whole security argument for the cookie being unsigned and unencrypted:
   * a value the account cannot back up is inert, so editing it gains nothing.
   */
  it("ignores a cookie naming a capability the account does not hold", () => {
    expect(resolveActiveView(["MUSICIAN"], "CREATOR", "MUSICIAN")).toBe("MUSICIAN");
    expect(resolveActiveView(["CREATOR"], "MUSICIAN", "CREATOR")).toBe("CREATOR");
  });

  it("falls back to the primary role, then to the only capability", () => {
    expect(resolveActiveView(BOTH, undefined, "CREATOR")).toBe("CREATOR");
    expect(resolveActiveView(["MUSICIAN"], undefined, null)).toBe("MUSICIAN");
    // A primary role the account somehow no longer holds is skipped.
    expect(resolveActiveView(["CREATOR"], undefined, "MUSICIAN")).toBe("CREATOR");
  });

  it("returns null when onboarding has not happened", () => {
    expect(resolveActiveView([], "CREATOR", null)).toBeNull();
    expect(resolveActiveView([], undefined, undefined)).toBeNull();
  });

  it("rejects junk cookie values instead of trusting them", () => {
    for (const value of ["", "musician", "ADMIN", "MUSICIAN,CREATOR", "null", undefined, null]) {
      expect(resolveActiveView(BOTH, value, "MUSICIAN")).toBe("MUSICIAN");
    }
  });
});

describe("surfaceForView", () => {
  /** Inverted on purpose: a musician is looking for work, a creator for players. */
  it("opens each mode on the other side's directory", () => {
    expect(surfaceForView("MUSICIAN")).toBe("gigs");
    expect(surfaceForView("CREATOR")).toBe("musicians");
    expect(surfaceForView(null)).toBe("musicians");
  });
});

describe("the view cannot reach the auth guards", () => {
  /**
   * `eslint.config.mjs` enforces this too. Both are kept: the lint rule fails the
   * build, this states why in a place someone reading the auth tests will see.
   */
  it("auth-guards.ts never reads the active view", () => {
    // Comments in that file name the module on purpose, so match code, not prose:
    // an import of it, or any read of the cookie.
    const source = readFileSync(join(process.cwd(), "src/lib/auth-guards.ts"), "utf8");
    expect(source, "auth-guards.ts imports the active view").not.toMatch(
      /^\s*import[^\n]*["']@\/lib\/active-view["']/m,
    );
    expect(source, "auth-guards.ts reads the view cookie").not.toMatch(/ACTIVE_VIEW_COOKIE\b(?!`)/);
    expect(source, "auth-guards.ts reads cookies directly").not.toMatch(/\bcookies\s*\(/);
  });
});
