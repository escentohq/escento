import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DELETE_ACCOUNT_NOT_STARTED,
  DELETE_ACCOUNT_PARTIAL,
  DELETE_ACCOUNT_UNAVAILABLE,
} from "@/lib/account-deletion";

/**
 * Account deletion invariants (MVP-04, issue #32). The behaviour lives in
 * `e2e/flows/account-deletion.spec.ts`; what is cheap to protect here is the
 * shape that makes it recoverable — one transactional call instead of a staged
 * sequence, Auth removed last, and three distinct messages so the UI cannot tell
 * a user "nothing was removed" after their content is already gone.
 */

const root = process.cwd();
const migrations = readdirSync(join(root, "supabase", "migrations"))
  .filter((file) => file.endsWith(".sql"))
  .map((file) => readFileSync(join(root, "supabase", "migrations", file), "utf8"))
  .join("\n");

const deletionSource = readFileSync(join(root, "src", "lib", "user-deletion.ts"), "utf8");

describe("account deletion is transactional and idempotent", () => {
  it("ships the deletion function as a migration, service-role only", () => {
    expect(migrations).toContain("delete_app_user_data");
    expect(migrations).toMatch(/GRANT EXECUTE ON FUNCTION "public"\."delete_app_user_data"\("uuid"\) TO "service_role"/);
    expect(migrations).toMatch(/REVOKE ALL ON FUNCTION "public"\."delete_app_user_data"\("uuid"\) FROM "authenticated"/);
  });

  it("routes every database delete through that one call", () => {
    expect(deletionSource).toContain('rpc("delete_app_user_data"');
    for (const table of [
      "musician_profile",
      "gig",
      "app_user",
      "messages",
      "conversations",
      "conversation_participants",
      "conversation_requests",
      "user_blocks",
    ]) {
      expect(deletionSource).not.toContain(`from("${table}")`);
    }
  });

  it("removes the Auth user last, after storage", () => {
    const storageAt = deletionSource.indexOf("storage.from(PROFILE_PICTURES_BUCKET)");
    const authAt = deletionSource.indexOf("auth.admin.deleteUser");
    expect(storageAt).toBeGreaterThan(-1);
    expect(authAt).toBeGreaterThan(storageAt);
  });
});

describe("deletion messages describe distinct states", () => {
  it("keeps the three outcomes distinguishable", () => {
    const messages = [
      DELETE_ACCOUNT_UNAVAILABLE,
      DELETE_ACCOUNT_NOT_STARTED,
      DELETE_ACCOUNT_PARTIAL,
    ];
    expect(new Set(messages).size).toBe(3);
    expect(DELETE_ACCOUNT_NOT_STARTED).toMatch(/nothing was removed/i);
    expect(DELETE_ACCOUNT_PARTIAL).toMatch(/deleted/i);
  });
});
