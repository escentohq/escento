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
    await createProfile(
      session.user.id,
      {
        displayName: data.displayName,
        contactEmail: data.contactEmail,
        bio: data.bio,
        school: data.school,
        location: data.location,
        isRemote: false,
        seekingPaid: true,
        seekingUnpaid: true,
        yearsExperience: null,
        availabilityText: null,
        instagramUrl: null,
        youtubeUrl: null,
        spotifyUrl: null,
        soundcloudUrl: null,
        websiteUrl: null,
      },
      [],
      []
    );
    const profile = await getProfileByUserId(session.user.id);
    if (profile) {
      await updateProfile(profile.id, { onboardingStep: 1 });
    }
  } else {
    await updateProfile(existing.id, { ...data, onboardingStep: 1 });
  }

  revalidatePath("/onboarding/musician");
  redirect("/onboarding/musician/sound");
}
