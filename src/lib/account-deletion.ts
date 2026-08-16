/** Shown when SUPABASE_SERVICE_ROLE_KEY is missing (client-safe message). */
export const DELETE_ACCOUNT_UNAVAILABLE =
  "Account deletion is temporarily unavailable. Contact support.";

export const ADMIN_CREDENTIALS_ERROR = "Supabase admin credentials are not configured.";

/**
 * Deletion messages, one per outcome. Each says what actually happened, because
 * the states are genuinely different: after a `data` failure the account is
 * untouched, while after a `storage` or `auth` failure the account's content is
 * already gone and only the sign-in remains. Telling both "try again" is fine;
 * telling both "nothing was deleted" would not be true.
 */
export const DELETE_ACCOUNT_NOT_STARTED =
  "Your account could not be deleted. Nothing was removed. Try again.";

export const DELETE_ACCOUNT_PARTIAL =
  "Your profile, gigs, and messages were deleted, but your sign-in is still active. Delete again to finish.";
