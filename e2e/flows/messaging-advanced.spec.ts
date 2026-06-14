import { test, expect, type Browser, type Page } from "@playwright/test";

import { newMusician, newMusicianWithProfile, sendConnectRequest } from "./helpers";

const stamp = () => Date.now().toString(36);

/**
 * Advanced messaging write flows: request reject/cancel, duplicate-request
 * prevention, empty-message validation, block/unblock, and the self-connect
 * guard. Each scenario uses isolated browser contexts for distinct real users.
 */
test.describe("connection requests", () => {
  test("recipient can reject an incoming request", async ({ browser }) => {
    const { page: recipient, profileId } = await newMusicianWithProfile(browser, "rej-b", `Reject Target ${stamp()}`);
    const requester = await newMusician(browser, "rej-a");

    await sendConnectRequest(requester, profileId);

    await recipient.goto("/messages/requests");
    // Reject invokes a Next.js Server Action (a POST to the current route) inside
    // a React transition. Wait for that POST to complete so the mutation has
    // committed server-side before we re-read the page.
    await Promise.all([
      recipient.waitForResponse(
        (r) => r.request().method() === "POST" && r.status() < 400,
      ),
      recipient.getByRole("button", { name: "Reject" }).click(),
    ]);

    // Read committed state from a fresh server render. The action revalidates
    // /messages/requests, so the rejected request no longer appears as incoming.
    await recipient.goto("/messages/requests");
    await expect(recipient.getByText("No incoming requests.")).toBeVisible();
  });

  test("sender can cancel an outgoing request", async ({ browser }) => {
    const { profileId } = await newMusicianWithProfile(browser, "can-b", `Cancel Target ${stamp()}`);
    const requester = await newMusician(browser, "can-a");

    await sendConnectRequest(requester, profileId);

    await requester.goto("/messages/requests");
    // Cancel invokes a Next.js Server Action (a POST to the current route) inside
    // a React transition. Wait for that POST to complete so the mutation has
    // committed server-side before we re-read the page.
    await Promise.all([
      requester.waitForResponse(
        (r) => r.request().method() === "POST" && r.status() < 400,
      ),
      requester.getByRole("button", { name: "Cancel" }).click(),
    ]);

    // Read committed state from a fresh server render. The action revalidates
    // /messages/requests, so the outgoing row now shows "cancelled" with no
    // Cancel button.
    await requester.goto("/messages/requests");
    await expect(requester.getByText("cancelled")).toBeVisible();
    await expect(requester.getByRole("button", { name: "Cancel" })).toHaveCount(0);
  });

  test("a duplicate connect stays one pending request", async ({ browser }) => {
    const { page: recipient, profileId } = await newMusicianWithProfile(browser, "dup-b", `Dup Target ${stamp()}`);
    const requester = await newMusician(browser, "dup-a");

    await sendConnectRequest(requester, profileId);

    // Reloading the profile shows the pending state, not a fresh Connect button.
    await requester.reload();
    await expect(requester.getByText("Pending")).toBeVisible();
    await expect(requester.getByRole("button", { name: "Connect", exact: true })).toHaveCount(0);

    // The recipient sees exactly one incoming request.
    await recipient.goto("/messages/requests");
    await expect(recipient.getByRole("button", { name: "Accept" })).toHaveCount(1);
  });
});

test.describe("conversation controls", () => {
  async function openAcceptedConversation(browser: Browser): Promise<{ requester: Page; recipient: Page }> {
    const { page: recipient, profileId } = await newMusicianWithProfile(browser, "conv-b", `Conv Target ${stamp()}`);
    const requester = await newMusician(browser, "conv-a");

    await sendConnectRequest(requester, profileId);
    await recipient.goto("/messages/requests");
    await recipient.getByRole("button", { name: "Accept" }).click();
    // Exclude /messages/requests (it also matches /messages/<id>) so we wait for
    // the real conversation route rather than resolving on the current page.
    await recipient.waitForURL(/\/messages\/(?!requests$|blocked$)[^/]+$/);
    return { requester, recipient };
  }

  test("sending an empty message shows a validation error", async ({ browser }) => {
    const { recipient } = await openAcceptedConversation(browser);
    await recipient.getByRole("button", { name: "Send" }).click();
    await expect(recipient.getByText("Add a message.")).toBeVisible();
  });

  test("a participant can block and unblock from a conversation", async ({ browser }) => {
    const { recipient } = await openAcceptedConversation(browser);

    await recipient.getByRole("button", { name: "Block", exact: true }).click();
    await expect(recipient.getByRole("button", { name: "Unblock", exact: true })).toBeVisible();

    await recipient.getByRole("button", { name: "Unblock", exact: true }).click();
    await expect(recipient.getByRole("button", { name: "Block", exact: true })).toBeVisible();
  });
});

test("own profile offers no connect action", async ({ browser }) => {
  const name = `Self View ${stamp()}`;
  const { page, profileId } = await newMusicianWithProfile(browser, "self", name);

  await page.goto(`/musicians/${profileId}`);
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await expect(page.getByRole("button", { name: "Connect", exact: true })).toHaveCount(0);
});
