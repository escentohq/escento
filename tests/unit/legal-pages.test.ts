import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * The three required-consent pages (MVP-06, issues #36/#37/#38). A placeholder
 * here is a signup lie: the form already asks people to agree to documents that
 * used to say they were being prepared.
 */

const root = process.cwd();

function page(name: "terms" | "privacy" | "compliance"): string {
  return readFileSync(join(root, "src", "app", name, "page.tsx"), "utf8");
}

describe("legal pages have current copy", () => {
  for (const name of ["terms", "privacy", "compliance"] as const) {
    it(`${name} is not a placeholder`, () => {
      const source = page(name);
      expect(source).not.toMatch(/being prepared/i);
      expect(source).toContain("LegalPage");
    });
  }

  it("privacy does not claim product behavior that is not in the MVP", () => {
    const source = page("privacy");
    expect(source).not.toMatch(/Stripe/i);
    expect(source).not.toMatch(/Facebook/i);
    expect(source).not.toMatch(/targeted advertising/i);
    expect(source).toMatch(/do not collect phone numbers/i);
    expect(source).toMatch(/Supabase/);
    expect(source).toMatch(/Resend/);
    expect(source).toMatch(/Vercel/);
    expect(source).toMatch(/Geoapify/);
  });

  it("compliance is acceptable use, not a certification claim", () => {
    const source = page("compliance");
    expect(source).toMatch(/Acceptable Use/);
    expect(source).toMatch(/not a certification/i);
  });
});
