import { test, expect } from "@playwright/test";

import { signUpAs } from "./helpers";

test.describe("permission guards", () => {
  test("signed-out users are redirected to sign in with callback url", async ({ page }) => {
    const protectedRoutes = ["/account", "/messages/requests", "/messages", "/profile/create"];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/signin\?callbackUrl=/);

      const url = new URL(page.url());
      expect(url.searchParams.get("callbackUrl")).toBe(route);
    }
  });

  test("musician cannot access creator-only gig create route", async ({ page }) => {
    await signUpAs(page, "MUSICIAN", "guard-musician");
    await page.goto("/gigs/create");
    await expect(page).toHaveURL(/\/$/);
  });

  test("creator cannot access musician-only profile create route", async ({ page }) => {
    await signUpAs(page, "CREATOR", "guard-creator");
    await page.goto("/profile/create");
    await expect(page).toHaveURL(/\/$/);
  });
});
