import { expect, type Browser, type Page } from "@playwright/test";

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
  const label = role === "MUSICIAN" ? "I play music" : "I need musicians";
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

/** Sign in with an existing email/password and wait for the callback destination. */
export async function signIn(
  page: Page,
  email: string,
  password: string,
  callbackUrl = "/",
): Promise<void> {
  await page.goto(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(
    (url) => url.pathname === callbackUrl || (callbackUrl === "/" && url.pathname === "/"),
    { timeout: 30_000 },
  );
}

/**
 * Create a musician profile through step one of the create wizard. The display
 * name is the only required field anywhere in the flow, and step one lands on
 * the directory rather than the profile, so the id is read off the "finish your
 * profile" strip instead of the URL.
 */
export async function createMusicianProfile(page: Page, displayName: string): Promise<string> {
  await page.goto("/profile/create");
  await expect(page).toHaveURL(/\/profile\/create\/identity/);
  await page.locator('input[name="displayName"]').fill(displayName);
  await page.getByRole("button", { name: "Create Profile" }).click();
  await page.waitForURL(/\/musicians$/, { timeout: 30_000 });

  const href = await page.getByRole("link", { name: "View your profile" }).getAttribute("href");
  expect(href).toBeTruthy();
  return String(href).split("/musicians/")[1];
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
  // Exclude the create page itself: the form lives at /gigs/create which also
  // matches /gigs/<id>, so without the negative lookahead waitForURL resolves
  // immediately and returns "create" instead of the real gig id.
  await page.waitForURL(/\/gigs\/(?!create$)[^/]+$/, { timeout: 30_000 });
  return page.url().split("/gigs/")[1];
}

/** Open a fresh isolated browser context + page (a distinct logged-out user). */
export async function newContextPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext();
  return context.newPage();
}

/**
 * A signed-in musician with no profile yet. Enough to browse and send
 * connection requests (the requester side of messaging flows).
 */
export async function newMusician(browser: Browser, prefix: string): Promise<Page> {
  const page = await newContextPage(browser);
  await signUpAs(page, "MUSICIAN", prefix);
  return page;
}

/** A signed-in creator account, useful for gig-ownership and permission tests. */
export async function newCreator(browser: Browser, prefix: string): Promise<Page> {
  const page = await newContextPage(browser);
  await signUpAs(page, "CREATOR", prefix);
  return page;
}

/** A signed-in musician with a saved public profile. Returns the page + profile id. */
export async function newMusicianWithProfile(
  browser: Browser,
  prefix: string,
  displayName: string,
): Promise<{ page: Page; profileId: string }> {
  const page = await newContextPage(browser);
  await signUpAs(page, "MUSICIAN", prefix);
  const profileId = await createMusicianProfile(page, displayName);
  return { page, profileId };
}

/** Send a connection request to a musician from their public profile. */
export async function sendConnectRequest(page: Page, profileId: string): Promise<void> {
  await page.goto(`/musicians/${profileId}`);
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await expect(page.getByText("Pending")).toBeVisible();
}

/** Sign out from the account menu and land back on the homepage. */
export async function signOut(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL(/\/$/, { timeout: 30_000 });
}

/**
 * Create two musician users, send a connection request from A to B, then accept
 * it as B. Returns both pages and the new conversation id.
 */
export async function acceptedConversation(
  browser: Browser,
  requesterPrefix: string,
  recipientPrefix: string,
): Promise<{ requester: Page; recipient: Page; conversationId: string; recipientProfileId: string }> {
  const { page: recipient, profileId: recipientProfileId } = await newMusicianWithProfile(
    browser,
    recipientPrefix,
    `Recipient ${Date.now().toString(36)}`,
  );
  const requester = await newMusician(browser, requesterPrefix);

  await sendConnectRequest(requester, recipientProfileId);
  await recipient.goto("/messages/requests");
  await Promise.all([
    recipient.waitForResponse((r) => r.request().method() === "POST" && r.status() < 400),
    recipient.getByRole("button", { name: "Accept" }).click(),
  ]);
  await recipient.waitForURL(/\/messages\/(?!requests$|blocked$)[^/]+$/);

  const conversationId = recipient.url().split("/messages/")[1];
  return { requester, recipient, conversationId, recipientProfileId };
}

/**
 * Create a creator and publish a gig, returning the page and new gig id.
 */
export async function newCreatorWithGig(
  browser: Browser,
  prefix: string,
  titlePrefix = "Test Gig",
): Promise<{ page: Page; gigId: string }> {
  const page = await newCreator(browser, prefix);
  const slug = Date.now().toString(36);
  const gigId = await createGig(page, {
    title: `${titlePrefix} ${slug}`,
    description: `Gig description ${slug}`,
  });
  return { page, gigId };
}
