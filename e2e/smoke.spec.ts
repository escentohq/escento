import { test, expect } from "@playwright/test";

import { MIXED_PATHS, PROTECTED_PATHS, PUBLIC_PATHS } from "./route-inventory";

/**
 * Read-only smoke checks. Every case is signed-out and never writes data, so
 * this is safe to run against the live Supabase-backed deployment.
 *
 * The path lists come from `route-inventory.ts`, which the unit suite checks
 * against the files on disk — so a new route cannot quietly avoid this suite by
 * not being listed here.
 */

test.describe("app is alive", () => {
  test("homepage renders the hero and stays on /", async ({ page }) => {
    const serverErrors: string[] = [];
    page.on("response", (res) => {
      if (res.status() >= 500) serverErrors.push(`${res.status()} ${res.url()}`);
    });
    const pageErrors: string[] = [];
    page.on("pageerror", (err) => pageErrors.push(err.message));

    const response = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(response?.status(), "homepage HTTP status").toBeLessThan(400);

    // Catch a Vercel Deployment Protection wall instead of failing cryptically.
    await expect(
      page.locator("body"),
      "deployment appears to be behind an auth wall",
    ).not.toContainText(/Authentication Required/i);

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/musician|work/i);

    expect(serverErrors, `5xx responses on homepage: ${serverErrors.join(", ")}`).toHaveLength(0);
    expect(pageErrors, `uncaught errors on homepage: ${pageErrors.join(", ")}`).toHaveLength(0);
  });

  for (const path of [...PUBLIC_PATHS, ...MIXED_PATHS]) {
    test(`public page loads: ${path}`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `${path} HTTP status`).toBeLessThan(400);
      // Did not get redirected away (these are public).
      expect(new URL(page.url()).pathname).toBe(path);
      await expect(page.getByRole("heading").first()).toBeVisible();
    });
  }
});

test.describe("auth forms are intact", () => {
  test("sign-in exposes email, password, and submit", async ({ page }) => {
    await page.goto("/signin");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("sign-up exposes all required fields", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('input[name="termsAccepted"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  });
});

test.describe("auth trust boundary (signed-out)", () => {
  for (const path of PROTECTED_PATHS) {
    test(`redirects to sign-in: ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/signin\?callbackUrl=/);
    });
  }

  test("onboarding redirects to sign-in", async ({ page }) => {
    await page.goto("/onboarding/role");
    await expect(page).toHaveURL(
      (url) =>
        url.pathname === "/signin" &&
        url.searchParams.get("callbackUrl") === "/onboarding/role",
    );
  });
});

test("unknown route renders the branded 404", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.locator("body")).toContainText("Page not found");
});

/**
 * Stale and mistyped detail links (MVP-07, issue #35). Both routes are keyed by
 * uuid, so a malformed id used to reach Postgres and come back as a 22P02 error
 * boundary. Signed-out and read-only, so this is safe against a deployment.
 */
const MISSING_UUID = "00000000-0000-4000-8000-000000000000";

for (const [label, id] of [
  ["malformed", "not-a-real-id"],
  ["well-formed but missing", MISSING_UUID],
] as const) {
  for (const section of ["musicians", "gigs"] as const) {
    test(`a ${label} /${section} id renders the branded 404 without a database error`, async ({ page }) => {
      const pageErrors: string[] = [];
      const consoleErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });

      await page.goto(`/${section}/${id}`);
      // The rendered page is what is asserted, not the status code: both detail
      // routes have a `loading.tsx`, so the response streams and its 200 header
      // is already on the wire before `notFound()` resolves. That is framework
      // behaviour and predates this check; what matters here is that a bad id
      // lands on the branded 404 instead of an error boundary.
      await expect(page.locator("body")).toContainText("Page not found");
      expect(pageErrors).toEqual([]);
      expect(consoleErrors.join("\n")).not.toMatch(/22P02|invalid input syntax/i);
    });
  }
}
