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

export async function sendSupportEmail(payload: SupportEmailPayload): Promise<SupportEmailResult> {
  const destination = process.env.SUPPORT_EMAIL;
  if (!destination) {
    console.error("[support-email] SUPPORT_EMAIL is not configured.");
    return { ok: false, reason: "missing_destination" };
  }

  try {
    // TODO: Wire this to a real transactional email provider once provider credentials exist.
    // Keep the destination in SUPPORT_EMAIL so switching to support@motivo-domain.com is config-only.
    console.info("[support-email:pending-provider]", {
      to: destination,
      replyTo: payload.email,
      subject: `[Motivo Support] ${payload.subject}`,
      body: formatSupportEmail(payload),
    });

    return { ok: false, reason: "delivery_not_configured" };
  } catch (error) {
    console.error("[support-email] delivery failed:", error);
    return { ok: false, reason: "delivery_failed" };
  }
}

