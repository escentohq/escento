import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const PROFILE_PICTURES_BUCKET = "profile-pictures";

/**
 * Where a deletion attempt stopped. The stage decides what the account looks
 * like afterwards, and therefore what the user should be told:
 *
 * - `data`   — nothing was removed. The account is exactly as it was.
 * - `storage`— every row is gone; the profile picture file and the Auth login
 *              survive, so the owner can still sign in and retry.
 * - `auth`   — rows and files are gone; only the login survives. Retrying
 *              removes it.
 *
 * The ordering is deliberate: Auth goes last, because an account whose login
 * still works is the only failure state the owner can recover from themselves.
 * Deleting the login first would leave content behind that nobody can reach.
 */
export type AccountDeletionStage = "data" | "storage" | "auth";

export class AccountDeletionError extends Error {
  constructor(
    readonly stage: AccountDeletionStage,
    override readonly cause: unknown,
  ) {
    super(`Account deletion failed at the ${stage} stage.`);
    this.name = "AccountDeletionError";
  }
}

/** A retry finds the Auth user already gone. That is success, not a failure. */
function isMissingAuthUser(error: { status?: number; message?: string }): boolean {
  if (error.status === 404) return true;
  return /user not found/i.test(error.message ?? "");
}

/**
 * Remove an account completely, in a way that is safe to run twice.
 *
 * Every database delete happens inside `delete_app_user_data`, which is a single
 * transaction, so the row half of this is all-or-nothing. Storage and Auth are
 * separate systems that cannot join that transaction, so instead they are made
 * idempotent: listing an empty folder removes nothing, and deleting an Auth user
 * that is already gone counts as done. Running this again after any failure
 * converges on the same finished state.
 */
export async function deleteUserCompletely(userId: string): Promise<void> {
  const admin = createSupabaseAdminClient();

  const { error: dataError } = await admin.rpc("delete_app_user_data", { p_user_id: userId });
  if (dataError) throw new AccountDeletionError("data", dataError);

  try {
    const existing = await admin.storage.from(PROFILE_PICTURES_BUCKET).list(userId);
    if (existing.error) throw existing.error;

    if (existing.data?.length) {
      const { error: removeError } = await admin.storage
        .from(PROFILE_PICTURES_BUCKET)
        .remove(existing.data.map((item) => `${userId}/${item.name}`));
      if (removeError) throw removeError;
    }
  } catch (error) {
    throw new AccountDeletionError("storage", error);
  }

  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError && !isMissingAuthUser(authError)) {
    throw new AccountDeletionError("auth", authError);
  }
}
