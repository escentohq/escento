import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";

import {
  TEST_PASSWORD,
  newContextPage,
  newCreatorWithGig,
  newMusicianWithProfile,
  signIn,
} from "./helpers";

const ADMIN_EMAIL = "admin@example.test";

async function ensureLocalAdminAccount() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !serviceKey || /\.supabase\.co/i.test(url)) {
    throw new Error("Moderation visibility tests require the guarded local Supabase stack.");
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
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
    test.setTimeout(180_000);
    const displayName = `Moderated Musician ${Date.now().toString(36)}`;
    const { page: owner, profileId, email: ownerEmail } = await newMusicianWithProfile(
      browser,
      "moderation-profile",
      displayName,
    );
    const anonymous = await newContextPage(browser);
    const adminPage = await newContextPage(browser);

    await anonymous.goto(`/musicians?q=${encodeURIComponent(displayName)}`);
    await expect(anonymous.getByText(displayName).first()).toBeVisible();
    await anonymous.goto(`/musicians/${profileId}`);
    await expect(anonymous.getByRole("heading", { name: displayName })).toBeVisible();

    await signIn(adminPage, ADMIN_EMAIL, TEST_PASSWORD, "/admin/musicians");
    await moderateRow(adminPage, displayName, "Hide");

    await anonymous.goto(`/musicians?q=${encodeURIComponent(displayName)}`);
    await expect(anonymous.getByText(displayName)).toHaveCount(0);
    await anonymous.goto(`/musicians/${profileId}`);
    await expect(anonymous.getByRole("heading", { name: "Lost in the mix." })).toBeVisible();
    await owner.goto("/profile/edit");
    await expect(owner.getByRole("heading", { name: "Edit Profile" })).toBeVisible();

    await moderateRow(adminPage, displayName, "Restore");
    await anonymous.goto(`/musicians/${profileId}`);
    await expect(anonymous.getByRole("heading", { name: displayName })).toBeVisible();

    // The authenticated navigation exposes the signed-in email, which gives us
    // an unambiguous admin user-row target without relying on generated IDs.
    await adminPage.goto("/admin/users");
    await moderateRow(adminPage, ownerEmail, "Hide");

    await anonymous.goto(`/musicians/${profileId}`);
    await expect(anonymous.getByRole("heading", { name: "Lost in the mix." })).toBeVisible();
    await owner.goto("/profile/edit");
    await expect(owner.getByRole("heading", { name: "Edit Profile" })).toBeVisible();

    await moderateRow(adminPage, ownerEmail, "Restore");
    await anonymous.goto(`/musicians/${profileId}`);
    await expect(anonymous.getByRole("heading", { name: displayName })).toBeVisible();
  });

  test("gig and creator-account hide/restore update cached public reads", async ({ browser }) => {
    test.setTimeout(180_000);
    const title = `Moderated Gig ${Date.now().toString(36)}`;
    const { page: owner, gigId, email: ownerEmail } = await newCreatorWithGig(browser, "moderation-gig", title);
    const anonymous = await newContextPage(browser);
    const adminPage = await newContextPage(browser);

    await anonymous.goto(`/gigs?q=${encodeURIComponent(title)}`);
    await expect(anonymous.getByText(title).first()).toBeVisible();
    await anonymous.goto(`/gigs/${gigId}`);
    await expect(anonymous.getByRole("heading", { name: title })).toBeVisible();

    await signIn(adminPage, ADMIN_EMAIL, TEST_PASSWORD, "/admin/gigs");
    await moderateRow(adminPage, title, "Hide");

    await anonymous.goto(`/gigs?q=${encodeURIComponent(title)}`);
    await expect(anonymous.getByText(title)).toHaveCount(0);
    await anonymous.goto(`/gigs/${gigId}`);
    await expect(anonymous.getByRole("heading", { name: "Lost in the mix." })).toBeVisible();
    await owner.goto("/gigs/manage");
    await expect(owner.getByText(title)).toBeVisible();

    await moderateRow(adminPage, title, "Restore");
    await anonymous.goto(`/gigs/${gigId}`);
    await expect(anonymous.getByRole("heading", { name: title })).toBeVisible();

    await adminPage.goto("/admin/users");
    await moderateRow(adminPage, ownerEmail, "Hide");

    await anonymous.goto(`/gigs/${gigId}`);
    await expect(anonymous.getByRole("heading", { name: "Lost in the mix." })).toBeVisible();
    await owner.goto("/gigs/manage");
    await expect(owner.getByText(title)).toBeVisible();

    await moderateRow(adminPage, ownerEmail, "Restore");
    await anonymous.goto(`/gigs/${gigId}`);
    await expect(anonymous.getByRole("heading", { name: title })).toBeVisible();
  });
});
