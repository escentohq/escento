import type { MessageRecord } from "@/lib/api/types";

export async function queueMessageNotification(_message: MessageRecord): Promise<void> {
  // Stub for future email/in-app notification fanout.
}
