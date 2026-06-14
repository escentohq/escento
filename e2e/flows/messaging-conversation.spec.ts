import { test, expect } from "@playwright/test";

import { acceptedConversation } from "./helpers";

test("conversation supports keyboard enter-to-send", async ({ browser }) => {
  const { requester, conversationId } = await acceptedConversation(
    browser,
    "msg-kb-requester",
    "msg-kb-recipient",
  );

  await requester.goto(`/messages/${conversationId}`);

  const body = requester.locator("#message-body");
  await body.fill("Keyboard send test");
  await body.press("Enter");

  await expect(requester.getByText("Keyboard send test")).toBeVisible();
});
