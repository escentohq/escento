import { expect, type Page } from "@playwright/test";

/**
 * Helpers for the write-flow E2E suite. These drive the real UI against a local
 * ephemeral Supabase stack (email confirmations are disabled in
 * supabase/config.toml, so signup yields an immediate session).
 */

let counter = 0;

/** A unique, clearly-synthetic email so repeated runs never collide. */
export function uniqueEmail(prefix = "user"): string {
  counter += 1;
  const stamp = `${Date.now().toString(36)}${counter}${Math.floor(Math.random() * 1e6).toString(36)}`;
  return `${prefix}+${stamp}@example.test`;
}

export const TEST_PASSWORD = "Escento1234";

export type Role = "MUSICIAN" | "CREATOR";

/**
 * Sign up a brand-new account and land on the role picker. Returns the
 * credentials so a test can sign back in as the same user if needed.
 */
export async function signUp(page: Page, prefix = "user"): Promise<{ email: string; password: string }> {
  const email = uniqueEmail(prefix);
  await page.goto("/signup");
  await page.locator('input[name="name"]').fill("Test User");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(TEST_PASSWORD);
  await page.locator('input[name="confirmPassword"]').fill(TEST_PASSWORD);
  await page.locator('input[name="termsAccepted"]').check();
  await page.getByRole("button", { name: "Create account" }).click();

  // Confirmations are off locally, so signUp returns a session and the action
  // redirects to the onboarding role picker.
  await page.waitForURL(/\/onboarding\/role/, { timeout: 30_000 });
  return { email, password: TEST_PASSWORD };
}

/** Pick a role on the onboarding screen and wait for the role-specific landing. */
export async function chooseRole(page: Page, role: Role): Promise<void> {
  const label = role === "MUSICIAN" ? "I'm a Musician" : "I'm a Creator";
  const destination = role === "MUSICIAN" ? /\/profile\/create/ : /\/gigs\/manage/;
  await page.getByRole("button", { name: label }).click();
  await page.waitForURL(destination, { timeout: 30_000 });
}

/** Full signup + onboarding into a chosen role. */
export async function signUpAs(
  page: Page,
  role: Role,
  prefix = role.toLowerCase(),
): Promise<{ email: string; password: string }> {
  const creds = await signUp(page, prefix);
  await chooseRole(page, role);
  return creds;
}

/**
 * Create a musician profile from /profile/create. Only the display name is
 * required; isRemote defaults on, so no location/tag interaction is needed.
 * Returns the public profile id parsed from the success redirect.
 */
export async function createMusicianProfile(page: Page, displayName: string): Promise<string> {
  await page.goto("/profile/create");
  await expect(page).toHaveURL(/\/profile\/create/);
  await page.locator('input[name="displayName"]').fill(displayName);
  await page.getByRole("button", { name: "Create Profile" }).click();
  await page.waitForURL(/\/musicians\/[^/]+$/, { timeout: 30_000 });
  return page.url().split("/musicians/")[1];
}

/**
 * Publish a gig from /gigs/create. Fills the required fields; isRemote defaults
 * on so no location is needed. Returns the gig id from the success redirect.
 */
export async function createGig(
  page: Page,
  opts: { title: string; description: string; projectType?: string; compensationType?: string },
): Promise<string> {
  await page.goto("/gigs/create");
  await expect(page).toHaveURL(/\/gigs\/create/);
  await page.locator('input[name="title"]').fill(opts.title);
  await page.locator('textarea[name="description"]').fill(opts.description);
  await page.locator('select[name="projectType"]').selectOption(opts.projectType ?? "FILM");
  await page.locator('select[name="compensationType"]').selectOption(opts.compensationType ?? "PAID");
  await page.getByRole("button", { name: "Publish Gig" }).click();
  await page.waitForURL(/\/gigs\/[^/]+$/, { timeout: 30_000 });
  return page.url().split("/gigs/")[1];
}
