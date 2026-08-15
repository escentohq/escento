"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId, updateProfile } from "@/lib/api/profiles";
import { validateReach } from "@/lib/profile-validation";
import { profileValuesFromFormData } from "@/lib/form-snapshots";
import { formLevelMessage, type ActionState } from "@/lib/form-utils";
import { stepPath } from "@/lib/profile-progress";
import { invalidatePublicProfile } from "@/lib/public-cache-invalidation";

/** Step four: how creators reach and pay you. Finishes on the public profile. */
export async function saveReachAction(_state: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireRole("MUSICIAN", "/profile/create/reach");

  const existing = await getProfileByUserId(session.user.id);
  if (!existing) redirect(stepPath("identity"));

  const parsed = validateReach(fd);
  if (Object.keys(parsed.fieldErrors).length) {
    return {
      ok: false,
      message: formLevelMessage(parsed.fieldErrors, "Check the highlighted field."),
      fieldErrors: parsed.fieldErrors,
      values: profileValuesFromFormData(fd),
    };
  }

  const profile = await updateProfile(existing.id, parsed.data, session.user.id);

  revalidatePath("/");
  revalidatePath("/musicians");
  invalidatePublicProfile(profile.id);
  redirect(`/musicians/${profile.id}`);
}
