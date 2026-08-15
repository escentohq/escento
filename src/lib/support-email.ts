import { sendResendEmail } from "@/lib/resend-email";

type SupportEmailPayload = {
  name: string | null;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  userId: string | null;
};

type SupportEmailResult =
  | { ok: true }
  | { ok: false; reason: "missing_destination" | "delivery_not_configured" | "delivery_failed" };

// Resend's shared sender works without domain verification, but only delivers
// to the address that owns the Resend account. Set SUPPORT_FROM_EMAIL to a
// verified-domain sender (e.g. "Escento Support <support@yourdomain.com>") to
// deliver to any destination.
const DEFAULT_FROM = "Escento Support <onboarding@resend.dev>";

function formatSupportEmail(payload: SupportEmailPayload) {
  return [
    `From: ${payload.name ? `${payload.name} <${payload.email}>` : payload.email}`,
    `User email: ${payload.email}`,
    `User ID: ${payload.userId ?? "Not signed in"}`,
    `Submitted at: ${payload.submittedAt}`,
    "",
    "Subject:",
    payload.subject,
    "",
    "Message:",
    payload.message,
  ].join("\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatSupportEmailHtml(payload: SupportEmailPayload) {
  const fromLine = payload.name
    ? `${escapeHtml(payload.name)} &lt;${escapeHtml(payload.email)}&gt;`
    : escapeHtml(payload.email);
  return [
    `<p><strong>From:</strong> ${fromLine}</p>`,
    `<p><strong>User email:</strong> ${escapeHtml(payload.email)}</p>`,
    `<p><strong>User ID:</strong> ${escapeHtml(payload.userId ?? "Not signed in")}</p>`,
    `<p><strong>Submitted at:</strong> ${escapeHtml(payload.submittedAt)}</p>`,
    `<hr />`,
    `<p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>`,
    `<p><strong>Message:</strong></p>`,
    `<p style="white-space:pre-wrap">${escapeHtml(payload.message)}</p>`,
  ].join("\n");
}

export async function sendSupportEmail(payload: SupportEmailPayload): Promise<SupportEmailResult> {
  const destination = process.env.SUPPORT_EMAIL;
  if (!destination) {
    console.error("[support-email] SUPPORT_EMAIL is not configured.");
    return { ok: false, reason: "missing_destination" };
  }

  const result = await sendResendEmail({
    from: process.env.SUPPORT_FROM_EMAIL || DEFAULT_FROM,
    to: destination,
    replyTo: payload.email,
    subject: `[Escento Support] ${payload.subject}`,
    text: formatSupportEmail(payload),
    html: formatSupportEmailHtml(payload),
  });

  if (!result.ok) {
    console.error("[support-email] delivery failed:", result.reason);
  }

  return result;
}
