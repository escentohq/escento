"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId, updateProfile } from "@/lib/api/profiles";
import { validateProfile } from "@/lib/profile-validation";
import { type ActionState, formLevelMessage } from "@/lib/form-utils";
import { profileValuesFromFormData } from "@/lib/form-snapshots";
import { invalidatePublicProfile } from "@/lib/public-cache-invalidation";

export async function updateMusicianProfileAction(
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const session = await requireRole("MUSICIAN", "/profile/edit");

  const profile = await getProfileByUserId(session.user.id);
  if (!profile) redirect("/profile/create");

  const parsed = validateProfile(fd);
  if (Object.keys(parsed.fieldErrors).length) {
    return {
      ok: false,
      message: formLevelMessage(parsed.fieldErrors, "Fix the highlighted fields."),
      fieldErrors: parsed.fieldErrors,
      values: profileValuesFromFormData(fd),
    };
  }

  const data = parsed.data;
  const updatedProfile = await updateProfile(
    profile.id,
    {
      displayName: data.displayName,
      bio: data.bio,
      school: data.school,
      location: data.location,
      locationDisplayName: data.locationDisplayName,
      locationPlaceId: data.locationPlaceId,
      locationLat: data.locationLat,
      locationLng: data.locationLng,
      locationCity: data.locationCity,
      locationState: data.locationState,
      locationCountry: data.locationCountry,
      locationProvider: data.locationProvider,
      providerPlaceId: data.providerPlaceId,
      locationVisibility: data.locationVisibility,
      isRemote: data.isRemote,
      seekingPaid: data.seekingPaid,
      seekingUnpaid: data.seekingUnpaid,
      yearsExperience: data.yearsExperience,
      availabilityText: data.availabilityText,
      contactEmail: session.user.email ?? profile.contactEmail,
      instagramUrl: data.instagramUrl,
      youtubeUrl: data.youtubeUrl,
      spotifyUrl: data.spotifyUrl,
      soundcloudUrl: data.soundcloudUrl,
      websiteUrl: data.websiteUrl,
    },
    session.user.id,
    data.instruments,
    data.genres,
  );

  revalidatePath("/");
  revalidatePath("/musicians");
  revalidatePath(`/musicians/${profile.id}`);
  invalidatePublicProfile(profile.id);
  redirect(`/musicians/${updatedProfile.id}`);
}
