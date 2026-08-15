"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth-guards";
import { createProfile, getProfileByUserId, updateProfile } from "@/lib/api/profiles";
import { emptyProfileInput, validateIdentity } from "@/lib/profile-validation";
import { profileValuesFromFormData } from "@/lib/form-snapshots";
import { formLevelMessage, type ActionState } from "@/lib/form-utils";
import { invalidatePublicProfile } from "@/lib/public-cache-invalidation";

/**
 * Step one. Creates the profile row from a display name alone, then drops the
 * user straight into the directory — the rest of the wizard is reachable from
 * the reminder strip there, so nobody is held behind three more screens.
 */
export async function saveIdentityAction(_state: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireRole("MUSICIAN", "/profile/create/identity");

  const parsed = validateIdentity(fd);
  if (Object.keys(parsed.fieldErrors).length) {
    return {
      ok: false,
      message: formLevelMessage(parsed.fieldErrors, "Add the name creators should see."),
      fieldErrors: parsed.fieldErrors,
      values: profileValuesFromFormData(fd),
    };
  }

  const existing = await getProfileByUserId(session.user.id);
  const profile = existing
    ? await updateProfile(existing.id, parsed.data, session.user.id)
    : await createProfile(
        session.user.id,
        { ...emptyProfileInput(session.user.email ?? ""), ...parsed.data },
        [],
        [],
      );

  revalidatePath("/");
  revalidatePath("/musicians");
  invalidatePublicProfile(profile.id);
  redirect("/musicians");
}
