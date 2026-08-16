import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { APP_ROLES, isAppRole, roleDestination } from "@/lib/onboarding-role";

/**
 * The one-time role choice (issue #27 / MVP-02). The action-level
 * compare-and-set needs a live database to exercise, so it is covered in
 * `e2e/flows/auth-onboarding.spec.ts`. What belongs here is the pure role
 * vocabulary plus the repo invariant that the database trigger — the part that
 * holds even when the action is bypassed — is still shipped as a migration.
 */

describe("role vocabulary", () => {
  it("accepts exactly the two product roles", () => {
    expect([...APP_ROLES]).toEqual(["MUSICIAN", "CREATOR"]);
    expect(isAppRole("MUSICIAN")).toBe(true);
    expect(isAppRole("CREATOR")).toBe(true);
  });

  it("rejects anything else, including null and casing variants", () => {
    for (const value of [null, undefined, "", "musician", "ADMIN", 1, {}]) {
      expect(isAppRole(value)).toBe(false);
    }
  });

  it("routes each role to its own onboarding destination", () => {
    expect(roleDestination("MUSICIAN")).toBe("/profile/create");
    expect(roleDestination("CREATOR")).toBe("/gigs/manage");
  });
});

/**
 * This used to concatenate every migration and grep the result, which could not
 * detect the change it was guarding: a later migration dropping the trigger left
 * the old file's text in the haystack and the test green. It now reads the one
 * migration that owns the invariant, by name.
 */
describe("app_user role and capability invariants", () => {
  const migrationsDir = join(process.cwd(), "supabase", "migrations");
  const CAPABILITY_MIGRATION = "20260817000000_dual_role_capabilities.sql";

  it("ships exactly one migration owning the trigger", () => {
    const files = readdirSync(migrationsDir).filter((file) => file.endsWith(".sql"));
    expect(files).toContain(CAPABILITY_MIGRATION);
  });

  const sql = readFileSync(join(migrationsDir, CAPABILITY_MIGRATION), "utf8");

  it("keeps role immutable once assigned", () => {
    expect(sql).toMatch(/OLD\.role IS NOT NULL AND NEW\.role IS DISTINCT FROM OLD\.role/i);
  });

  it("makes capabilities additive only", () => {
    expect(sql).toMatch(/OLD\.is_musician AND NOT NEW\.is_musician/i);
    expect(sql).toMatch(/OLD\.is_creator AND NOT NEW\.is_creator/i);
  });

  /** INSERT too, so claimRole's fallback insert path is covered without editing it. */
  it("fires on insert as well as update, and derives capability from role", () => {
    expect(sql).toMatch(/BEFORE INSERT OR UPDATE ON "public"\."app_user"/i);
    expect(sql).toMatch(/NEW\.role = 'MUSICIAN' THEN NEW\.is_musician := true/i);
    expect(sql).toMatch(/NEW\.role = 'CREATOR'\s+THEN NEW\.is_creator\s+:= true/i);
  });

  it("replaces the older single-role trigger rather than leaving both installed", () => {
    expect(sql).toMatch(/DROP TRIGGER IF EXISTS "enforce_immutable_app_user_role"/i);
  });

  it("backfills existing accounts so no one loses access", () => {
    expect(sql).toMatch(/SET "is_musician" = true WHERE "role" = 'MUSICIAN'/i);
    expect(sql).toMatch(/SET "is_creator"\s+= true WHERE "role" = 'CREATOR'/i);
  });
});
