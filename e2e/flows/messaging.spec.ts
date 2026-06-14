import { test, expect, type Browser, type Page } from "@playwright/test";

import { signUp, chooseRole, createMusicianProfile } from "./helpers";

/**
 * Full messaging write flow across two isolated browser contexts (two real
 * users): connection request -> accept -> send -> cross-user receive on first
 * load, plus a reply from the second participant into the shared thread.
 */
async function newUserPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext();
  return context.newPage();
}

test("connection request, accept, and two-way messaging", async ({ browser }) => {
  // ── User B: musician with a public profile (the recipient) ──
  const pageB = await newUserPage(browser);
  await signUp(pageB, "msg-b");
  await chooseRole(pageB, "MUSICIAN");
  const bDisplayName = `Recipient ${Date.now().toString(36)}`;
  const bProfileId = await createMusicianProfile(pageB, bDisplayName);

  // ── User A: musician who initiates the connection (the requester) ──
  const pageA = await newUserPage(browser);
  await signUp(pageA, "msg-a");
  await chooseRole(pageA, "MUSICIAN");
  await createMusicianProfile(pageA, `Requester ${Date.now().toString(36)}`);

  // A sends a connection request from B's public profile.
  await pageA.goto(`/musicians/${bProfileId}`);
  await pageA.getByRole("button", { name: "Connect" }).click();
  await expect(pageA.getByText("Pending")).toBeVisible();

  // B accepts the incoming request and lands in the new conversation.
  await pageB.goto("/messages/requests");
  await pageB.getByRole("button", { name: "Accept" }).click();
  // Exclude /messages/requests (it also matches /messages/<id>) so we wait for
  // the real conversation route rather than resolving on the current page.
  await pageB.waitForURL(/\/messages\/(?!requests$|blocked$)[^/]+$/, { timeout: 30_000 });

  // B sends the first message.
  const messageFromB = "Hello from B — automated test.";
  await pageB.locator("#message-body").fill(messageFromB);
  await pageB.getByRole("button", { name: "Send" }).click();
  await expect(pageB.getByText(messageFromB)).toBeVisible();

  // A opens the now-connected conversation via the profile's Message button.
  // This is A's FIRST load of the thread, so it reflects committed data: A sees
  // B's message — proving cross-user delivery.
  await pageA.goto(`/musicians/${bProfileId}`);
  await pageA.getByRole("link", { name: "Message" }).click();
  await pageA.waitForURL(/\/messages\/[^/]+$/, { timeout: 30_000 });
  await expect(pageA.getByText(messageFromB)).toBeVisible();

  // The second participant can also post into the shared thread.
  const messageFromA = "Hi from A — reply received.";
  await pageA.locator("#message-body").fill(messageFromA);
  await pageA.getByRole("button", { name: "Send" }).click();
  await expect(pageA.getByText(messageFromA)).toBeVisible();

  // Both messages now coexist in the one shared conversation.
  await expect(pageA.getByText(messageFromB)).toBeVisible();
});
