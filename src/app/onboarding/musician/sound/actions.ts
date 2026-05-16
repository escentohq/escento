"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId, updateProfile, updateOnboardingStep } from "@/lib/api/profiles";
import { ensureInstruments, ensureGenres } from "@/lib/api/tags";
import { validateStep2 } from "@/lib/validation/profile";
import { ActionState, emptyActionState, parseCsv } from "@/lib/form-utils";

export async function saveSoundAction(
  _state: ActionState,
  fd: FormData
): Promise<ActionState> {
  const session = await requireRole("MUSICIAN", "/onboarding/musician/sound");
  const { fieldErrors, data } = validateStep2(fd);

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "Please fix the errors below", fieldErrors };
  }

  const profile = await getProfileByUserId(session.user.id);
  if (!profile) {
    redirect("/onboarding/musician/basics");
  }

  await updateProfile(
    profile.id,
    { seekingPaid: data.seekingPaid, seekingUnpaid: data.seekingUnpaid, yearsExperience: data.yearsExperience, isRemote: data.isRemote, availabilityText: data.availabilityText },
    data.instruments || [],
    data.genres || []
  );
  await updateOnboardingStep(profile.id, 2);

  revalidatePath("/onboarding/musician");
  redirect("/onboarding/musician/portfolio");
}

export async function skipSoundAction() {
  await requireRole("MUSICIAN", "/onboarding/musician/sound");
  redirect("/onboarding/musician/portfolio");
}
