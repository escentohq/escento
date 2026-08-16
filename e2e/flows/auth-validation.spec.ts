import { test, expect } from "@playwright/test";

import { signOut, signUpAs } from "./helpers";

test.describe("auth validation", () => {
  test("signup requires a name", async ({ page }) => {
    await page.goto("/signup");
    await page.locator('input[name="email"]').fill(`noname+${Date.now().toString(36)}@example.test`);
    await page.locator('input[name="password"]').fill("Escento1234");
    await page.locator('input[name="confirmPassword"]').fill("Escento1234");
    await page.locator('input[name="termsAccepted"]').check();
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Add the name musicians should see.")).toBeVisible();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("signup enforces password and confirmation rules", async ({ page }) => {
    await page.goto("/signup");
    await page.locator('input[name="name"]').fill("Auth Tester");
    await page.locator('input[name="email"]').fill(`auth+${Date.now().toString(36)}@example.test`);
    await page.locator('input[name="password"]').fill("abcdefgh");
    await page.locator('input[name="confirmPassword"]').fill("abcdxxxx");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Use at least one letter and one number.")).toBeVisible();
    await expect(page.getByText("Passwords need to match.")).toBeVisible();
    await expect(
      page.getByText("Agree to the terms, privacy policy, and compliance policy to continue."),
    ).toBeVisible();
  });

  test("signin shows generic wrong-password error", async ({ page }) => {
    const creds = await signUpAs(page, "MUSICIAN", "signin-wrong-password");
    await signOut(page);

    await page.goto("/signin");
    await page.locator('input[name="email"]').fill(creds.email);
    await page.locator('input[name="password"]').fill("DefinitelyWrong123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("That email or password isn't right.")).toBeVisible();
    await expect(page).toHaveURL(/\/signin/);
  });

  test("signin ignores unsafe external callback urls", async ({ page }) => {
    const creds = await signUpAs(page, "MUSICIAN", "signin-callback");
    await signOut(page);

    await page.goto("/signin?callbackUrl=https://example.com");
    await page.locator('input[name="email"]').fill(creds.email);
    await page.locator('input[name="password"]').fill(creds.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.waitForURL(/\/$/, { timeout: 30_000 });
    await expect(page).toHaveURL(/\/$/);
  });
});
