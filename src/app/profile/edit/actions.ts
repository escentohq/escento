"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import {
  type ActionState,
  fieldError,
  isValidEmail,
  isValidUrlOrEmpty,
  nonEmptyOrNull,
  parseCsv,
  parseOptionalInteger,
  strOrEmpty,
} from "@/lib/form-utils";
import { ensureGenres, ensureInstruments } from "@/lib/tag-utils";

function validateProfile(fd: FormData) {
  const fieldErrors: Record<string, string> = {};
  const displayName = strOrEmpty(fd.get("displayName"));
  const bio = nonEmptyOrNull(fd.get("bio"));
  const school = nonEmptyOrNull(fd.get("school"));
  const location = nonEmptyOrNull(fd.get("location"));
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
      location,
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

export async function updateMusicianProfile(
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const session = await requireRole("MUSICIAN", "/profile/edit");

  const profile = await db.musicianProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) redirect("/profile/create");

  const parsed = validateProfile(fd);
  if (Object.keys(parsed.fieldErrors).length) {
    return {
      ok: false,
      message: "Tighten the set before saving.",
      fieldErrors: parsed.fieldErrors,
    };
  }

  const data = parsed.data;
  const [ensuredInstruments, ensuredGenres] = await Promise.all([
    ensureInstruments(data.instruments),
    ensureGenres(data.genres),
  ]);

  const supabase = await (await import("@/lib/supabase/server")).createSupabaseServerClient();

  // Delete existing relationships
  await Promise.all([
    supabase.from("musician_instrument").delete().eq("musician_profile_id", profile.id),
    supabase.from("musician_genre").delete().eq("musician_profile_id", profile.id),
  ]);

  // Update profile
  await db.musicianProfile.update({
    where: { id: profile.id },
    data: {
      displayName: data.displayName,
      bio: data.bio,
      school: data.school,
      location: data.location,
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
  });

  // Create new relationships
  await Promise.all([
    ...ensuredInstruments.map((inst) =>
      supabase.from("musician_instrument").insert({
        musician_profile_id: profile.id,
        instrument_id: inst.id,
      })
    ),
    ...ensuredGenres.map((genre) =>
      supabase.from("musician_genre").insert({
        musician_profile_id: profile.id,
        genre_id: genre.id,
      })
    ),
  ]);

  revalidatePath("/");
  revalidatePath("/musicians");
  revalidatePath(`/musicians/${profile.id}`);
  redirect("/profile/edit");
}

