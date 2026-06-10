"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminEmail } from "@/lib/admin-auth";
import { getAdminEditableProfile, updateAdminEditableProfile } from "@/lib/api/admin-edits";
import {
  type ActionState,
  fieldError,
  formLevelMessage,
  isValidUrlOrEmpty,
  nonEmptyOrNull,
  parseCsv,
  parseOptionalInteger,
  strOrEmpty,
} from "@/lib/form-utils";
import { parseStructuredLocation } from "@/lib/location";
import { profileValuesFromFormData } from "@/lib/form-snapshots";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function adminUpdateMusicianProfileAction(
  profileId: string,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const adminEmail = await requireAdminEmail();
  const profile = await getAdminEditableProfile(profileId);
  if (!profile) redirect("/admin/musicians");

  const fieldErrors: Record<string, string> = {};
  const displayName = strOrEmpty(fd.get("displayName"));
  const bio = nonEmptyOrNull(fd.get("bio"));
  const school = nonEmptyOrNull(fd.get("school"));
  const location = parseStructuredLocation(fd);
  const isRemote = fd.get("isRemote") === "on";
  const seekingPaid = fd.get("seekingPaid") === "on";
  const seekingUnpaid = fd.get("seekingUnpaid") === "on";
  const yearsExperienceRaw = strOrEmpty(fd.get("yearsExperience"));
  const yearsExperience = parseOptionalInteger(yearsExperienceRaw);
  const availabilityText = nonEmptyOrNull(fd.get("availabilityText"));
  const instruments = parseCsv(fd.get("instrumentsCsv"));
  const genres = parseCsv(fd.get("genresCsv"));
  const instagramUrl = nonEmptyOrNull(fd.get("instagramUrl"));
  const youtubeUrl = nonEmptyOrNull(fd.get("youtubeUrl"));
  const spotifyUrl = nonEmptyOrNull(fd.get("spotifyUrl"));
  const soundcloudUrl = nonEmptyOrNull(fd.get("soundcloudUrl"));
  const websiteUrl = nonEmptyOrNull(fd.get("websiteUrl"));

  if (!displayName) fieldError(fieldErrors, "displayName", "Add the name creators should see.");
  if (displayName.length > 80) fieldError(fieldErrors, "displayName", "Keep the display name under 80 characters.");
  if (bio && bio.length > 1200) fieldError(fieldErrors, "bio", "Keep the bio under 1,200 characters.");
  if (yearsExperienceRaw && yearsExperience === null) fieldError(fieldErrors, "yearsExperience", "Use a whole number.");
  if (yearsExperience !== null && yearsExperience < 0) fieldError(fieldErrors, "yearsExperience", "Experience cannot be negative.");

  for (const [field, value] of Object.entries({
    instagramUrl,
    youtubeUrl,
    spotifyUrl,
    soundcloudUrl,
    websiteUrl,
  })) {
    if (!isValidUrlOrEmpty(value)) fieldError(fieldErrors, field, "Use a full http:// or https:// URL.");
  }

  if (Object.keys(fieldErrors).length) {
    return {
      ok: false,
      message: formLevelMessage(fieldErrors, "Tighten the profile before saving."),
      fieldErrors,
      values: profileValuesFromFormData(fd),
    };
  }

  await updateAdminEditableProfile({
    profileId,
    input: {
      displayName,
      bio,
      school,
      location: location.location,
      locationDisplayName: location.locationDisplayName,
      locationPlaceId: location.locationPlaceId,
      locationLat: location.locationLat,
      locationLng: location.locationLng,
      locationCity: location.locationCity,
      locationState: location.locationState,
      locationCountry: location.locationCountry,
      locationProvider: location.locationProvider,
      providerPlaceId: location.providerPlaceId,
      locationVisibility: location.locationVisibility,
      isRemote,
      seekingPaid,
      seekingUnpaid,
      yearsExperience,
      availabilityText,
      contactEmail: profile.contactEmail,
      instagramUrl,
      youtubeUrl,
      spotifyUrl,
      soundcloudUrl,
      websiteUrl,
    },
    instrumentNames: instruments,
    genreNames: genres,
  });

  const admin = createSupabaseAdminClient();
  const { error: auditError } = await admin.from("admin_audit_log").insert({
    admin_user_email: adminEmail,
    action: "edit_musician_profile",
    target_type: "musician_profile",
    target_id: profileId,
    reason: "Full admin profile edit",
  });

  if (auditError) {
    console.error("[admin] musician profile edit audit failed", auditError);
  }

  revalidatePath("/admin/musicians");
  revalidatePath(`/admin/musicians/${profileId}/edit`);
  revalidatePath("/musicians");
  revalidatePath(`/musicians/${profileId}`);
  redirect("/admin/musicians");
}
