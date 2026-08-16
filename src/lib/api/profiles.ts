import { cache } from "react";
import { unstable_cache } from "next/cache";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { PUBLIC_HOME_TAG, PUBLIC_MUSICIANS_TAG, publicMusicianTag } from "@/lib/cache-tags";
import { distanceMiles, type LocationSearch } from "@/lib/location";
import { isMalformedIdError } from "@/lib/ids";
import { isProfileLaunchReady } from "@/lib/profile-progress";
import { filterSearchResults } from "@/lib/search";
import { tagMatchesQuery } from "@/lib/tag-taxonomy";
import { ensureInstruments, ensureGenres } from "./tags";
import type { MusicianProfile, CreateProfileInput, UpdateProfileInput } from "./types";
import { toProfile, toPublicProfile } from "./normalizers";

/**
 * The select strings below are composed from constants rather than written inline, which
 * means PostgREST can no longer infer the row shape. The normalizers in
 * `./normalizers` already take a loose row, so rows are read through this type.
 */
type ProfileRow = { user_id: string } & Record<string, any>;

const PROFILE_TAG_JOINS = "musician_instrument(instrument(name)), musician_genre(genre(name))";

/** Columns `toProfile` actually reads. `select("*")` pulled junction-row columns that are discarded. */
const PROFILE_COLUMNS = [
  "id", "user_id", "display_name", "bio", "school",
  "location", "location_display_name", "location_place_id", "location_lat", "location_lng",
  "location_city", "location_state", "location_country", "location_provider", "provider_place_id",
  "location_visibility", "is_remote", "seeking_paid", "seeking_unpaid", "years_experience",
  "availability_text", "instagram_url", "youtube_url", "spotify_url", "soundcloud_url",
  "website_url", "created_at", "updated_at",
].join(", ");

/** Public reads never render contact_email, so it is not selected at all. */
const PUBLIC_PROFILE_SELECT = `${PROFILE_COLUMNS}, ${PROFILE_TAG_JOINS}`;
/** The owner's own profile needs the contact email for the edit form. */
const OWNER_PROFILE_SELECT = `${PROFILE_COLUMNS}, contact_email, ${PROFILE_TAG_JOINS}`;


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

async function queryPublicProfile(id: string): Promise<MusicianProfile | null> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("musician_profile")
    .select(PUBLIC_PROFILE_SELECT)
    .eq("id", id)
    .eq("is_public", true)
    .eq("moderation_status", "active")
    .single<ProfileRow>();

  // A malformed id is a stale link, not a fault: it reads as "no such profile"
  // so the route renders the branded 404 instead of an error boundary.
  if (error && error.code !== "PGRST116" && !isMalformedIdError(error)) throw error;
  if (!data) return null;

  const images = await getProfileImages([data.user_id]);
  const profile = toPublicProfile(data, null, images.get(data.user_id) ?? null);
  // RLS already hides drafts; this also drops a stale cache entry that was
  // written before readiness was part of anonymous visibility.
  return isProfileLaunchReady(profile) ? profile : null;
}

export const getProfile = cache(async (id: string): Promise<MusicianProfile | null> => (
  unstable_cache(
    () => queryPublicProfile(id),
    ["public-musician", id],
    { tags: [PUBLIC_MUSICIANS_TAG, PUBLIC_HOME_TAG, publicMusicianTag(id)] },
  )()
));

export const getProfileByUserId = cache(async (userId: string): Promise<MusicianProfile | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("musician_profile")
    .select(OWNER_PROFILE_SELECT)
    .eq("user_id", userId)
    .single<ProfileRow>();

  if (error && error.code !== "PGRST116") throw error;
  if (!data) return null;

  const images = await getProfileImages([data.user_id]);
  return toProfile(data, null, images.get(data.user_id) ?? null);
});

export const hasProfileForUser = cache(async (userId: string): Promise<boolean> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("musician_profile")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
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

async function queryPublicProfiles(): Promise<MusicianProfile[]> {
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("musician_profile")
    .select(PUBLIC_PROFILE_SELECT)
    .eq("is_public", true)
    .eq("moderation_status", "active")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  const images = await getProfileImages((data ?? []).map((raw: any) => raw.user_id));
  return (data || [])
    .map((raw: any) => toPublicProfile(raw, null, images.get(raw.user_id) ?? null))
    .filter(isProfileLaunchReady);
}

/**
 * One cache entry for the whole public directory. Every filter below is applied in JS
 * anyway — the query never pushed `q`, instruments, genres, or location into SQL — so
 * keying the cache per filter combination just meant every novel search string paid a
 * full table read. This way `?q=jazz` and `?q=blues` both hit the same warm entry.
 */
const getCachedPublicProfiles = unstable_cache(
  queryPublicProfiles,
  ["public-musicians"],
  { tags: [PUBLIC_MUSICIANS_TAG, PUBLIC_HOME_TAG] },
);

/**
 * The public directory is rendered on `/` and `/musicians`, both of which are
 * prerendered at build time. An unreachable database there used to throw and
 * fail the whole build — and at runtime it turned a Supabase blip into a 500 on
 * the most-visited page in the app.
 *
 * A public read has an honest empty state, so it degrades to one and logs.
 * Owner reads and every mutation still throw: those have no safe empty answer.
 */
async function readPublicProfiles(): Promise<MusicianProfile[]> {
  try {
    return await getCachedPublicProfiles();
  } catch (error) {
    console.error("[profiles] public directory read failed, rendering empty:", error);
    return [];
  }
}

function filterProfiles(all: MusicianProfile[], filters?: ListProfilesFilters): MusicianProfile[] {
  let profiles = all;
  const q = filters?.q ? safeSearchPattern(filters.q) : "";
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

export async function listProfiles(filters?: ListProfilesFilters): Promise<MusicianProfile[]> {
  return filterProfiles(await readPublicProfiles(), filters);
}

/**
 * camelCase input → the snake_case column names the RPCs merge into the row.
 * Only keys the caller actually supplied are included: the update RPC treats a
 * present key as "write this" (explicit nulls included) and an absent key as
 * "keep what is stored", which is what the multi-step create wizard needs.
 */
function profileColumnPayload(
  input: Partial<CreateProfileInput & UpdateProfileInput>,
): Record<string, unknown> {
  const pairs: Array<[string, unknown]> = [
    ["display_name", input.displayName],
    ["bio", input.bio],
    ["school", input.school],
    ["location", input.location],
    ["location_display_name", input.locationDisplayName],
    ["location_place_id", input.locationPlaceId],
    ["location_lat", input.locationLat],
    ["location_lng", input.locationLng],
    ["location_city", input.locationCity],
    ["location_state", input.locationState],
    ["location_country", input.locationCountry],
    ["location_provider", input.locationProvider],
    ["provider_place_id", input.providerPlaceId],
    ["location_visibility", input.locationVisibility],
    ["is_remote", input.isRemote],
    ["seeking_paid", input.seekingPaid],
    ["seeking_unpaid", input.seekingUnpaid],
    ["years_experience", input.yearsExperience],
    ["availability_text", input.availabilityText],
    ["contact_email", input.contactEmail],
    ["instagram_url", input.instagramUrl],
    ["youtube_url", input.youtubeUrl],
    ["spotify_url", input.spotifyUrl],
    ["soundcloud_url", input.soundcloudUrl],
    ["website_url", input.websiteUrl],
  ];

  const payload: Record<string, unknown> = {};
  for (const [column, value] of pairs) {
    if (value !== undefined) payload[column] = value;
  }
  return payload;
}

/** The RPCs return the profile row itself, so the shape matches a table read. */
function profileFromRow(row: ProfileRow, instruments: string[], genres: string[]): MusicianProfile {
  return {
    id: row.id,
    userId: row.user_id,
    image: null,
    displayName: row.display_name,
    bio: row.bio,
    school: row.school,
    location: row.location,
    locationDisplayName: row.location_display_name,
    locationPlaceId: row.location_place_id,
    locationLat: row.location_lat,
    locationLng: row.location_lng,
    locationCity: row.location_city,
    locationState: row.location_state,
    locationCountry: row.location_country,
    locationProvider: row.location_provider,
    providerPlaceId: row.provider_place_id,
    locationVisibility: row.location_visibility ?? "public_region",
    isRemote: row.is_remote,
    distanceMiles: null,
    seekingPaid: row.seeking_paid,
    seekingUnpaid: row.seeking_unpaid,
    yearsExperience: row.years_experience,
    availabilityText: row.availability_text,
    contactEmail: row.contact_email,
    instagramUrl: row.instagram_url,
    youtubeUrl: row.youtube_url,
    spotifyUrl: row.spotify_url,
    soundcloudUrl: row.soundcloud_url,
    websiteUrl: row.website_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    instruments,
    genres,
  };
}

/**
 * Create the profile row and its taxonomy in one database transaction
 * (`create_musician_profile_with_tags`). The root row and the junction rows used
 * to be separate PostgREST calls, so a failure after the first one published a
 * profile with no instruments or genres attached. Now either all of it commits
 * or none of it does, and the caller only invalidates caches on success.
 *
 * Tag rows themselves are ensured beforehand: they are shared reference data,
 * and an orphan tag name is not partial user state.
 */
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

  const { data, error } = await supabase.rpc("create_musician_profile_with_tags", {
    p_profile: profileColumnPayload(input),
    p_instrument_ids: instruments.map((tag) => tag.id),
    p_genre_ids: genres.map((tag) => tag.id),
  });

  if (error) throw error;
  if (!data) throw new Error("Profile create returned no row.");

  return profileFromRow(data as ProfileRow, instrumentNames, genreNames);
}

/**
 * Update the profile row and, when tag lists are supplied, replace its taxonomy
 * — both inside one transaction (`update_musician_profile_with_tags`). The old
 * sequence deleted every junction row first, so a later failure left a musician
 * with no instruments or genres while the UI said the save had failed.
 *
 * Passing `undefined` for a tag list leaves that taxonomy untouched; passing an
 * empty array clears it. Ownership is asserted inside the function.
 */
export async function updateProfile(
  id: string,
  input: UpdateProfileInput,
  userId: string,
  instrumentNames?: string[],
  genreNames?: string[],
): Promise<MusicianProfile> {
  const supabase = await createSupabaseServerClient();

  const [instruments, genres] = await Promise.all([
    instrumentNames ? ensureInstruments(instrumentNames, userId) : Promise.resolve(null),
    genreNames ? ensureGenres(genreNames, userId) : Promise.resolve(null),
  ]);

  const { error } = await supabase.rpc("update_musician_profile_with_tags", {
    p_id: id,
    p_profile: profileColumnPayload(input),
    p_instrument_ids: instruments ? instruments.map((tag) => tag.id) : null,
    p_genre_ids: genres ? genres.map((tag) => tag.id) : null,
  });

  if (error) throw error;

  // Read the committed row back with its joins so callers get the same shape a
  // page read would produce, including tags they did not just write.
  const { data, error: readError } = await supabase
    .from("musician_profile")
    .select(OWNER_PROFILE_SELECT)
    .eq("id", id)
    .single<ProfileRow>();

  if (readError) throw readError;
  const images = await getProfileImages([data.user_id]);
  return toProfile(data, null, images.get(data.user_id) ?? null);
}
