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

describe("app_user.role immutability invariant", () => {
  const migrationsDir = join(process.cwd(), "supabase", "migrations");
  const sql = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .map((file) => readFileSync(join(migrationsDir, file), "utf8"))
    .join("\n");

  it("ships a BEFORE UPDATE trigger on app_user that guards role", () => {
    expect(sql).toContain("enforce_immutable_app_user_role");
    expect(sql).toMatch(/BEFORE UPDATE ON "public"\."app_user"/i);
    expect(sql).toMatch(/OLD\.role IS NOT NULL AND NEW\.role IS DISTINCT FROM OLD\.role/i);
  });
});
