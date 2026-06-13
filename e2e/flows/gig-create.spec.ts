import { test, expect } from "@playwright/test";

import { signUpAs, createGig } from "./helpers";

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

  // Open gigs are listed in the directory.
  await page.goto("/gigs");
  await expect(page.getByText(title).first()).toBeVisible();
});
