import type { MessagingUserSummary } from "@/lib/api/types";

const DEFAULT_SUPPORT_EMAIL = "aryanandshrestha@gmail.com";

export function getMotivoSupportAccountEmail() {
  return (
    process.env.MOTIVO_SUPPORT_ACCOUNT_EMAIL?.trim().toLowerCase() ||
    process.env.SUPPORT_EMAIL?.trim().toLowerCase() ||
    DEFAULT_SUPPORT_EMAIL
  );
}

export function isMotivoSupportSummary(user?: MessagingUserSummary | null) {
  if (!user) return false;
  if (user.isAdminSupportAccount) return true;
  return user.email?.toLowerCase() === getMotivoSupportAccountEmail();
}

export function getMessagingDisplayName(user?: MessagingUserSummary | null) {
  if (isMotivoSupportSummary(user)) return "Motivo";
  return user?.name || user?.email || "Motivo user";
}
