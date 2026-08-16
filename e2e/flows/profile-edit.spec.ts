import { test, expect } from "@playwright/test";

import {
  completeMusicianProfile,
  createMusicianProfile,
  signUpAs,
} from "./helpers";

test.describe("profile edit and validation", () => {
  test("profile edit validates years experience and website url", async ({ page }) => {
    await signUpAs(page, "MUSICIAN", "profile-validate");
    const profileId = await createMusicianProfile(
      page,
      `Validation Artist ${Date.now().toString(36)}`,
    );
    await completeMusicianProfile(page, profileId);

    // The edit form keeps every field on one screen, so both rules fire together.
    await page.goto("/profile/edit");
    await page.locator('input[name="yearsExperience"]').fill("abc");
    await page.locator('input[name="websiteUrl"]').fill("not-a-url");
    await page.getByRole("button", { name: "Save Profile" }).click();

    await expect(page.getByText("Use a whole number.")).toBeVisible();
    await expect(page.getByText("Use a full http:// or https:// URL.")).toBeVisible();
  });

  test("musician can edit an existing profile", async ({ page }) => {
    const originalName = `Profile Original ${Date.now().toString(36)}`;
    const updatedName = `Profile Updated ${Date.now().toString(36)}`;

    await signUpAs(page, "MUSICIAN", "profile-edit");
    const profileId = await createMusicianProfile(page, originalName);
    await completeMusicianProfile(page, profileId);

    await page.goto("/profile/edit");
    await page.locator('input[name="displayName"]').fill(updatedName);
    await page.locator('input[name="yearsExperience"]').fill("7");
    await page.getByRole("button", { name: "Save Profile" }).click();

    await page.waitForURL(`/musicians/${profileId}`);
    await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();
  });
});
