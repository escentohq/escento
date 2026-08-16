"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId, updateProfile } from "@/lib/api/profiles";
import { validateCraft } from "@/lib/profile-validation";
import { profileValuesFromFormData } from "@/lib/form-snapshots";
import { formLevelMessage, type ActionState } from "@/lib/form-utils";
import { nextStepAfter, stepPath } from "@/lib/profile-progress";
import { invalidatePublicProfile } from "@/lib/public-cache-invalidation";

/** Step two: instruments and genres. */
export async function saveCraftAction(_state: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireRole("MUSICIAN", "/profile/create/craft");

  const existing = await getProfileByUserId(session.user.id);
  if (!existing) redirect(stepPath("identity"));

  const parsed = validateCraft(fd);
  if (Object.keys(parsed.fieldErrors).length) {
    return {
      ok: false,
      message: formLevelMessage(
        parsed.fieldErrors,
        "We couldn't save your instruments and genres. Try again.",
      ),
      fieldErrors: parsed.fieldErrors,
      values: profileValuesFromFormData(fd),
    };
  }

  // `updateProfile` clears both junction tables as soon as either tag list is
  // passed, so instruments and genres always travel together and the later steps
  // pass neither.
  const profile = await updateProfile(
    existing.id,
    {},
    session.user.id,
    parsed.data.instruments,
    parsed.data.genres,
  );

  revalidatePath("/");
  revalidatePath("/musicians");
  invalidatePublicProfile(profile.id);
  redirect(stepPath(nextStepAfter("craft") ?? "context"));
}
