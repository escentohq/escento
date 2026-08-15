export type ResendEmailPayload = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  idempotencyKey?: string;
};

export type ResendEmailResult =
  | { ok: true }
  | { ok: false; reason: "delivery_not_configured" | "delivery_failed" };

type FetchImplementation = typeof fetch;

export async function sendResendEmail(
  payload: ResendEmailPayload,
  fetchImplementation: FetchImplementation = fetch,
): Promise<ResendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, reason: "delivery_not_configured" };
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    if (payload.idempotencyKey) {
      headers["Idempotency-Key"] = payload.idempotencyKey;
    }

    const response = await fetchImplementation("https://api.resend.com/emails", {
      method: "POST",
      headers,
      body: JSON.stringify({
        from: payload.from,
        to: payload.to,
        reply_to: payload.replyTo,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      return { ok: false, reason: "delivery_failed" };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "delivery_failed" };
  }
}
