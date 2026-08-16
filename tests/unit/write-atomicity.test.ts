import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Repo invariants for the atomic marketplace writes (MVP-03, issues #30/#31).
 *
 * The behaviour itself needs a database and is covered by
 * `e2e/flows/write-atomicity.spec.ts`. What is worth failing a 90-second CI run
 * for is the regression that silently reintroduces the split write: a service
 * function that goes back to inserting junction rows through PostgREST commits
 * the root row in its own transaction again, and nothing in a browser test that
 * only exercises the happy path would notice.
 */

const root = process.cwd();
const migrations = readdirSync(join(root, "supabase", "migrations"))
  .filter((file) => file.endsWith(".sql"))
  .map((file) => readFileSync(join(root, "supabase", "migrations", file), "utf8"))
  .join("\n");

const profilesSource = readFileSync(join(root, "src", "lib", "api", "profiles.ts"), "utf8");
const gigsSource = readFileSync(join(root, "src", "lib", "api", "gigs.ts"), "utf8");

describe("profile writes are transactional", () => {
  it("ships the create/update functions as migrations", () => {
    expect(migrations).toContain("create_musician_profile_with_tags");
    expect(migrations).toContain("update_musician_profile_with_tags");
  });

  it("routes profile mutations through the transactional RPCs", () => {
    expect(profilesSource).toContain('rpc("create_musician_profile_with_tags"');
    expect(profilesSource).toContain('rpc("update_musician_profile_with_tags"');
  });

  it("no longer writes profile taxonomy junction rows from application code", () => {
    for (const table of ["musician_instrument", "musician_genre"]) {
      expect(profilesSource).not.toContain(`from("${table}")`);
    }
  });
});

describe("gig writes are transactional", () => {
  it("ships the create/update functions as migrations", () => {
    expect(migrations).toContain("create_gig_with_tags");
    expect(migrations).toContain("update_gig_with_tags");
  });

  it("routes gig mutations through the transactional RPCs", () => {
    expect(gigsSource).toContain('rpc("create_gig_with_tags"');
    expect(gigsSource).toContain('rpc("update_gig_with_tags"');
  });

  it("no longer writes gig taxonomy junction rows from application code", () => {
    for (const table of ["gig_instrument", "gig_genre"]) {
      expect(gigsSource).not.toContain(`from("${table}")`);
    }
  });

  it("asserts gig ownership in the database, not only in RLS", () => {
    expect(migrations).toMatch(/creator_id <> v_user_id/);
  });
});
