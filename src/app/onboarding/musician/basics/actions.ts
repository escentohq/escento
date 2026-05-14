"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId, createProfile, updateProfile } from "@/lib/api/profiles";
import { ensureInstruments, ensureGenres } from "@/lib/api/tags";
import { validateStep1 } from "@/lib/validation/profile";
import { ActionState, emptyActionState } from "@/lib/form-utils";

export async function saveBasicsAction(
  _state: ActionState,
  fd: FormData
): Promise<ActionState> {
  const session = await requireRole("MUSICIAN", "/onboarding/musician/basics");
  const { fieldErrors, data } = validateStep1(fd);

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "Please fix the errors below", fieldErrors };
  }

  const existing = await getProfileByUserId(session.user.id);

  if (!existing) {
    // Lazy create - let sound step create with full data, just update if already exists
    // This handles the case where profile was created in a previous attempt
  } else {
    await updateProfile(existing.id, data);
  }

  revalidatePath("/onboarding/musician");
  redirect("/onboarding/musician/sound");
}
