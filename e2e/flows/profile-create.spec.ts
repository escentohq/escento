import { test, expect } from "@playwright/test";

import { signUpAs, createMusicianProfile, makeProfileLaunchReady, newContextPage } from "./helpers";

/**
 * Musician profile write flow (MVP-08, issue #28). Step one saves a draft.
 * Anonymous discovery starts only after craft plus a piece of context.
 */
test.describe("musician profile launch readiness", () => {
  test("a name-only draft saves and resumes but is not anonymous inventory", async ({ page, browser }) => {
    const displayName = `Draft Musician ${Date.now().toString(36)}`;

    await signUpAs(page, "MUSICIAN", "profile-draft");
    const profileId = await createMusicianProfile(page, displayName);

    expect(profileId).toBeTruthy();
    await expect(page).toHaveURL(/\/musicians$/);
    await expect(page.getByText("Saved, not listed yet")).toBeVisible();

    // The owner can still open the same URL the nudge links to.
    await page.goto(`/musicians/${profileId}`);
    await expect(page.getByRole("heading", { name: displayName })).toBeVisible();
    await expect(page.getByText("Not listed yet")).toBeVisible();
    await expect(page.getByRole("button", { name: "Connect" })).toHaveCount(0);

    // Anonymous visitors do not see it in the directory or on the detail URL.
    const visitor = await newContextPage(browser);
    await visitor.goto(`/musicians?q=${encodeURIComponent(displayName)}`);
    await expect(visitor.getByText(displayName)).toHaveCount(0);
    await visitor.goto(`/musicians/${profileId}`);
    await expect(visitor.getByText("Page not found")).toBeVisible();
  });

  test("a minimally complete profile is listed immediately", async ({ page, browser }) => {
    const displayName = `Listed Musician ${Date.now().toString(36)}`;

    await signUpAs(page, "MUSICIAN", "profile-listed");
    const profileId = await createMusicianProfile(page, displayName);
    await makeProfileLaunchReady(page);

    await page.goto(`/musicians?q=${encodeURIComponent(displayName)}`);
    await expect(page.getByText(displayName).first()).toBeVisible();

    const visitor = await newContextPage(browser);
    await visitor.goto(`/musicians?q=${encodeURIComponent(displayName)}`);
    await expect(visitor.getByText(displayName).first()).toBeVisible();
    await visitor.goto(`/musicians/${profileId}`);
    await expect(visitor.getByRole("heading", { name: displayName })).toBeVisible();
    await expect(visitor.getByText("Not listed yet")).toHaveCount(0);
  });
});
