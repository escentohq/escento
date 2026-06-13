import type { MessagingUserSummary } from "@/lib/api/types";

const DEFAULT_SUPPORT_EMAIL = "aryanandshrestha@gmail.com";

export function getEscentoSupportAccountEmail() {
  return (
    process.env.ESCENTO_SUPPORT_ACCOUNT_EMAIL?.trim().toLowerCase() ||
    process.env.SUPPORT_EMAIL?.trim().toLowerCase() ||
    DEFAULT_SUPPORT_EMAIL
  );
}

export function isEscentoSupportSummary(user?: MessagingUserSummary | null) {
  if (!user) return false;
  if (user.isAdminSupportAccount) return true;
  return user.email?.toLowerCase() === getEscentoSupportAccountEmail();
}

export function getMessagingDisplayName(user?: MessagingUserSummary | null) {
  if (isEscentoSupportSummary(user)) return "Escento";
  return user?.name || user?.email || "Escento user";
}
