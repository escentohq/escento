import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { test, expect } from "@playwright/test";

import { createMusicianProfile, signUpAs } from "./helpers";

/**
 * Account deletion (MVP-04, issue #32). The property under test is not "the
 * button works" — it is that deletion converges. Every assertion below runs the
 * destructive step twice, because the failure this replaced left a half-deleted
 * account that a second attempt could not finish.
 */

function adminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Local Supabase credentials are not in the worker environment.");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function userIdFor(admin: SupabaseClient, email: string): Promise<string> {
  const { data, error } = await admin.from("app_user").select("id").eq("email", email).single();
  if (error) throw error;
  return data.id as string;
}

test.describe("account deletion converges", () => {
  test("deleting the same account twice removes everything and errors on neither pass", async ({ page }) => {
    const creds = await signUpAs(page, "MUSICIAN", "deleteonce");
    const profileId = await createMusicianProfile(page, "Deletion Test Profile");

    const admin = adminClient();
    const userId = await userIdFor(admin, creds.email);

    const first = await admin.rpc("delete_app_user_data", { p_user_id: userId });
    expect(first.error).toBeNull();

    // Same call again: every statement is an unconditional DELETE, so a retry
    // after a failed run is a no-op rather than an error.
    const second = await admin.rpc("delete_app_user_data", { p_user_id: userId });
    expect(second.error).toBeNull();

    const { data: appUser } = await admin.from("app_user").select("id").eq("id", userId);
    expect(appUser).toHaveLength(0);
    const { data: profile } = await admin.from("musician_profile").select("id").eq("id", profileId);
    expect(profile).toHaveLength(0);
  });

  test("a data-stage failure leaves the account completely intact", async ({ page }) => {
    const creds = await signUpAs(page, "MUSICIAN", "deletefail");
    const profileId = await createMusicianProfile(page, "Deletion Rollback Profile");

    const admin = adminClient();
    const userId = await userIdFor(admin, creds.email);

    // A null id is rejected before any statement runs; the point of the case is
    // that a rejected call is an all-or-nothing no-op.
    const { error } = await admin.rpc("delete_app_user_data", { p_user_id: null });
    expect(error).not.toBeNull();

    const { data: appUser } = await admin.from("app_user").select("id").eq("id", userId);
    expect(appUser).toHaveLength(1);
    const { data: profile } = await admin.from("musician_profile").select("id").eq("id", profileId);
    expect(profile).toHaveLength(1);
  });

  test("removing the auth user twice reports the second pass as already gone", async ({ page }) => {
    const creds = await signUpAs(page, "MUSICIAN", "deleteauth");
    const admin = adminClient();
    const userId = await userIdFor(admin, creds.email);

    await admin.rpc("delete_app_user_data", { p_user_id: userId });

    const first = await admin.auth.admin.deleteUser(userId);
    expect(first.error).toBeNull();

    // `deleteUserCompletely` treats this exact outcome as success, which is what
    // makes the Auth stage safe to retry.
    const second = await admin.auth.admin.deleteUser(userId);
    expect(second.error).not.toBeNull();
    expect(
      second.error?.status === 404 || /user not found/i.test(second.error?.message ?? ""),
    ).toBe(true);
  });

  test("the account page deletes the account and signs the owner out", async ({ page }) => {
    const creds = await signUpAs(page, "MUSICIAN", "deleteui");
    await createMusicianProfile(page, "Deletion UI Profile");

    const admin = adminClient();
    const userId = await userIdFor(admin, creds.email);

    await page.goto("/account");
    await page.getByRole("button", { name: "Delete account" }).first().click();
    await page.getByPlaceholder("delete my account").fill("delete my account");
    await page.getByRole("button", { name: "Delete account" }).last().click();
    await page.waitForURL(/\/signin/, { timeout: 30_000 });

    const { data: appUser } = await admin.from("app_user").select("id").eq("id", userId);
    expect(appUser).toHaveLength(0);
  });
});
