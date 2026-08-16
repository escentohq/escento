import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Closed gigs keep a linked detail page (MVP-05, issue #34).
 *
 * The regression this guards is specific: anonymous gig visibility was gated on
 * `status = 'OPEN'`, which conflated moderation ("may this row be seen") with
 * lifecycle ("is this call still taking replies"). Closing a gig therefore 404'd
 * its own detail page — including for the creator, who is read through the
 * cookie-free public client. Directory listings filter the lifecycle themselves,
 * so the policy does not need to.
 */

const root = process.cwd();
const migrationsDir = join(root, "supabase", "migrations");

/** The last definition wins in migration order, so that is the live one. */
function effectiveGigVisibilityFunction(): string {
  const definitions = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .flatMap((file) => {
      const sql = readFileSync(join(migrationsDir, file), "utf8");
      return [...sql.matchAll(/create or replace function public\.marketplace_gig_is_public[\s\S]*?\$\$;/gi)]
        .map((match) => match[0]);
    });

  expect(definitions.length).toBeGreaterThan(0);
  return definitions[definitions.length - 1];
}

describe("anonymous gig visibility", () => {
  it("is decided by moderation, not by lifecycle status", () => {
    const definition = effectiveGigVisibilityFunction();
    expect(definition).toContain("is_public = true");
    expect(definition).toContain("moderation_status = 'active'");
    expect(definition).toContain("marketplace_user_is_public");
    expect(definition).not.toMatch(/status\s*=\s*'OPEN'/i);
  });
});

describe("closed gig detail", () => {
  const page = readFileSync(join(root, "src", "app", "gigs", "[id]", "page.tsx"), "utf8");

  it("renders a filled state and withholds the gig-context contact action", () => {
    expect(page).toContain("Call filled");
    // Contact controls are conditional on the gig still being answerable.
    expect(page).toMatch(/acceptingContact\s*\?\s*\(\s*<GigContactActions/);
  });
});
