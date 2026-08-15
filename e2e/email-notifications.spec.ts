import { expect, test } from "@playwright/test";

import type {
  ConnectionRequest,
  MessageRecord,
  MessagingUserSummary,
} from "../src/lib/api/types";
import {
  buildConnectionRequestEmail,
  buildMessageEmail,
  createNotificationPreview,
  queueConnectionRequestNotification,
  queueMessageNotification,
} from "../src/lib/messaging-notifications";
import { sendResendEmail, type ResendEmailPayload } from "../src/lib/resend-email";

const APP_URL = "https://escento.example";

function user(
  id: string,
  email: string | null,
  name: string | null,
  role: MessagingUserSummary["role"] = null,
): MessagingUserSummary {
  return { id, email, name, role, image: null };
}

function requestFixture(introMessage: string | null = null): ConnectionRequest {
  return {
    id: "request-123",
    requesterId: "sender-id",
    recipientId: "recipient-id",
    status: "pending",
    introMessage,
    createdAt: "2026-08-15T12:00:00.000Z",
    updatedAt: "2026-08-15T12:00:00.000Z",
    acceptedAt: null,
    rejectedAt: null,
    requester: user("sender-id", "sender@example.test", "Ari <script>alert(1)</script>", "MUSICIAN"),
    recipient: user("recipient-id", "recipient@example.test", "Riley"),
  };
}

function messageFixture(body: string): MessageRecord {
  return {
    id: "message-456",
    conversationId: "conversation/789",
    senderId: "sender-id",
    body,
    createdAt: "2026-08-15T12:00:00.000Z",
    updatedAt: "2026-08-15T12:00:00.000Z",
    deletedAt: null,
  };
}

test("request email targets only the account recipient and safely previews the intro", () => {
  const intro = `<script>alert("x")</script>\n\n${"music ".repeat(40)}`;
  const preview = createNotificationPreview(intro);
  const email = buildConnectionRequestEmail(requestFixture(intro), APP_URL);

  expect(email).not.toBeNull();
  expect(email?.to).toBe("recipient@example.test");
  expect(email?.to).not.toBe("sender@example.test");
  expect(email?.subject).toContain("Ari <script>alert(1)</script>");
  expect(email?.text).toContain("View request: https://escento.example/messages/requests");
  expect(email?.html).toContain("https://escento.example/messages/requests");
  expect(email?.html).toContain("&lt;script&gt;");
  expect(email?.html).not.toContain("<script>");
  expect(Array.from(preview ?? "")).toHaveLength(160);
  expect(email?.idempotencyKey).toBe("connection-request/request-123");
});

test("message email targets the other participant with a safe conversation preview", () => {
  const body = `<img src=x onerror=alert(1)>\n${"hello ".repeat(40)}`;
  const email = buildMessageEmail(
    {
      message: messageFixture(body),
      sender: user("sender-id", "sender@example.test", "Jordan"),
      recipient: user("recipient-id", "recipient@example.test", "Casey"),
    },
    APP_URL,
  );

  expect(email?.to).toBe("recipient@example.test");
  expect(email?.subject).toBe("New message from Jordan on Escento");
  expect(email?.text).toContain(
    "View conversation: https://escento.example/messages/conversation%2F789",
  );
  expect(email?.html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  expect(email?.html).not.toContain("<img");
  expect(email?.idempotencyKey).toBe("direct-message/message-456");
});

test("missing identity data degrades safely and self or deleted recipients are skipped", () => {
  const request = requestFixture();
  request.requester = undefined;
  request.recipient = user("recipient-id", "recipient@example.test", null);

  expect(buildConnectionRequestEmail(request, APP_URL)?.subject).toBe(
    "Someone sent you a request on Escento",
  );

  expect(
    buildMessageEmail(
      {
        message: messageFixture("Hello"),
        sender: undefined,
        recipient: undefined,
      },
      APP_URL,
    ),
  ).toBeNull();

  expect(
    buildMessageEmail(
      {
        message: messageFixture("Hello"),
        sender: user("sender-id", "sender@example.test", "Jordan"),
        recipient: user("sender-id", "sender@example.test", "Jordan"),
      },
      APP_URL,
    ),
  ).toBeNull();
});

test("each notification hook invokes delivery once and absorbs provider failure", async () => {
  const delivered: ResendEmailPayload[] = [];
  const failingDelivery = async (payload: ResendEmailPayload) => {
    delivered.push(payload);
    throw new Error("provider unavailable");
  };
  const originalConsoleError = console.error;
  console.error = () => undefined;

  try {
    await expect(
      queueConnectionRequestNotification(requestFixture("Let us collaborate"), {
        appUrl: APP_URL,
        deliver: failingDelivery,
      }),
    ).resolves.toBeUndefined();

    await expect(
      queueMessageNotification(
        {
          message: messageFixture("Hello"),
          sender: user("sender-id", "sender@example.test", "Jordan"),
          recipient: user("recipient-id", "recipient@example.test", "Casey"),
        },
        { appUrl: APP_URL, deliver: failingDelivery },
      ),
    ).resolves.toBeUndefined();
  } finally {
    console.error = originalConsoleError;
  }

  expect(delivered).toHaveLength(2);
  expect(delivered.map((email) => email.idempotencyKey)).toEqual([
    "connection-request/request-123",
    "direct-message/message-456",
  ]);
});

test("shared Resend transport forwards the event idempotency key without real delivery", async () => {
  const previousApiKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "re_test_only";
  let capturedInit: RequestInit | undefined;
  const fakeFetch: typeof fetch = async (_input, init) => {
    capturedInit = init;
    return new Response('{"id":"email-id"}', { status: 200 });
  };

  try {
    const result = await sendResendEmail(
      {
        from: "Escento <notifications@example.test>",
        to: "recipient@example.test",
        subject: "Test",
        text: "Test",
        html: "<p>Test</p>",
        idempotencyKey: "direct-message/message-456",
      },
      fakeFetch,
    );

    expect(result).toEqual({ ok: true });
    expect(new Headers(capturedInit?.headers).get("Idempotency-Key")).toBe(
      "direct-message/message-456",
    );
  } finally {
    if (previousApiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousApiKey;
  }
});
