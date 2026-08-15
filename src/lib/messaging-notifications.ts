import type {
  ConnectionRequest,
  MessageRecord,
  MessagingUserSummary,
} from "@/lib/api/types";
import {
  sendResendEmail,
  type ResendEmailPayload,
  type ResendEmailResult,
} from "@/lib/resend-email";

const DEFAULT_FROM = "Escento <onboarding@resend.dev>";
const PREVIEW_MAX_LENGTH = 160;

type NotificationDelivery = (payload: ResendEmailPayload) => Promise<ResendEmailResult>;

type NotificationOptions = {
  appUrl?: string;
  deliver?: NotificationDelivery;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizePlainText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function createNotificationPreview(value: string) {
  const compact = normalizePlainText(value);
  if (!compact) return null;

  const characters = Array.from(compact);
  if (characters.length <= PREVIEW_MAX_LENGTH) return compact;

  return `${characters.slice(0, PREVIEW_MAX_LENGTH - 1).join("").trimEnd()}…`;
}

function displayName(user?: MessagingUserSummary) {
  const name = createNotificationPreview(user?.name ?? "");
  return name || "Someone";
}

function roleLabel(user?: MessagingUserSummary) {
  if (user?.role === "MUSICIAN") return "Musician";
  if (user?.role === "CREATOR") return "Creator";
  return null;
}

function applicationUrl(configuredUrl?: string) {
  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function notificationFromAddress() {
  return process.env.NOTIFICATION_FROM_EMAIL || process.env.SUPPORT_FROM_EMAIL || DEFAULT_FROM;
}

function emailShell({
  headline,
  greeting,
  description,
  preview,
  ctaLabel,
  href,
}: {
  headline: string;
  greeting: string;
  description: string;
  preview: string | null;
  ctaLabel: string;
  href: string;
}) {
  const escapedHref = escapeHtml(href);
  const previewHtml = preview
    ? `<blockquote style="margin:24px 0;padding:0 0 0 16px;border-left:3px solid #0055FF;color:#334155">${escapeHtml(preview)}</blockquote>`
    : "";

  return [
    '<div style="margin:0;background:#FAFAFA;color:#0F172A;font-family:Arial,sans-serif;line-height:1.55">',
    '<div style="max-width:600px;margin:0 auto;padding:32px 24px">',
    '<p style="margin:0 0 32px;font-size:18px;font-weight:700">Escento</p>',
    `<h1 style="margin:0 0 20px;font-size:28px;line-height:1.2">${escapeHtml(headline)}</h1>`,
    `<p style="margin:0 0 12px">${escapeHtml(greeting)}</p>`,
    `<p style="margin:0">${escapeHtml(description)}</p>`,
    previewHtml,
    `<p style="margin:28px 0"><a href="${escapedHref}" style="display:inline-block;background:#0055FF;color:#FFFFFF;padding:12px 18px;text-decoration:none;font-weight:700">${escapeHtml(ctaLabel)}</a></p>`,
    `<p style="margin:32px 0 0;color:#64748B;font-size:13px">If the button does not work, open ${escapedHref}</p>`,
    "</div>",
    "</div>",
  ].join("");
}

export function buildConnectionRequestEmail(
  request: ConnectionRequest,
  configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL,
): ResendEmailPayload | null {
  if (!request.recipient?.email || request.requesterId === request.recipient.id) return null;

  const baseUrl = applicationUrl(configuredAppUrl);
  if (!baseUrl) return null;

  const senderName = displayName(request.requester);
  const senderRole = roleLabel(request.requester);
  const recipientName = createNotificationPreview(request.recipient.name ?? "");
  const preview = createNotificationPreview(request.introMessage ?? "");
  const href = `${baseUrl}/messages/requests`;
  const headline = `${senderName} sent you a request`;
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi,";
  const description = senderRole
    ? `${senderName}, a ${senderRole.toLowerCase()} on Escento, sent you a connection request.`
    : `${senderName} sent you a connection request on Escento.`;
  const text = [
    "Escento",
    "",
    headline,
    "",
    greeting,
    description,
    ...(preview ? ["", `“${preview}”`] : []),
    "",
    `View request: ${href}`,
  ].join("\n");

  return {
    from: notificationFromAddress(),
    to: request.recipient.email,
    subject: `${senderName} sent you a request on Escento`,
    text,
    html: emailShell({
      headline,
      greeting,
      description,
      preview,
      ctaLabel: "View request",
      href,
    }),
    idempotencyKey: `connection-request/${request.id}`,
  };
}

export function buildMessageEmail(
  {
    message,
    sender,
    recipient,
  }: {
    message: MessageRecord;
    sender: MessagingUserSummary | undefined;
    recipient: MessagingUserSummary | undefined;
  },
  configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL,
): ResendEmailPayload | null {
  if (!recipient?.email || recipient.id === message.senderId) return null;

  const baseUrl = applicationUrl(configuredAppUrl);
  if (!baseUrl) return null;

  const senderName = displayName(sender);
  const recipientName = createNotificationPreview(recipient.name ?? "");
  const preview = createNotificationPreview(message.body);
  const displayedPreview = preview || "Open Escento to read the message.";
  const href = `${baseUrl}/messages/${encodeURIComponent(message.conversationId)}`;
  const headline = `New message from ${senderName}`;
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi,";
  const description = `${senderName} sent you a message on Escento.`;
  const text = [
    "Escento",
    "",
    headline,
    "",
    greeting,
    description,
    "",
    preview ? `“${preview}”` : displayedPreview,
    "",
    `View conversation: ${href}`,
  ].join("\n");

  return {
    from: notificationFromAddress(),
    to: recipient.email,
    subject: `New message from ${senderName} on Escento`,
    text,
    html: emailShell({
      headline,
      greeting,
      description,
      preview: displayedPreview,
      ctaLabel: "View conversation",
      href,
    }),
    idempotencyKey: `direct-message/${message.id}`,
  };
}

async function deliverBestEffort(
  payload: ResendEmailPayload | null,
  deliver: NotificationDelivery,
) {
  if (!payload) return;

  try {
    const result = await deliver(payload);
    if (!result.ok) {
      console.error("[messaging-email] notification failed:", result.reason);
    }
  } catch (error) {
    console.error("[messaging-email] notification failed:", error);
  }
}

export async function queueConnectionRequestNotification(
  request: ConnectionRequest,
  options: NotificationOptions = {},
) {
  try {
    const payload = buildConnectionRequestEmail(request, options.appUrl);
    if (
      !payload &&
      request.recipient?.email &&
      request.requesterId !== request.recipient.id &&
      !applicationUrl(options.appUrl ?? process.env.NEXT_PUBLIC_APP_URL)
    ) {
      console.error("[messaging-email] NEXT_PUBLIC_APP_URL is missing or invalid.");
    }

    await deliverBestEffort(payload, options.deliver ?? sendResendEmail);
  } catch (error) {
    console.error("[messaging-email] notification failed:", error);
  }
}

export async function queueMessageNotification(
  input: {
    message: MessageRecord;
    sender: MessagingUserSummary | undefined;
    recipient: MessagingUserSummary | undefined;
  },
  options: NotificationOptions = {},
) {
  try {
    const payload = buildMessageEmail(input, options.appUrl);
    if (
      !payload &&
      input.recipient?.email &&
      input.recipient.id !== input.message.senderId &&
      !applicationUrl(options.appUrl ?? process.env.NEXT_PUBLIC_APP_URL)
    ) {
      console.error("[messaging-email] NEXT_PUBLIC_APP_URL is missing or invalid.");
    }

    await deliverBestEffort(payload, options.deliver ?? sendResendEmail);
  } catch (error) {
    console.error("[messaging-email] notification failed:", error);
  }
}
