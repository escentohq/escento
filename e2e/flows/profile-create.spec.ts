import { test, expect } from "@playwright/test";

import { signUpAs, createMusicianProfile } from "./helpers";

/**
 * Musician profile write flow: create a profile and confirm it persists on the
 * public detail page and surfaces in the directory.
 */
test("musician creates a profile that appears in the directory", async ({ page }) => {
  const displayName = `Test Musician ${Date.now().toString(36)}`;

  await signUpAs(page, "MUSICIAN", "profile");
  const profileId = await createMusicianProfile(page, displayName);

  // Landed on the public profile and the name rendered.
  expect(profileId).toBeTruthy();
  await expect(page.getByRole("heading", { name: displayName })).toBeVisible();

  // The new profile is discoverable in the directory.
  await page.goto("/musicians");
  await expect(page.getByText(displayName).first()).toBeVisible();
});
