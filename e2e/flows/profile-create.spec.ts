import { test, expect } from "@playwright/test";

import { signUpAs, createMusicianProfile } from "./helpers";

/**
 * Musician profile write flow: one screen and one field is enough to get a live,
 * discoverable profile, and the directory then nudges the user to finish it.
 */
test("musician creates a profile that appears in the directory", async ({ page }) => {
  const displayName = `Test Musician ${Date.now().toString(36)}`;

  await signUpAs(page, "MUSICIAN", "profile");
  const profileId = await createMusicianProfile(page, displayName);

  // Step one lands on the marketplace, not on three more form screens.
  expect(profileId).toBeTruthy();
  await expect(page).toHaveURL(/\/musicians$/);
  await expect(page.getByText("Your profile is 1 of 4 done")).toBeVisible();

  // The new profile is discoverable in the directory. Filter to this profile by
  // name so the assertion does not depend on how many others exist.
  await page.goto(`/musicians?q=${encodeURIComponent(displayName)}`);
  await expect(page.getByText(displayName).first()).toBeVisible();

  // And the public detail page renders it.
  await page.goto(`/musicians/${profileId}`);
  await expect(page.getByRole("heading", { name: displayName })).toBeVisible();
});
