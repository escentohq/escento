import { test, expect } from "@playwright/test";

import { createMusicianProfile, signUpAs } from "./helpers";

/**
 * The create wizard persists per step. These cover the parts that a single-form
 * implementation could not do: resuming where you left off, skipping without
 * writing, and going back without losing what was already saved.
 */
test.describe("profile create wizard", () => {
  test("each step persists on its own and the wizard resumes where it left off", async ({ page }) => {
    const displayName = `Wizard Artist ${Date.now().toString(36)}`;

    await signUpAs(page, "MUSICIAN", "wizard-resume");
    const profileId = await createMusicianProfile(page, displayName);

    await page.getByRole("button", { name: "Account menu" }).click();
    const resumeItem = page.getByRole("menuitem", { name: "Continue setup" });
    await expect(resumeItem).toHaveAttribute("href", "/profile/create/craft");
    await page.keyboard.press("Escape");

    // Step 2: save instruments, then abandon the flow entirely.
    await page.goto("/profile/create/craft");
    await expect(page.getByText("Step 2 of 4")).toBeVisible();
    // Cello has no aliases in the taxonomy, so its suggestion row is just the
    // label — tags like Drums render "Drums matches: drumset" as their name.
    await page.getByPlaceholder("Guitar, vocals, piano").fill("Cello");
    await page.getByRole("button", { name: /^Cello$/ }).click();
    await page.getByRole("button", { name: "Save and continue" }).click();
    await page.waitForURL(/\/profile\/create\/context/, { timeout: 30_000 });

    // Leave mid-wizard. Step 2 must survive.
    await page.goto("/musicians");
    await expect(page.getByText("Saved, not listed yet")).toBeVisible();

    // Re-entering the wizard resumes at the first unfinished step, not step 1.
    await page.goto("/profile/create");
    await expect(page).toHaveURL(/\/profile\/create\/context/);

    // Going back shows the instrument saved two steps ago.
    await page.getByRole("link", { name: "Back" }).click();
    await page.waitForURL(/\/profile\/create\/craft/, { timeout: 30_000 });
    await expect(page.getByRole("button", { name: "Remove Cello" })).toBeVisible();

    // The owner can still preview the draft; it is not listed yet (no context).
    await page.goto(`/musicians/${profileId}`);
    await expect(page.getByText("Cello").first()).toBeVisible();
    await expect(page.getByText("Not listed yet")).toBeVisible();
  });

  test("skip advances without writing, and the last step finishes on the profile", async ({ page }) => {
    const displayName = `Wizard Skipper ${Date.now().toString(36)}`;

    await signUpAs(page, "MUSICIAN", "wizard-skip");
    const profileId = await createMusicianProfile(page, displayName);

    await page.goto("/profile/create/context");
    await page.locator('input[name="school"]').fill("Typed but skipped");
    await page.getByRole("link", { name: "Skip for now" }).click();
    await page.waitForURL(/\/profile\/create\/reach/, { timeout: 30_000 });

    await page.getByRole("button", { name: "Finish" }).click();
    await page.waitForURL(`/musicians/${profileId}`, { timeout: 30_000 });

    // Skip did not persist the typed value.
    await page.goto("/profile/create/context");
    await expect(page.locator('input[name="school"]')).toHaveValue("");
  });

  test("steps validate their own fields", async ({ page }) => {
    await signUpAs(page, "MUSICIAN", "wizard-validate");
    await createMusicianProfile(page, `Wizard Validation ${Date.now().toString(36)}`);

    await page.goto("/profile/create/context");
    await page.locator('input[name="yearsExperience"]').fill("abc");
    await page.getByRole("button", { name: "Save and continue" }).click();
    await expect(page.getByText("Use a whole number.")).toBeVisible();

    await page.goto("/profile/create/reach");
    await page.locator('input[name="websiteUrl"]').fill("not-a-url");
    await page.getByRole("button", { name: "Finish" }).click();
    await expect(page.getByText("Use a full http:// or https:// URL.")).toBeVisible();
  });

  test("step one rejects an empty display name", async ({ page }) => {
    await signUpAs(page, "MUSICIAN", "wizard-required");

    await page.goto("/profile/create");
    await expect(page).toHaveURL(/\/profile\/create\/identity/);
    await page.getByRole("button", { name: "Create and continue" }).click();
    await expect(page.getByText("Add the name creators should see.")).toBeVisible();
  });
});
