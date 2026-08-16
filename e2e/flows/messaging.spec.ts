import { test, expect } from "@playwright/test";

import {
  chooseRole,
  clickUntil,
  createMusicianProfile,
  newContextPage,
  newMusicianWithProfile,
  sendConnectRequest,
  signUp,
} from "./helpers";

/**
 * Full messaging write flow across two isolated browser contexts (two real
 * users): connection request -> accept -> send -> cross-user receive on first
 * load, plus a reply from the second participant into the shared thread.
 */
test("connection request, accept, and two-way messaging", async ({ browser }) => {
  // ── User B: musician with a public profile (the recipient) ──
  //
  // B has to be *launch ready*, not merely saved. Since issue #28 a profile with
  // only a display name is a draft: its owner can see and resume it, but it is
  // not anonymous inventory, so A would get a 404 here instead of a Connect
  // button. This test predates that rule and was quarantined rather than updated.
  const { page: pageB, profileId: bProfileId } = await newMusicianWithProfile(
    browser,
    "msg-b",
    `Recipient ${Date.now().toString(36)}`,
  );

  // ── User A: musician who initiates the connection (the requester) ──
  // A's own profile stays a draft on purpose: nobody has to look at it, and it
  // keeps this test honest about which profile needs to be public.
  const pageA = await newContextPage(browser);
  await signUp(pageA, "msg-a");
  await chooseRole(pageA, "MUSICIAN");
  await createMusicianProfile(pageA, `Requester ${Date.now().toString(36)}`);

  // A sends a connection request from B's public profile. The helper waits for
  // the Server Action's POST, not just the optimistic "Pending", so B's request
  // list below is guaranteed to have something in it.
  await sendConnectRequest(pageA, bProfileId);

  // B accepts the incoming request and lands in the new conversation.
  await pageB.goto("/messages/requests");
  await clickUntil(
    pageB.getByRole("button", { name: "Accept" }),
    // Accepting swaps the request list for the conversation composer.
    pageB.locator("#message-body"),
  );
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
