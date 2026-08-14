import { test, expect } from "@playwright/test";

/**
 * Read-only smoke checks. Every case is signed-out and never writes data, so
 * this is safe to run against the live Supabase-backed deployment.
 */

// Public pages that must load without redirecting a signed-out visitor away.
const PUBLIC_PATHS = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/help",
  "/privacy",
  "/terms",
  "/compliance",
  "/musicians",
  "/gigs",
];

// Protected routes that must bounce a signed-out visitor to the sign-in page.
const PROTECTED_PATHS = [
  "/account",
  "/messages",
  "/profile/create",
  "/gigs/create",
  "/gigs/manage",
];

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

  for (const path of PUBLIC_PATHS) {
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
    await expect(page).toHaveURL(/\/signin\?callbackUrl=%2Fonboarding%2Frole/);
  });
});

test("unknown route renders the branded 404", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.locator("body")).toContainText("Lost in the mix.");
});
