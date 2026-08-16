import { test, expect } from "@playwright/test";

import { addCapability, signUpAs } from "./helpers";

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

  /**
   * These two used to assert a bounce to `/`. Since issue #6 a missing capability
   * is something you can add, so the guard sends you to the screen that adds it
   * and remembers where you were headed.
   */
  test("a musician without creator tools is offered them, not bounced home", async ({ page }) => {
    await signUpAs(page, "MUSICIAN", "guard-musician");
    await page.goto("/gigs/create");

    await expect(page).toHaveURL(/\/onboarding\/role\?add=CREATOR/);
    expect(new URL(page.url()).searchParams.get("next")).toBe("/gigs/create");
  });

  test("a creator without a musician profile is offered one, not bounced home", async ({ page }) => {
    await signUpAs(page, "CREATOR", "guard-creator");
    await page.goto("/profile/create");

    await expect(page).toHaveURL(/\/onboarding\/role\?add=MUSICIAN/);
    expect(new URL(page.url()).searchParams.get("next")).toBe("/profile/create");
  });

  test("adding the capability opens the route that asked for it", async ({ page }) => {
    await signUpAs(page, "MUSICIAN", "guard-grant");
    await addCapability(page, "CREATOR");

    await page.goto("/gigs/create");
    await expect(page).toHaveURL(/\/gigs\/create/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  /**
   * The acceptance criterion that matters most: the active view is a display
   * preference and grants nothing. `requireRole` never reads the cookie.
   */
  test("flipping the view cookie does not grant a capability", async ({ page, context }) => {
    await signUpAs(page, "MUSICIAN", "guard-cookie");

    await context.addCookies([
      {
        name: "escento_view",
        value: "CREATOR",
        domain: "localhost",
        path: "/",
      },
    ]);

    for (const route of ["/gigs/create", "/gigs/manage"]) {
      await page.goto(route);
      await expect(page, `${route} was reachable with only a cookie flip`).toHaveURL(
        /\/onboarding\/role\?add=CREATOR/,
      );
    }
  });
});
