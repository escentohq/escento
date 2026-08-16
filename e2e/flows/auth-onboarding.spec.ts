import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { test, expect } from "@playwright/test";

import { signOut, signUp, signUpAs, chooseRole, createMusicianProfile, TEST_PASSWORD } from "./helpers";

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

  test("role picker is gated once a role is set", async ({ page }) => {
    await signUp(page, "locked");
    await chooseRole(page, "MUSICIAN");
    // Revisiting onboarding after a role exists redirects away.
    await page.goto("/onboarding/role");
    await expect(page).not.toHaveURL(/\/onboarding\/role/);
  });
});

/**
 * Issue #27 / MVP-02: the first role choice is one-time. Page navigation is not
 * the enforcement — a direct database update is the strongest bypass available
 * to any caller, so that is what these assert against.
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

/** Anon-key client with a real user session — the attack surface in issue #59. */
function authenticatedClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Local Supabase credentials are not in the worker environment.");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function signInUser(email: string, password = TEST_PASSWORD): Promise<{ supabase: SupabaseClient; userId: string }> {
  const supabase = authenticatedClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw error ?? new Error("signInWithPassword returned no user");
  return { supabase, userId: data.user.id };
}

function expectWriteRefused(_error: { message?: string } | null, data: unknown[] | null): void {
  // Column GRANT failures return an error; a WITH CHECK miss can look like
  // success with zero rows. Either way the privileged column must not change.
  expect(Array.isArray(data) && data.length > 0).toBe(false);
}

/**
 * Issue #59: own-row UPDATE must not accept privileged columns, even with a
 * valid session. Name (and first-time role) remain writable.
 */
test.describe("own-row updates cannot set privileged columns", () => {
  test("authenticated PATCH cannot set support or moderation flags on app_user", async ({ page }) => {
    const { email } = await signUp(page, "rls-app-user");
    const { supabase, userId } = await signInUser(email);

    const support = await supabase
      .from("app_user")
      .update({ is_admin_support_account: true })
      .eq("id", userId)
      .select("id");
    expectWriteRefused(support.error, support.data);

    const moderation = await supabase
      .from("app_user")
      .update({ moderation_status: "hidden" })
      .eq("id", userId)
      .select("id");
    expectWriteRefused(moderation.error, moderation.data);

    const name = await supabase.from("app_user").update({ name: "Allowed Name" }).eq("id", userId).select("name");
    expect(name.error).toBeNull();
    expect(name.data?.[0]?.name).toBe("Allowed Name");

    const admin = adminClient();
    const { data: row, error } = await admin
      .from("app_user")
      .select("is_admin_support_account, moderation_status, name")
      .eq("id", userId)
      .single();
    if (error) throw error;
    expect(row.is_admin_support_account).toBe(false);
    expect(row.moderation_status).toBe("active");
    expect(row.name).toBe("Allowed Name");
  });

  test("authenticated PATCH cannot verify own musician_profile", async ({ page }) => {
    const { email } = await signUpAs(page, "MUSICIAN", "rls-profile");
    const profileId = await createMusicianProfile(page, "RLS Profile");
    const { supabase } = await signInUser(email);

    const verified = await supabase
      .from("musician_profile")
      .update({ is_verified: true })
      .eq("id", profileId)
      .select("id");
    expectWriteRefused(verified.error, verified.data);

    const admin = adminClient();
    const { data: row, error } = await admin
      .from("musician_profile")
      .select("is_verified")
      .eq("id", profileId)
      .single();
    if (error) throw error;
    expect(row.is_verified).toBe(false);
  });
});
