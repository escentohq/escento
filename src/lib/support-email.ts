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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[support-email] RESEND_API_KEY is not configured.");
    return { ok: false, reason: "delivery_not_configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.SUPPORT_FROM_EMAIL || DEFAULT_FROM,
        to: destination,
        reply_to: payload.email,
        subject: `[Escento Support] ${payload.subject}`,
        text: formatSupportEmail(payload),
        html: formatSupportEmailHtml(payload),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown Resend error");
      console.error("[support-email] Resend returned an error:", errorText);
      return { ok: false, reason: "delivery_failed" };
    }

    return { ok: true };
  } catch (error) {
    console.error("[support-email] delivery failed:", error);
    return { ok: false, reason: "delivery_failed" };
  }
}
