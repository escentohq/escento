import { createClient } from "@supabase/supabase-js";
import { test, expect } from "@playwright/test";

import { signUpAs, createGig } from "./helpers";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Local Supabase credentials are not in the worker environment.");
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Gig write flow: a creator publishes a gig and it persists on the detail page
 * and appears in the open gig directory.
 */
test("creator publishes a gig that appears in the directory", async ({ page }) => {
  const title = `Test Gig ${Date.now().toString(36)}`;

  await signUpAs(page, "CREATOR", "gig");
  const gigId = await createGig(page, {
    title,
    description: "Looking for a composer for a short film score. This is an automated test gig.",
    projectType: "FILM",
    compensationType: "PAID",
  });

  expect(gigId).toBeTruthy();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  // Open gigs are listed in the directory. Filter to this gig by title so the
  // assertion does not depend on how many other gigs exist.
  await page.goto(`/gigs?q=${encodeURIComponent(title)}`);
  await expect(page.getByText(title).first()).toBeVisible();
});

test("a creator without a name is sent to account before they can publish", async ({ page }) => {
  const creds = await signUpAs(page, "CREATOR", "gig-noname");
  const admin = adminClient();
  const { error } = await admin.from("app_user").update({ name: null }).eq("email", creds.email);
  expect(error).toBeNull();

  await page.goto("/gigs/create");
  await expect(page).toHaveURL(/\/account\?reason=name/);
  await expect(page.getByText("Add a name")).toBeVisible();

  await page.locator('input[name="name"]').fill("Named Creator");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Name updated.")).toBeVisible();

  await page.goto("/gigs/create");
  await expect(page).toHaveURL(/\/gigs\/create/);
});
