import type {
  ConnectionRequest,
  MessageRecord,
  MessagingUserSummary,
} from "@/lib/api/types";

const MESSAGE_EMAIL_THROTTLE_MS = 10 * 60 * 1000;
const recentMessageNotifications = new Map<string, number>();

type NotificationPayload = {
  to: MessagingUserSummary | undefined;
  subject: string;
  text: string;
  throttleKey?: string;
  throttleMs?: number;
};

function displayName(user?: MessagingUserSummary) {
  return user?.name || user?.email || "Someone";
}

function messagePreview(body: string) {
  const compact = body.replace(/\s+/g, " ").trim();
  if (!compact) return "Open Escento to read it.";
  return compact.length > 90 ? `${compact.slice(0, 89).trimEnd()}...` : compact;
}

async function sendEmailNotification(payload: NotificationPayload) {
  if (!payload.to?.email) return;

  if (payload.throttleKey) {
    const now = Date.now();
    const lastSentAt = recentMessageNotifications.get(payload.throttleKey) ?? 0;
    if (now - lastSentAt < (payload.throttleMs ?? MESSAGE_EMAIL_THROTTLE_MS)) {
      return;
    }
    recentMessageNotifications.set(payload.throttleKey, now);
  }

  try {
    // TODO: Wire to a real provider (Resend, Postmark, SendGrid, etc.).
    // Keep this server-only and do not block product mutations on provider errors.
    console.info("[messaging-email:stub]", {
      to: payload.to.email,
      subject: payload.subject,
    });
  } catch (error) {
    console.error("[messaging-email] notification failed:", error);
  }
}

export async function queueConnectionRequestNotification(request: ConnectionRequest) {
  await sendEmailNotification({
    to: request.recipient,
    subject: "You have a new connection request on Escento.",
    text: `${displayName(request.requester)} sent you a connection request on Escento.`,
  });
}

export async function queueAcceptedConnectionRequestNotification(request: ConnectionRequest) {
  await sendEmailNotification({
    to: request.requester,
    subject: `${displayName(request.recipient)} accepted your connection request.`,
    text: "Open Escento to start the conversation.",
  });
}

export async function queueMessageNotification({
  message,
  sender,
  recipient,
}: {
  message: MessageRecord;
  sender: MessagingUserSummary | undefined;
  recipient: MessagingUserSummary | undefined;
}) {
  if (!recipient || recipient.id === message.senderId) return;

  await sendEmailNotification({
    to: recipient,
    subject: `${displayName(sender)} sent you a message on Escento.`,
    text: messagePreview(message.body),
    throttleKey: `message:${message.conversationId}:${recipient.id}`,
    throttleMs: MESSAGE_EMAIL_THROTTLE_MS,
  });
}
