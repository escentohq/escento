import type { Gig, MusicianProfile } from "./types";

/**
 * Postgres snake_case -> TypeScript camelCase, plus junction-array flattening.
 *
 * These live apart from `gigs.ts` / `profiles.ts` deliberately: those modules
 * pull in `next/cache` and the Supabase clients, so importing them outside a
 * Next runtime is not possible. The mapping itself is pure, and it is exactly
 * the code that breaks silently on a column rename, so it is kept importable by
 * the unit suite.
 */

export type GigCreatorSummary = {
  id: string;
  name: string | null;
  email: string | null;
};

/** Raw PostgREST rows are loosely typed — the select strings are composed from constants. */
export type RawRow = Record<string, any>;

export function toGig(raw: RawRow, creatorSummary?: GigCreatorSummary, distance?: number | null): Gig {
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
    distanceMiles: distance ?? null,
    compensationType: raw.compensation_type,
    compensationDetails: raw.compensation_details,
    deadline: raw.deadline,
    status: raw.status,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    instruments: raw.gig_instrument?.map((x: RawRow) => x.instrument?.name).filter(Boolean) ?? [],
    genres: raw.gig_genre?.map((x: RawRow) => x.genre?.name).filter(Boolean) ?? [],
    creator: creatorSummary,
  };
}


export function toProfile(
  raw: RawRow,
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
    instruments: raw.musician_instrument?.map((x: RawRow) => x.instrument?.name).filter(Boolean) ?? [],
    genres: raw.musician_genre?.map((x: RawRow) => x.genre?.name).filter(Boolean) ?? [],
  };
}

export function toPublicProfile(raw: RawRow, distance?: number | null, image?: string | null) {
  return {
    ...toProfile(raw, distance, image),
    // Contact email is not rendered on public surfaces and must not enter the
    // cross-request cache even though the profile itself is public.
    contactEmail: "",
  };
}
