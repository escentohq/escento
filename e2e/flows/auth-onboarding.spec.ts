import { test, expect } from "@playwright/test";

import { signUp, chooseRole } from "./helpers";

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
