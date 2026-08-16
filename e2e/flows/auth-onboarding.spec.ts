import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { test, expect } from "@playwright/test";

import { signOut, signUp, signUpDual, chooseRole } from "./helpers";

/** Service-role client — bypasses RLS, so it isolates the database invariant. */
function adminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Local Supabase credentials are not in the worker environment.");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function roleOf(admin: SupabaseClient, email: string): Promise<string | null> {
  const { data, error } = await admin.from("app_user").select("role").eq("email", email).single();
  if (error) throw error;
  return (data?.role as string | null) ?? null;
}

/**
 * Auth + onboarding write flow: a fresh signup creates a real session (email
 * confirmations are disabled locally), lands on the role picker, and each role
 * routes to the correct destination.
 */
test.describe("auth + onboarding", () => {
  test("signup lands on the role picker", async ({ page }) => {
    await signUp(page, "onboard");
    await expect(page).toHaveURL(/\/onboarding\/role/);
    await expect(page.getByRole("button", { name: "I play music" })).toBeVisible();
    await expect(page.getByRole("button", { name: "I need musicians" })).toBeVisible();
  });

  test("password sign-in without a role returns to the role picker", async ({ page }) => {
    const { email, password } = await signUp(page, "signin-role");
    await signOut(page);

    await page.goto("/signin?callbackUrl=%2F");
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/onboarding\/role/);
  });

  test("choosing Musician routes to profile create", async ({ page }) => {
    await signUp(page, "musician");
    await chooseRole(page, "MUSICIAN");
    await expect(page).toHaveURL(/\/profile\/create/);
  });

  test("choosing Creator routes to gig management", async ({ page }) => {
    await signUp(page, "creator");
    await chooseRole(page, "CREATOR");
    await expect(page).toHaveURL(/\/gigs\/manage/);
  });

  /**
   * Since issue #6 the picker is not a one-time gate. Revisiting it with one
   * capability offers the other one instead of redirecting away.
   */
  test("revisiting the picker offers the capability you do not have", async ({ page }) => {
    await signUp(page, "locked");
    await chooseRole(page, "MUSICIAN");

    await page.goto("/onboarding/role");
    await expect(page).toHaveURL(/\/onboarding\/role/);
    await expect(page.getByRole("button", { name: "Add creator tools" })).toBeVisible();
  });

  test("the picker redirects away once both capabilities are held", async ({ page }) => {
    await signUpDual(page, "MUSICIAN", "bothcaps");

    await page.goto("/onboarding/role");
    await expect(page).not.toHaveURL(/\/onboarding\/role/);
  });

  test("one account can hold a musician profile and post a gig", async ({ page }) => {
    const { email } = await signUpDual(page, "MUSICIAN", "dualaccess");

    await page.goto("/profile/create");
    await expect(page).toHaveURL(/\/profile\/create/);

    await page.goto("/gigs/create");
    await expect(page).toHaveURL(/\/gigs\/create/);

    const admin = adminClient();
    const { data } = await admin
      .from("app_user")
      .select("role, is_musician, is_creator")
      .eq("email", email)
      .single();
    // The first claim stays what it was; both capabilities are now held.
    expect(data?.role).toBe("MUSICIAN");
    expect(data?.is_musician).toBe(true);
    expect(data?.is_creator).toBe(true);
  });
});

test.describe("capabilities are additive only", () => {
  test("a service-role revoke is rejected and leaves the capability held", async ({ page }) => {
    const { email } = await signUp(page, "revoke");
    await chooseRole(page, "CREATOR");

    const admin = adminClient();
    const { error } = await admin.from("app_user").update({ is_creator: false }).eq("email", email);
    expect(error).not.toBeNull();

    const { data } = await admin.from("app_user").select("is_creator").eq("email", email).single();
    expect(data?.is_creator).toBe(true);
  });

  test("re-granting a capability already held is harmless", async ({ page }) => {
    const { email } = await signUp(page, "regrant");
    await chooseRole(page, "MUSICIAN");

    const admin = adminClient();
    const { error } = await admin.from("app_user").update({ is_musician: true }).eq("email", email);
    expect(error).toBeNull();
  });
});

/**
 * Issue #27 / MVP-02: the first role choice is one-time. Page navigation is not
 * the enforcement — a direct database update is the strongest bypass available
 * to any caller, so that is what these assert against. Issue #6 kept this
 * property; `role` is now the immutable *first* claim.
 */
test.describe("role assignment is immutable", () => {
  test("a cross-role update is rejected and leaves the row untouched", async ({ page }) => {
    const { email } = await signUp(page, "immutable");
    await chooseRole(page, "MUSICIAN");

    const admin = adminClient();
    expect(await roleOf(admin, email)).toBe("MUSICIAN");

    const { error } = await admin.from("app_user").update({ role: "CREATOR" }).eq("email", email);
    expect(error).not.toBeNull();
    expect(await roleOf(admin, email)).toBe("MUSICIAN");
  });

  test("clearing a role back to NULL is rejected", async ({ page }) => {
    const { email } = await signUp(page, "nullrole");
    await chooseRole(page, "CREATOR");

    const admin = adminClient();
    const { error } = await admin.from("app_user").update({ role: null }).eq("email", email);
    expect(error).not.toBeNull();
    expect(await roleOf(admin, email)).toBe("CREATOR");
  });

  test("a same-role rewrite is harmless and other columns still update", async ({ page }) => {
    const { email } = await signUp(page, "samerole");
    await chooseRole(page, "MUSICIAN");

    const admin = adminClient();
    const { error: sameRoleError } = await admin
      .from("app_user")
      .update({ role: "MUSICIAN" })
      .eq("email", email);
    expect(sameRoleError).toBeNull();

    // The trigger guards `role` only; unrelated moderation/profile columns are
    // still writable, which the admin surfaces depend on.
    const { error: otherColumnError } = await admin
      .from("app_user")
      .update({ is_verified: true })
      .eq("email", email);
    expect(otherColumnError).toBeNull();
    expect(await roleOf(admin, email)).toBe("MUSICIAN");
  });

  test("concurrent first choices resolve to exactly one durable role", async ({ page }) => {
    const { email } = await signUp(page, "concurrent");

    const admin = adminClient();
    const { data: row, error: readError } = await admin
      .from("app_user")
      .select("id, role")
      .eq("email", email)
      .single();
    if (readError) throw readError;
    expect(row.role).toBeNull();

    // Both writers use the same compare-and-set the Server Action uses.
    const claim = (role: string) =>
      admin.from("app_user").update({ role }).eq("id", row.id).is("role", null).select("role");

    const results = await Promise.all([claim("MUSICIAN"), claim("CREATOR")]);
    const claimed = results.flatMap((result) => result.data ?? []);
    expect(claimed).toHaveLength(1);
    expect(await roleOf(admin, email)).toBe(claimed[0].role);
  });
});
