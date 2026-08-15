import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { PUBLIC_GIGS_TAG, PUBLIC_HOME_TAG, publicGigTag } from "@/lib/cache-tags";
import { distanceMiles, type LocationSearch } from "@/lib/location";
import { filterSearchResults } from "@/lib/search";
import { tagMatchesQuery } from "@/lib/tag-taxonomy";
import { ensureInstruments, ensureGenres } from "./tags";
import type { Gig, CreateGigInput, UpdateGigInput } from "./types";

type GigCreatorSummary = {
  id: string;
  name: string | null;
  email: string | null;
};

function firstError(
  results: Array<{ error: unknown | null }>,
): unknown | null {
  return results.find((result) => result.error)?.error ?? null;
}

function normalizeDeadline(deadline: Date | string | null | undefined): string | null {
  if (!deadline) return null;
  if (typeof deadline === "string") return deadline;
  if (deadline instanceof Date) return deadline.toISOString().split("T")[0];
  return null;
}

async function getCreatorSummaries(creatorIds: string[]): Promise<Map<string, GigCreatorSummary>> {
  const uniqueIds = Array.from(new Set(creatorIds.filter(Boolean)));
  if (!uniqueIds.length) return new Map();

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("app_user")
      .select("id, name")
      .in("id", uniqueIds);

    if (error) throw error;

    return new Map(
      (data ?? []).map((user) => [
        user.id,
        {
          id: user.id,
          name: user.name ?? null,
          email: null,
        },
      ]),
    );
  } catch (error) {
    console.error("[gigs] creator summary lookup failed:", error);
    return new Map();
  }
}

async function withCreatorSummaries(rawGigs: any[]): Promise<Gig[]> {
  const creatorSummaries = await getCreatorSummaries(
    rawGigs.map((gig) => gig.creator_id),
  );

  return rawGigs.map((raw) => toGig(raw, creatorSummaries.get(raw.creator_id)));
}

const GIG_TAG_JOINS = "gig_instrument(instrument(name)), gig_genre(genre(name))";

/** Columns `toGig` actually reads. `select("*")` pulled junction-row columns that are discarded. */
const GIG_SELECT = [
  "id", "creator_id", "title", "description", "project_type",
  "location", "location_display_name", "location_place_id", "location_lat", "location_lng",
  "location_city", "location_state", "location_country", "location_provider", "provider_place_id",
  "location_visibility", "is_remote", "compensation_type", "compensation_details", "deadline",
  "status", "created_at", "updated_at",
].join(", ") + `, ${GIG_TAG_JOINS}`;

function toGig(raw: any, creatorSummary?: GigCreatorSummary, distance?: number | null): Gig {
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
    instruments: raw.gig_instrument?.map((x: any) => x.instrument?.name).filter(Boolean) ?? [],
    genres: raw.gig_genre?.map((x: any) => x.genre?.name).filter(Boolean) ?? [],
    creator: creatorSummary,
  };
}

async function queryPublicGig(id: string): Promise<Gig | null> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("gig")
    .select(GIG_SELECT)
    .eq("id", id)
    .eq("is_public", true)
    .eq("moderation_status", "active")
    .single();

  if (error && error.code !== "PGRST116") throw error;
  if (!data) return null;

  const [gig] = await withCreatorSummaries([data]);
  return gig;
}

export const getGig = cache(async (id: string): Promise<Gig | null> => (
  unstable_cache(
    () => queryPublicGig(id),
    ["public-gig", id],
    { tags: [PUBLIC_GIGS_TAG, PUBLIC_HOME_TAG, publicGigTag(id)] },
  )()
));

export async function getGigForCreator(id: string, creatorId: string): Promise<Gig | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("gig")
    .select(GIG_SELECT)
    .eq("id", id)
    .eq("creator_id", creatorId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  if (!data) return null;

  const [gig] = await withCreatorSummaries([data]);
  return gig;
}

interface ListOpenGigsFilters {
  projectType?: string;
  instruments?: string[];
  genres?: string[];
  q?: string;
  location?: LocationSearch;
}

function safeSearchPattern(value: string) {
  return value.replace(/[,%()]/g, " ").trim();
}

async function queryPublicOpenGigs(): Promise<Gig[]> {
  const supabase = createSupabasePublicClient();

  const { data, error } = await supabase
    .from("gig")
    .select(GIG_SELECT)
    .eq("status", "OPEN")
    .eq("is_public", true)
    .eq("moderation_status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return withCreatorSummaries(data || []);
}

/**
 * One cache entry for every open gig, mirroring `getCachedPublicProfiles`. The old key
 * embedded the user's filters, so each distinct search string was a cold full-table read
 * even though every filter below is applied in JS regardless.
 */
const getCachedPublicOpenGigs = unstable_cache(
  queryPublicOpenGigs,
  ["public-gigs"],
  { tags: [PUBLIC_GIGS_TAG, PUBLIC_HOME_TAG] },
);

function filterGigs(all: Gig[], filters?: ListOpenGigsFilters): Gig[] {
  let gigs = all;
  const q = filters?.q ? safeSearchPattern(filters.q) : "";
  const location = filters?.location;
  const instrumentFilters = filters?.instruments ?? [];
  const genreFilters = filters?.genres ?? [];

  // Previously the one filter pushed into SQL; it joins the rest of the chain now that
  // the dataset is cached whole.
  if (filters?.projectType) {
    gigs = gigs.filter((gig) => gig.projectType === filters.projectType);
  }

  if (q) {
    gigs = filterSearchResults(gigs, q, (gig) => [
      gig.title,
      gig.description,
      gig.projectType,
      gig.compensationDetails,
      gig.location,
      gig.locationDisplayName,
      gig.locationCity,
      gig.locationState,
      gig.locationCountry,
      gig.creator?.name,
      ...(gig.instruments ?? []),
      ...(gig.genres ?? []),
    ]);
  }

  if (instrumentFilters.length) {
    gigs = gigs.filter((gig) => (
      instrumentFilters.some((selected) => (
        (gig.instruments ?? []).some((instrument) => tagMatchesQuery("instrument", instrument, selected))
      ))
    ));
  }

  if (genreFilters.length) {
    gigs = gigs.filter((gig) => (
      genreFilters.some((selected) => (
        (gig.genres ?? []).some((genre) => tagMatchesQuery("genre", genre, selected))
      ))
    ));
  }

  if (location?.remoteFilter === "remote") {
    gigs = gigs.filter((gig) => gig.isRemote);
  } else if (location?.remoteFilter === "in_person") {
    gigs = gigs.filter((gig) => !gig.isRemote);
  }

  if (location?.lat !== null && location?.lat !== undefined && location.lng !== null && location.lng !== undefined && location.radiusMiles) {
    gigs = gigs
      .map((gig) => {
        if (gig.locationLat === null || gig.locationLng === null) return gig;
        return {
          ...gig,
          distanceMiles: distanceMiles(location.lat!, location.lng!, gig.locationLat, gig.locationLng),
        };
      })
      .filter((gig) => {
        if (gig.distanceMiles !== null && gig.distanceMiles !== undefined) {
          return gig.distanceMiles <= location.radiusMiles!;
        }
        return location.remoteFilter === "include" && gig.isRemote;
      })
      .sort((a, b) => {
        if (a.distanceMiles === null || a.distanceMiles === undefined) return 1;
        if (b.distanceMiles === null || b.distanceMiles === undefined) return -1;
        return a.distanceMiles - b.distanceMiles;
      });
  }

  return gigs.slice(0, 50);
}

export async function listOpenGigs(filters?: ListOpenGigsFilters): Promise<Gig[]> {
  return filterGigs(await getCachedPublicOpenGigs(), filters);
}

export async function listGigsByCreator(creatorId: string): Promise<Gig[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("gig")
    .select(GIG_SELECT)
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return withCreatorSummaries(data || []);
}

export async function createGig(
  creatorId: string,
  input: CreateGigInput,
  instrumentNames: string[],
  genreNames: string[],
): Promise<Gig> {
  const supabase = await createSupabaseServerClient();
  const [instruments, genres] = await Promise.all([
    ensureInstruments(instrumentNames, creatorId),
    ensureGenres(genreNames, creatorId),
  ]);

  const { data: gig, error: gigError } = await supabase
    .from("gig")
    .insert({
      creator_id: creatorId,
      title: input.title,
      description: input.description,
      project_type: input.projectType,
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
      compensation_type: input.compensationType,
      compensation_details: input.compensationDetails,
      deadline: normalizeDeadline(input.deadline),
      status: "OPEN",
    })
    .select()
    .single();

  if (gigError) throw gigError;

  const junctionResults = await Promise.all([
    ...instruments.map((inst) =>
      supabase.from("gig_instrument").insert({
        gig_id: gig.id,
        instrument_id: inst.id,
      })
    ),
    ...genres.map((genre) =>
      supabase.from("gig_genre").insert({
        gig_id: gig.id,
        genre_id: genre.id,
      })
    ),
  ]);
  const junctionError = firstError(junctionResults);
  if (junctionError) throw junctionError;

  return {
    id: gig.id,
    creatorId: gig.creator_id,
    title: gig.title,
    description: gig.description,
    projectType: gig.project_type,
    location: gig.location,
    locationDisplayName: gig.location_display_name,
    locationPlaceId: gig.location_place_id,
    locationLat: gig.location_lat,
    locationLng: gig.location_lng,
    locationCity: gig.location_city,
    locationState: gig.location_state,
    locationCountry: gig.location_country,
    locationProvider: gig.location_provider,
    providerPlaceId: gig.provider_place_id,
    locationVisibility: gig.location_visibility ?? "public_region",
    isRemote: gig.is_remote,
    distanceMiles: null,
    compensationType: gig.compensation_type,
    compensationDetails: gig.compensation_details,
    deadline: gig.deadline,
    status: gig.status,
    createdAt: gig.created_at,
    updatedAt: gig.updated_at,
    instruments: instrumentNames,
    genres: genreNames,
  };
}

export async function updateGig(
  id: string,
  input: UpdateGigInput,
  creatorId: string,
  instrumentNames?: string[],
  genreNames?: string[],
): Promise<Gig> {
  const supabase = await createSupabaseServerClient();

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

  if (instrumentNames || genreNames) {
    const deleteResults = await Promise.all([
      supabase.from("gig_instrument").delete().eq("gig_id", id),
      supabase.from("gig_genre").delete().eq("gig_id", id),
    ]);
    const deleteError = firstError(deleteResults);
    if (deleteError) throw deleteError;
  }

  const { error: updateError } = await supabase
    .from("gig")
    .update(updateData)
    .eq("id", id);

  if (updateError) throw updateError;

  if (instrumentNames || genreNames) {
    const [instruments, genres] = await Promise.all([
      instrumentNames ? ensureInstruments(instrumentNames, creatorId) : Promise.resolve([]),
      genreNames ? ensureGenres(genreNames, creatorId) : Promise.resolve([]),
    ]);

    const junctionResults = await Promise.all([
      ...instruments.map((inst) =>
        supabase.from("gig_instrument").insert({
          gig_id: id,
          instrument_id: inst.id,
        })
      ),
      ...genres.map((genre) =>
        supabase.from("gig_genre").insert({
          gig_id: id,
          genre_id: genre.id,
        })
      ),
    ]);
    const junctionError = firstError(junctionResults);
    if (junctionError) throw junctionError;
  }

  const { data, error } = await supabase
    .from("gig")
    .select(GIG_SELECT)
    .eq("id", id)
    .single();

  if (error) throw error;
  return toGig(data);
}

export async function closeGig(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("gig")
    .update({ status: "CLOSED" })
    .eq("id", id);

  if (error) throw error;
}

export async function reopenGig(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("gig")
    .update({ status: "OPEN" })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteGig(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("gig").delete().eq("id", id);

  if (error) throw error;
}
