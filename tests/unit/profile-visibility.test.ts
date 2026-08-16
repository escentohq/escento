import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Incomplete musician drafts stay off anonymous inventory (MVP-08, issue #28).
 *
 * The trust boundary is `marketplace_profile_is_public`. If that function stops
 * requiring launch readiness, a name-only row is listed again and nothing in a
 * happy-path browser test that only creates complete profiles would notice.
 */

const root = process.cwd();
const migrationsDir = join(root, "supabase", "migrations");

function effectiveProfileVisibilityFunction(): string {
  const definitions = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .flatMap((file) => {
      const sql = readFileSync(join(migrationsDir, file), "utf8");
      return [...sql.matchAll(/create or replace function "?public"?\."?marketplace_profile_is_public[\s\S]*?\$\$;/gi)]
        .map((match) => match[0]);
    });

  expect(definitions.length).toBeGreaterThan(0);
  return definitions[definitions.length - 1];
}

describe("anonymous profile visibility", () => {
  it("requires launch readiness in addition to moderation", () => {
    const definition = effectiveProfileVisibilityFunction();
    expect(definition).toContain("is_public = true");
    expect(definition).toContain("moderation_status = 'active'");
    expect(definition).toContain("marketplace_user_is_public");
    expect(definition).toContain("musician_profile_is_launch_ready");
  });

  it("ships the readiness function as a migration", () => {
    const sql = readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .map((file) => readFileSync(join(migrationsDir, file), "utf8"))
      .join("\n");
    expect(sql).toContain("musician_profile_is_launch_ready");
  });
});
