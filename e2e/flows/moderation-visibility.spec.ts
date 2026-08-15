import { createClient } from "@supabase/supabase-js";
import { expect, test, type Browser, type Page } from "@playwright/test";

import {
  TEST_PASSWORD,
  newContextPage,
  newMusicianWithProfile,
  signIn,
  uniqueEmail,
} from "./helpers";

const ADMIN_EMAIL = "admin@example.test";

function localSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !anonKey || /\.supabase\.co/i.test(url)) {
    throw new Error("Moderation visibility tests require the guarded local Supabase stack.");
  }

  return { url, anonKey };
}

function localAnonymousClient() {
  const { url, anonKey } = localSupabaseConfig();

  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function localAdminClient() {
  const { url } = localSupabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!serviceKey) {
    throw new Error("Moderation visibility tests require the local service-role key.");
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function expectAnonymousRow(
  table: "musician_profile" | "gig",
  id: string,
  expectedCount: 0 | 1,
) {
  const { data, error } = await localAnonymousClient()
    .from(table)
    .select("id")
    .eq("id", id);

  expect(error).toBeNull();
  expect(data).toHaveLength(expectedCount);
}

async function ensureLocalAdminAccount() {
  const admin = localAdminClient();
  const { data: users, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw listError;

  let adminUser = users.users.find((user) => user.email === ADMIN_EMAIL);
  if (!adminUser) {
    const { data, error } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Test Admin" },
    });
    if (error || !data.user) throw error ?? new Error("Could not create local admin user.");
    adminUser = data.user;
  } else {
    const { error } = await admin.auth.admin.updateUserById(adminUser.id, {
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
  }

  const { error: profileError } = await admin.from("app_user").upsert({
    id: adminUser.id,
    email: ADMIN_EMAIL,
    name: "Test Admin",
    is_public: true,
    moderation_status: "active",
  });
  if (profileError) throw profileError;
}

async function createCreatorGigFixture(browser: Browser, title: string) {
  const admin = localAdminClient();
  const email = uniqueEmail("moderation-gig");
  const { data, error: userError } = await admin.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Moderated Creator" },
  });
  if (userError || !data.user) {
    throw userError ?? new Error("Could not create the local creator fixture.");
  }

  const { error: profileError } = await admin.from("app_user").upsert({
    id: data.user.id,
    email,
    name: "Moderated Creator",
    role: "CREATOR",
    is_public: true,
    moderation_status: "active",
  });
  if (profileError) throw profileError;

  const { data: gig, error: gigError } = await admin
    .from("gig")
    .insert({
      creator_id: data.user.id,
      title,
      description: "Representative gig for moderation visibility regression coverage.",
      project_type: "FILM",
      is_remote: true,
      compensation_type: "PAID",
      status: "OPEN",
      is_public: true,
      moderation_status: "active",
    })
    .select("id")
    .single();
  if (gigError || !gig) {
    throw gigError ?? new Error("Could not create the local gig fixture.");
  }

  const page = await newContextPage(browser);
  await signIn(page, email, TEST_PASSWORD, "/gigs/manage");
  return { page, gigId: gig.id, email };
}

async function moderateRow(page: Page, rowText: string, action: "Hide" | "Restore") {
  const row = page.getByRole("row").filter({ hasText: rowText });
  await expect(row).toHaveCount(1);
  await row.getByRole("button", { name: action, exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("row").filter({ hasText: rowText })).toHaveCount(1);
}

test.describe("moderation visibility", () => {
  test.beforeAll(async () => {
    await ensureLocalAdminAccount();
  });

  test("profile and musician-account hide/restore update cached public reads", async ({ browser }) => {
    test.setTimeout(240_000);
    const displayName = `Moderated Musician ${Date.now().toString(36)}`;
    const { page: owner, profileId, email: ownerEmail } = await newMusicianWithProfile(
      browser,
      "moderation-profile",
      displayName,
    );
    const anonymous = await newContextPage(browser);
    const adminPage = await newContextPage(browser);

    // Warm every cached public surface before moderation so these assertions
    // prove invalidation, not merely correct behavior on a cold read.
    await anonymous.goto("/");
    await expect(anonymous.getByText(displayName).first()).toBeVisible();
    await anonymous.goto(`/musicians?q=${encodeURIComponent(displayName)}`);
    await expect(anonymous.getByText(displayName).first()).toBeVisible();
    await anonymous.goto(`/musicians/${profileId}`);
    await expect(anonymous.getByRole("heading", { name: displayName })).toBeVisible();
    await expectAnonymousRow("musician_profile", profileId, 1);

    await signIn(adminPage, ADMIN_EMAIL, TEST_PASSWORD, "/admin/musicians");
    await moderateRow(adminPage, displayName, "Hide");

    await anonymous.goto("/");
    await expect(anonymous.getByText(displayName)).toHaveCount(0);
    await anonymous.goto(`/musicians?q=${encodeURIComponent(displayName)}`);
    await expect(anonymous.getByText(displayName)).toHaveCount(0);
    await anonymous.goto(`/musicians/${profileId}`);
    await expect(anonymous.getByRole("heading", { name: "Lost in the mix." })).toBeVisible();
    await expectAnonymousRow("musician_profile", profileId, 0);
    await owner.goto("/profile/edit");
    await expect(owner.getByRole("heading", { name: "Edit Profile" })).toBeVisible();

    await moderateRow(adminPage, displayName, "Restore");
    await anonymous.goto("/");
    await expect(anonymous.getByText(displayName).first()).toBeVisible();
    await anonymous.goto(`/musicians?q=${encodeURIComponent(displayName)}`);
    await expect(anonymous.getByText(displayName).first()).toBeVisible();
    await anonymous.goto(`/musicians/${profileId}`);
    await expect(anonymous.getByRole("heading", { name: displayName })).toBeVisible();
    await expectAnonymousRow("musician_profile", profileId, 1);

    // The authenticated navigation exposes the signed-in email, which gives us
    // an unambiguous admin user-row target without relying on generated IDs.
    await adminPage.goto("/admin/users");
    await moderateRow(adminPage, ownerEmail, "Hide");

    await anonymous.goto("/");
    await expect(anonymous.getByText(displayName)).toHaveCount(0);
    await anonymous.goto(`/musicians?q=${encodeURIComponent(displayName)}`);
    await expect(anonymous.getByText(displayName)).toHaveCount(0);
    await anonymous.goto(`/musicians/${profileId}`);
    await expect(anonymous.getByRole("heading", { name: "Lost in the mix." })).toBeVisible();
    await expectAnonymousRow("musician_profile", profileId, 0);
    await owner.goto("/profile/edit");
    await expect(owner.getByRole("heading", { name: "Edit Profile" })).toBeVisible();

    await moderateRow(adminPage, ownerEmail, "Restore");
    await anonymous.goto("/");
    await expect(anonymous.getByText(displayName).first()).toBeVisible();
    await anonymous.goto(`/musicians?q=${encodeURIComponent(displayName)}`);
    await expect(anonymous.getByText(displayName).first()).toBeVisible();
    await anonymous.goto(`/musicians/${profileId}`);
    await expect(anonymous.getByRole("heading", { name: displayName })).toBeVisible();
    await expectAnonymousRow("musician_profile", profileId, 1);
  });

  test("gig and creator-account hide/restore update cached public reads", async ({ browser }) => {
    test.setTimeout(240_000);
    const title = `Moderated Gig ${Date.now().toString(36)}`;
    // This suite tests moderation, not gig creation. Build its representative
    // fixture directly in the guarded ephemeral stack so an unrelated form or
    // navigation timing issue cannot make moderation coverage flaky.
    const { page: owner, gigId, email: ownerEmail } = await createCreatorGigFixture(browser, title);
    const anonymous = await newContextPage(browser);
    const adminPage = await newContextPage(browser);

    await anonymous.goto("/");
    await expect(anonymous.getByText(title).first()).toBeVisible();
    await anonymous.goto(`/gigs?q=${encodeURIComponent(title)}`);
    await expect(anonymous.getByText(title).first()).toBeVisible();
    await anonymous.goto(`/gigs/${gigId}`);
    await expect(anonymous.getByRole("heading", { name: title })).toBeVisible();
    await expectAnonymousRow("gig", gigId, 1);

    await signIn(adminPage, ADMIN_EMAIL, TEST_PASSWORD, "/admin/gigs");
    await moderateRow(adminPage, title, "Hide");

    await anonymous.goto("/");
    await expect(anonymous.getByText(title)).toHaveCount(0);
    await anonymous.goto(`/gigs?q=${encodeURIComponent(title)}`);
    await expect(anonymous.getByText(title)).toHaveCount(0);
    await anonymous.goto(`/gigs/${gigId}`);
    await expect(anonymous.getByRole("heading", { name: "Lost in the mix." })).toBeVisible();
    await expectAnonymousRow("gig", gigId, 0);
    await owner.goto("/gigs/manage");
    await expect(owner.getByText(title)).toBeVisible();

    await moderateRow(adminPage, title, "Restore");
    await anonymous.goto("/");
    await expect(anonymous.getByText(title).first()).toBeVisible();
    await anonymous.goto(`/gigs?q=${encodeURIComponent(title)}`);
    await expect(anonymous.getByText(title).first()).toBeVisible();
    await anonymous.goto(`/gigs/${gigId}`);
    await expect(anonymous.getByRole("heading", { name: title })).toBeVisible();
    await expectAnonymousRow("gig", gigId, 1);

    await adminPage.goto("/admin/users");
    await moderateRow(adminPage, ownerEmail, "Hide");

    await anonymous.goto("/");
    await expect(anonymous.getByText(title)).toHaveCount(0);
    await anonymous.goto(`/gigs?q=${encodeURIComponent(title)}`);
    await expect(anonymous.getByText(title)).toHaveCount(0);
    await anonymous.goto(`/gigs/${gigId}`);
    await expect(anonymous.getByRole("heading", { name: "Lost in the mix." })).toBeVisible();
    await expectAnonymousRow("gig", gigId, 0);
    await owner.goto("/gigs/manage");
    await expect(owner.getByText(title)).toBeVisible();

    await moderateRow(adminPage, ownerEmail, "Restore");
    await anonymous.goto("/");
    await expect(anonymous.getByText(title).first()).toBeVisible();
    await anonymous.goto(`/gigs?q=${encodeURIComponent(title)}`);
    await expect(anonymous.getByText(title).first()).toBeVisible();
    await anonymous.goto(`/gigs/${gigId}`);
    await expect(anonymous.getByRole("heading", { name: title })).toBeVisible();
    await expectAnonymousRow("gig", gigId, 1);
  });
});
