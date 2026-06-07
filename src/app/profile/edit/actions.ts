"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth-guards";
import { getProfileByUserId, updateProfile } from "@/lib/api/profiles";
import {
  type ActionState,
  fieldError,
  formLevelMessage,
  isValidEmail,
  isValidUrlOrEmpty,
  nonEmptyOrNull,
  parseCsv,
  parseOptionalInteger,
  strOrEmpty,
} from "@/lib/form-utils";
import { parseStructuredLocation, validateStructuredLocation } from "@/lib/location";
import { profileValuesFromFormData } from "@/lib/form-snapshots";

function validateProfile(fd: FormData) {
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
  const contactEmail = strOrEmpty(fd.get("contactEmail"));
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
  if (!contactEmail) fieldError(fieldErrors, "contactEmail", "Add a contact email.");
  if (contactEmail && !isValidEmail(contactEmail)) fieldError(fieldErrors, "contactEmail", "Use a valid email address.");
  if (!instruments.length) fieldError(fieldErrors, "instrumentsCsv", "Add at least one instrument.");
  if (!genres.length) fieldError(fieldErrors, "genresCsv", "Add at least one genre.");
  if (yearsExperienceRaw && yearsExperience === null) fieldError(fieldErrors, "yearsExperience", "Use a whole number.");
  if (yearsExperience !== null && yearsExperience < 0) fieldError(fieldErrors, "yearsExperience", "Experience cannot be negative.");
  if (!seekingPaid && !seekingUnpaid) fieldError(fieldErrors, "seekingPaid", "Choose at least one compensation preference.");
  validateStructuredLocation(fieldErrors, location, isRemote);

  for (const [field, value] of Object.entries({
    instagramUrl,
    youtubeUrl,
    spotifyUrl,
    soundcloudUrl,
    websiteUrl,
  })) {
    if (!isValidUrlOrEmpty(value)) fieldError(fieldErrors, field, "Use a full http:// or https:// URL.");
  }

  return {
    fieldErrors,
    data: {
      displayName,
      bio,
      school,
      ...location,
      isRemote,
      seekingPaid,
      seekingUnpaid,
      yearsExperience,
      availabilityText,
      contactEmail,
      instruments,
      genres,
      instagramUrl,
      youtubeUrl,
      spotifyUrl,
      soundcloudUrl,
      websiteUrl,
    },
  };
}

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
      message: formLevelMessage(parsed.fieldErrors, "Tighten the set before saving."),
      fieldErrors: parsed.fieldErrors,
      values: profileValuesFromFormData(fd),
    };
  }

  const data = parsed.data;
  await updateProfile(
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
      locationVisibility: data.locationVisibility,
      isRemote: data.isRemote,
      seekingPaid: data.seekingPaid,
      seekingUnpaid: data.seekingUnpaid,
      yearsExperience: data.yearsExperience,
      availabilityText: data.availabilityText,
      contactEmail: data.contactEmail,
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
  redirect("/profile/edit");
}
