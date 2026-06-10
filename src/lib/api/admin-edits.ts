import { normalizeTagName } from "@/lib/form-utils";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Gig, MusicianProfile, Tag, UpdateGigInput, UpdateProfileInput } from "@/lib/api/types";

function toProfile(raw: any): MusicianProfile {
  return {
    id: raw.id,
    userId: raw.user_id,
    image: raw.app_user?.image ?? null,
    displayName: raw.display_name,
    bio: raw.bio,
    school: raw.school,
    location: raw.location,
    locationDisplayName: raw.location_display_name,
    locationPlaceId: raw.location_place_id,
    locationLat: raw.location_lat,
    locationLng: raw.location_lng,
    locationCity: raw.location_city,
    locationState: raw.location_state,
    locationCountry: raw.location_country,
    locationProvider: raw.location_provider,
    providerPlaceId: raw.provider_place_id,
    locationVisibility: raw.location_visibility ?? "public_region",
    isRemote: raw.is_remote,
    distanceMiles: null,
    seekingPaid: raw.seeking_paid,
    seekingUnpaid: raw.seeking_unpaid,
    yearsExperience: raw.years_experience,
    availabilityText: raw.availability_text,
    contactEmail: raw.contact_email,
    instagramUrl: raw.instagram_url,
    youtubeUrl: raw.youtube_url,
    spotifyUrl: raw.spotify_url,
    soundcloudUrl: raw.soundcloud_url,
    websiteUrl: raw.website_url,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    instruments: raw.musician_instrument?.map((x: any) => x.instrument?.name).filter(Boolean) ?? [],
    genres: raw.musician_genre?.map((x: any) => x.genre?.name).filter(Boolean) ?? [],
  };
}

function toGig(raw: any): Gig {
  return {
    id: raw.id,
    creatorId: raw.creator_id,
    title: raw.title,
    description: raw.description,
    projectType: raw.project_type,
    location: raw.location,
    locationDisplayName: raw.location_display_name,
    locationPlaceId: raw.location_place_id,
    locationLat: raw.location_lat,
    locationLng: raw.location_lng,
    locationCity: raw.location_city,
    locationState: raw.location_state,
    locationCountry: raw.location_country,
    locationProvider: raw.location_provider,
    providerPlaceId: raw.provider_place_id,
    locationVisibility: raw.location_visibility ?? "public_region",
    isRemote: raw.is_remote,
    distanceMiles: null,
    compensationType: raw.compensation_type,
    compensationDetails: raw.compensation_details,
    deadline: raw.deadline,
    status: raw.status,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    instruments: raw.gig_instrument?.map((x: any) => x.instrument?.name).filter(Boolean) ?? [],
    genres: raw.gig_genre?.map((x: any) => x.genre?.name).filter(Boolean) ?? [],
    creator: {
      name: raw.app_user?.name ?? null,
      email: raw.app_user?.email ?? null,
    },
  };
}

function normalizeDeadline(deadline: Date | string | null | undefined): string | null {
  if (!deadline) return null;
  if (typeof deadline === "string") return deadline;
  return deadline.toISOString().split("T")[0];
}

async function ensureAdminTags(
  table: "instrument" | "genre",
  names: string[],
  createdBy: string,
): Promise<Tag[]> {
  const supabase = createSupabaseAdminClient();
  const normalized = Array.from(new Set(names.map(normalizeTagName))).filter(Boolean);
  if (!normalized.length) return [];

  const { error: upsertError } = await supabase
    .from(table)
    .upsert(
      normalized.map((name) => ({ name, created_by: createdBy, is_default: false })),
      { onConflict: "name", ignoreDuplicates: true },
    );

  if (upsertError) throw upsertError;

  const { data, error } = await supabase
    .from(table)
    .select("id, name")
    .in("name", normalized);

  if (error) throw error;

  const tagsByName = new Map((data ?? []).map((tag) => [tag.name, tag]));
  return normalized.map((name) => tagsByName.get(name)).filter((tag): tag is Tag => Boolean(tag));
}

export async function getAdminEditableProfile(profileId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("musician_profile")
    .select("*, app_user(image), musician_instrument(*, instrument(*)), musician_genre(*, genre(*))")
    .eq("id", profileId)
    .maybeSingle();

  if (error) throw error;
  return data ? toProfile(data) : null;
}

export async function getAdminEditableGig(gigId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("gig")
    .select("*, app_user(name, email), gig_instrument(*, instrument(*)), gig_genre(*, genre(*))")
    .eq("id", gigId)
    .maybeSingle();

  if (error) throw error;
  return data ? toGig(data) : null;
}

export async function updateAdminEditableProfile({
  profileId,
  input,
  instrumentNames,
  genreNames,
}: {
  profileId: string;
  input: UpdateProfileInput;
  instrumentNames: string[];
  genreNames: string[];
}) {
  const supabase = createSupabaseAdminClient();
  const existing = await getAdminEditableProfile(profileId);
  if (!existing) throw new Error("Profile not found.");

  const updateData: Record<string, any> = {};
  if (input.displayName !== undefined) updateData.display_name = input.displayName;
  if (input.bio !== undefined) updateData.bio = input.bio;
  if (input.school !== undefined) updateData.school = input.school;
  if (input.location !== undefined) updateData.location = input.location;
  if (input.locationDisplayName !== undefined) updateData.location_display_name = input.locationDisplayName;
  if (input.locationPlaceId !== undefined) updateData.location_place_id = input.locationPlaceId;
  if (input.locationLat !== undefined) updateData.location_lat = input.locationLat;
  if (input.locationLng !== undefined) updateData.location_lng = input.locationLng;
  if (input.locationCity !== undefined) updateData.location_city = input.locationCity;
  if (input.locationState !== undefined) updateData.location_state = input.locationState;
  if (input.locationCountry !== undefined) updateData.location_country = input.locationCountry;
  if (input.locationProvider !== undefined) updateData.location_provider = input.locationProvider;
  if (input.providerPlaceId !== undefined) updateData.provider_place_id = input.providerPlaceId;
  if (input.locationVisibility !== undefined) updateData.location_visibility = input.locationVisibility;
  if (input.isRemote !== undefined) updateData.is_remote = input.isRemote;
  if (input.seekingPaid !== undefined) updateData.seeking_paid = input.seekingPaid;
  if (input.seekingUnpaid !== undefined) updateData.seeking_unpaid = input.seekingUnpaid;
  if (input.yearsExperience !== undefined) updateData.years_experience = input.yearsExperience;
  if (input.availabilityText !== undefined) updateData.availability_text = input.availabilityText;
  if (input.contactEmail !== undefined) updateData.contact_email = input.contactEmail;
  if (input.instagramUrl !== undefined) updateData.instagram_url = input.instagramUrl;
  if (input.youtubeUrl !== undefined) updateData.youtube_url = input.youtubeUrl;
  if (input.spotifyUrl !== undefined) updateData.spotify_url = input.spotifyUrl;
  if (input.soundcloudUrl !== undefined) updateData.soundcloud_url = input.soundcloudUrl;
  if (input.websiteUrl !== undefined) updateData.website_url = input.websiteUrl;

  const [instruments, genres] = await Promise.all([
    ensureAdminTags("instrument", instrumentNames, existing.userId),
    ensureAdminTags("genre", genreNames, existing.userId),
  ]);

  const [instrumentDelete, genreDelete] = await Promise.all([
    supabase.from("musician_instrument").delete().eq("musician_profile_id", profileId),
    supabase.from("musician_genre").delete().eq("musician_profile_id", profileId),
  ]);

  if (instrumentDelete.error || genreDelete.error) {
    throw instrumentDelete.error ?? genreDelete.error;
  }

  const { error: updateError } = await supabase
    .from("musician_profile")
    .update(updateData)
    .eq("id", profileId);

  if (updateError) throw updateError;

  await Promise.all([
    ...instruments.map((instrument) =>
      supabase.from("musician_instrument").insert({
        musician_profile_id: profileId,
        instrument_id: instrument.id,
      }),
    ),
    ...genres.map((genre) =>
      supabase.from("musician_genre").insert({
        musician_profile_id: profileId,
        genre_id: genre.id,
      }),
    ),
  ]);
}

export async function updateAdminEditableGig({
  gigId,
  input,
  instrumentNames,
  genreNames,
}: {
  gigId: string;
  input: UpdateGigInput;
  instrumentNames: string[];
  genreNames: string[];
}) {
  const supabase = createSupabaseAdminClient();
  const existing = await getAdminEditableGig(gigId);
  if (!existing) throw new Error("Gig not found.");

  const updateData: Record<string, any> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.projectType !== undefined) updateData.project_type = input.projectType;
  if (input.location !== undefined) updateData.location = input.location;
  if (input.locationDisplayName !== undefined) updateData.location_display_name = input.locationDisplayName;
  if (input.locationPlaceId !== undefined) updateData.location_place_id = input.locationPlaceId;
  if (input.locationLat !== undefined) updateData.location_lat = input.locationLat;
  if (input.locationLng !== undefined) updateData.location_lng = input.locationLng;
  if (input.locationCity !== undefined) updateData.location_city = input.locationCity;
  if (input.locationState !== undefined) updateData.location_state = input.locationState;
  if (input.locationCountry !== undefined) updateData.location_country = input.locationCountry;
  if (input.locationProvider !== undefined) updateData.location_provider = input.locationProvider;
  if (input.providerPlaceId !== undefined) updateData.provider_place_id = input.providerPlaceId;
  if (input.locationVisibility !== undefined) updateData.location_visibility = input.locationVisibility;
  if (input.isRemote !== undefined) updateData.is_remote = input.isRemote;
  if (input.compensationType !== undefined) updateData.compensation_type = input.compensationType;
  if (input.compensationDetails !== undefined) updateData.compensation_details = input.compensationDetails;
  if (input.deadline !== undefined) updateData.deadline = normalizeDeadline(input.deadline);
  if (input.status !== undefined) updateData.status = input.status;

  const [instruments, genres] = await Promise.all([
    ensureAdminTags("instrument", instrumentNames, existing.creatorId),
    ensureAdminTags("genre", genreNames, existing.creatorId),
  ]);

  const [instrumentDelete, genreDelete] = await Promise.all([
    supabase.from("gig_instrument").delete().eq("gig_id", gigId),
    supabase.from("gig_genre").delete().eq("gig_id", gigId),
  ]);

  if (instrumentDelete.error || genreDelete.error) {
    throw instrumentDelete.error ?? genreDelete.error;
  }

  const { error: updateError } = await supabase
    .from("gig")
    .update(updateData)
    .eq("id", gigId);

  if (updateError) throw updateError;

  await Promise.all([
    ...instruments.map((instrument) =>
      supabase.from("gig_instrument").insert({
        gig_id: gigId,
        instrument_id: instrument.id,
      }),
    ),
    ...genres.map((genre) =>
      supabase.from("gig_genre").insert({
        gig_id: gigId,
        genre_id: genre.id,
      }),
    ),
  ]);
}
