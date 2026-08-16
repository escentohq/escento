import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { test, expect } from "@playwright/test";

import { signUp, chooseRole } from "./helpers";

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
