import { cache } from "react";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { distanceMiles, type LocationSearch } from "@/lib/location";
import { filterSearchResults } from "@/lib/search";
import { tagMatchesQuery } from "@/lib/tag-taxonomy";
import { ensureInstruments, ensureGenres } from "./tags";
import type { MusicianProfile, CreateProfileInput, UpdateProfileInput } from "./types";

function toProfile(
  raw: any,
  distance?: number | null,
  image: string | null = raw.app_user?.image ?? null,
): MusicianProfile {
  return {
    id: raw.id,
    userId: raw.user_id,
    image,
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
    distanceMiles: distance ?? null,
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

async function getProfileImages(userIds: string[]) {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (!uniqueIds.length) return new Map<string, string | null>();

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("app_user")
      .select("id, image")
      .in("id", uniqueIds);

    if (error) throw error;
    return new Map((data ?? []).map((user) => [user.id, user.image ?? null]));
  } catch (error) {
    console.error("[profiles] profile image lookup failed:", error);
    return new Map<string, string | null>();
  }
}

function firstError(
  results: Array<{ error: unknown | null }>,
): unknown | null {
  return results.find((result) => result.error)?.error ?? null;
}

export const getProfile = cache(async (id: string): Promise<MusicianProfile | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("musician_profile")
    .select("*, musician_instrument(*, instrument(*)), musician_genre(*, genre(*))")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  if (!data) return null;

  const images = await getProfileImages([data.user_id]);
  return toProfile(data, null, images.get(data.user_id) ?? null);
});

export const getProfileByUserId = cache(async (userId: string): Promise<MusicianProfile | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("musician_profile")
    .select("*, musician_instrument(*, instrument(*)), musician_genre(*, genre(*))")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  if (!data) return null;

  const images = await getProfileImages([data.user_id]);
  return toProfile(data, null, images.get(data.user_id) ?? null);
});

interface ListProfilesFilters {
  instruments?: string[];
  genres?: string[];
  q?: string;
  location?: LocationSearch;
}

function safeSearchPattern(value: string) {
  return value.replace(/[,%()]/g, " ").trim();
}

export async function listProfiles(filters?: ListProfilesFilters): Promise<MusicianProfile[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("musician_profile")
    .select("*, musician_instrument(*, instrument(*)), musician_genre(*, genre(*))")
    .order("updated_at", { ascending: false });

  const q = filters?.q ? safeSearchPattern(filters.q) : "";

  const { data, error } = await query;

  if (error) throw error;

  const images = await getProfileImages((data ?? []).map((raw) => raw.user_id));
  let profiles = (data || []).map((raw) =>
    toProfile(raw, null, images.get(raw.user_id) ?? null),
  );
  const location = filters?.location;
  const instrumentFilters = filters?.instruments ?? [];
  const genreFilters = filters?.genres ?? [];

  if (q) {
    profiles = filterSearchResults(profiles, q, (profile) => [
      profile.displayName,
      profile.bio,
      profile.school,
      profile.availabilityText,
      profile.location,
      profile.locationDisplayName,
      profile.locationCity,
      profile.locationState,
      profile.locationCountry,
      ...(profile.instruments ?? []),
      ...(profile.genres ?? []),
    ]);
  }

  if (instrumentFilters.length) {
    profiles = profiles.filter((profile) => (
      instrumentFilters.some((selected) => (
        (profile.instruments ?? []).some((instrument) => tagMatchesQuery("instrument", instrument, selected))
      ))
    ));
  }

  if (genreFilters.length) {
    profiles = profiles.filter((profile) => (
      genreFilters.some((selected) => (
        (profile.genres ?? []).some((genre) => tagMatchesQuery("genre", genre, selected))
      ))
    ));
  }

  if (location?.remoteFilter === "remote") {
    profiles = profiles.filter((profile) => profile.isRemote);
  } else if (location?.remoteFilter === "in_person") {
    profiles = profiles.filter((profile) => !profile.isRemote);
  }

  if (location?.lat !== null && location?.lat !== undefined && location.lng !== null && location.lng !== undefined && location.radiusMiles) {
    profiles = profiles
      .map((profile) => {
        if (profile.locationLat === null || profile.locationLng === null) return profile;
        return {
          ...profile,
          distanceMiles: distanceMiles(location.lat!, location.lng!, profile.locationLat, profile.locationLng),
        };
      })
      .filter((profile) => {
        if (profile.distanceMiles !== null && profile.distanceMiles !== undefined) {
          return profile.distanceMiles <= location.radiusMiles!;
        }
        return location.remoteFilter === "include" && profile.isRemote;
      })
      .sort((a, b) => {
        if (a.distanceMiles === null || a.distanceMiles === undefined) return 1;
        if (b.distanceMiles === null || b.distanceMiles === undefined) return -1;
        return a.distanceMiles - b.distanceMiles;
      });
  }

  return profiles.slice(0, 50);
}

export async function createProfile(
  userId: string,
  input: CreateProfileInput,
  instrumentNames: string[],
  genreNames: string[],
): Promise<MusicianProfile> {
  const supabase = await createSupabaseServerClient();
  const [instruments, genres] = await Promise.all([
    ensureInstruments(instrumentNames, userId),
    ensureGenres(genreNames, userId),
  ]);

  const { data: profile, error: profileError } = await supabase
    .from("musician_profile")
    .insert({
      user_id: userId,
      display_name: input.displayName,
      bio: input.bio,
      school: input.school,
      location: input.location,
      location_display_name: input.locationDisplayName,
      location_place_id: input.locationPlaceId,
      location_lat: input.locationLat,
      location_lng: input.locationLng,
      location_city: input.locationCity,
      location_state: input.locationState,
      location_country: input.locationCountry,
      location_provider: input.locationProvider,
      provider_place_id: input.providerPlaceId,
      location_visibility: input.locationVisibility,
      is_remote: input.isRemote,
      seeking_paid: input.seekingPaid,
      seeking_unpaid: input.seekingUnpaid,
      years_experience: input.yearsExperience,
      availability_text: input.availabilityText,
      contact_email: input.contactEmail,
      instagram_url: input.instagramUrl,
      youtube_url: input.youtubeUrl,
      spotify_url: input.spotifyUrl,
      soundcloud_url: input.soundcloudUrl,
      website_url: input.websiteUrl,
    })
    .select()
    .single();

  if (profileError) throw profileError;

  const junctionResults = await Promise.all([
    ...instruments.map((inst) =>
      supabase.from("musician_instrument").insert({
        musician_profile_id: profile.id,
        instrument_id: inst.id,
      })
    ),
    ...genres.map((genre) =>
      supabase.from("musician_genre").insert({
        musician_profile_id: profile.id,
        genre_id: genre.id,
      })
    ),
  ]);
  const junctionError = firstError(junctionResults);
  if (junctionError) throw junctionError;

  return {
    id: profile.id,
    userId: profile.user_id,
    image: null,
    displayName: profile.display_name,
    bio: profile.bio,
    school: profile.school,
    location: profile.location,
    locationDisplayName: profile.location_display_name,
    locationPlaceId: profile.location_place_id,
    locationLat: profile.location_lat,
    locationLng: profile.location_lng,
    locationCity: profile.location_city,
    locationState: profile.location_state,
    locationCountry: profile.location_country,
    locationProvider: profile.location_provider,
    providerPlaceId: profile.provider_place_id,
    locationVisibility: profile.location_visibility ?? "public_region",
    isRemote: profile.is_remote,
    distanceMiles: null,
    seekingPaid: profile.seeking_paid,
    seekingUnpaid: profile.seeking_unpaid,
    yearsExperience: profile.years_experience,
    availabilityText: profile.availability_text,
    contactEmail: profile.contact_email,
    instagramUrl: profile.instagram_url,
    youtubeUrl: profile.youtube_url,
    spotifyUrl: profile.spotify_url,
    soundcloudUrl: profile.soundcloud_url,
    websiteUrl: profile.website_url,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    instruments: instrumentNames,
    genres: genreNames,
  };
}

export async function updateProfile(
  id: string,
  input: UpdateProfileInput,
  userId: string,
  instrumentNames?: string[],
  genreNames?: string[],
): Promise<MusicianProfile> {
  const supabase = await createSupabaseServerClient();

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

  if (instrumentNames || genreNames) {
    const deleteResults = await Promise.all([
      supabase.from("musician_instrument").delete().eq("musician_profile_id", id),
      supabase.from("musician_genre").delete().eq("musician_profile_id", id),
    ]);
    const deleteError = firstError(deleteResults);
    if (deleteError) throw deleteError;
  }

  const { error: updateError } = await supabase
    .from("musician_profile")
    .update(updateData)
    .eq("id", id);

  if (updateError) throw updateError;

  if (instrumentNames || genreNames) {
    const [instruments, genres] = await Promise.all([
      instrumentNames ? ensureInstruments(instrumentNames, userId) : Promise.resolve([]),
      genreNames ? ensureGenres(genreNames, userId) : Promise.resolve([]),
    ]);

    const junctionResults = await Promise.all([
      ...instruments.map((inst) =>
        supabase.from("musician_instrument").insert({
          musician_profile_id: id,
          instrument_id: inst.id,
        })
      ),
      ...genres.map((genre) =>
        supabase.from("musician_genre").insert({
          musician_profile_id: id,
          genre_id: genre.id,
        })
      ),
    ]);
    const junctionError = firstError(junctionResults);
    if (junctionError) throw junctionError;
  }

  const { data, error } = await supabase
    .from("musician_profile")
    .select("*, musician_instrument(*, instrument(*)), musician_genre(*, genre(*))")
    .eq("id", id)
    .single();

  if (error) throw error;
  const images = await getProfileImages([data.user_id]);
  return toProfile(data, null, images.get(data.user_id) ?? null);
}
