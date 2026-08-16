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
import { toGig, type GigCreatorSummary } from "./normalizers";

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

/** Mirrors `readPublicProfiles`: a public listing degrades to empty rather than
 * failing a prerender or 500-ing the homepage. See the note there. */
async function readPublicOpenGigs(): Promise<Gig[]> {
  try {
    return await getCachedPublicOpenGigs();
  } catch (error) {
    console.error("[gigs] public listing read failed, rendering empty:", error);
    return [];
  }
}

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
  return filterGigs(await readPublicOpenGigs(), filters);
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


/**
 * camelCase input → the snake_case column names the RPCs merge into the row.
 * Only keys the caller supplied are included: the update RPC treats a present
 * key as "write this" (explicit nulls included) and an absent key as "keep the
 * stored value".
 */
function gigColumnPayload(input: Partial<CreateGigInput & UpdateGigInput>): Record<string, unknown> {
  const pairs: Array<[string, unknown]> = [
    ["title", input.title],
    ["description", input.description],
    ["project_type", input.projectType],
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
    ["compensation_type", input.compensationType],
    ["compensation_details", input.compensationDetails],
    ["deadline", input.deadline === undefined ? undefined : normalizeDeadline(input.deadline)],
    ["status", input.status],
  ];

  const payload: Record<string, unknown> = {};
  for (const [column, value] of pairs) {
    if (value !== undefined) payload[column] = value;
  }
  return payload;
}

/** The RPCs return the gig row itself, so the shape matches a table read. */
function gigFromRow(row: Record<string, any>, instruments: string[], genres: string[]): Gig {
  return {
    id: row.id,
    creatorId: row.creator_id,
    title: row.title,
    description: row.description,
    projectType: row.project_type,
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
    compensationType: row.compensation_type,
    compensationDetails: row.compensation_details,
    deadline: row.deadline,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    instruments,
    genres,
  };
}

/**
 * Publish a gig and its taxonomy in one database transaction
 * (`create_gig_with_tags`). The root row used to commit as OPEN — and therefore
 * discoverable — before any junction row was written, so a failure in between
 * published a gig with none of the instruments or genres it was posted for.
 *
 * Tag rows themselves are ensured beforehand: they are shared reference data,
 * and an orphan tag name is not partial user state.
 */
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

  const { data, error } = await supabase.rpc("create_gig_with_tags", {
    p_gig: gigColumnPayload(input),
    p_instrument_ids: instruments.map((tag) => tag.id),
    p_genre_ids: genres.map((tag) => tag.id),
  });

  if (error) throw error;
  if (!data) throw new Error("Gig create returned no row.");

  return gigFromRow(data as Record<string, any>, instrumentNames, genreNames);
}

/**
 * Update a gig and, when tag lists are supplied, replace its taxonomy — both in
 * one transaction (`update_gig_with_tags`). The old sequence deleted every
 * junction row before touching the root, so a later failure left a live gig with
 * no tags while the UI said the save had failed.
 *
 * Ownership is enforced inside the function; this path previously relied on RLS
 * alone and silently updated nothing when it did not match.
 */
export async function updateGig(
  id: string,
  input: UpdateGigInput,
  creatorId: string,
  instrumentNames?: string[],
  genreNames?: string[],
): Promise<Gig> {
  const supabase = await createSupabaseServerClient();

  const [instruments, genres] = await Promise.all([
    instrumentNames ? ensureInstruments(instrumentNames, creatorId) : Promise.resolve(null),
    genreNames ? ensureGenres(genreNames, creatorId) : Promise.resolve(null),
  ]);

  const { error } = await supabase.rpc("update_gig_with_tags", {
    p_id: id,
    p_gig: gigColumnPayload(input),
    p_instrument_ids: instruments ? instruments.map((tag) => tag.id) : null,
    p_genre_ids: genres ? genres.map((tag) => tag.id) : null,
  });

  if (error) throw error;

  // Read the committed row back with its joins so callers get the same shape a
  // page read produces, including tags they did not just write.
  const { data, error: readError } = await supabase
    .from("gig")
    .select(GIG_SELECT)
    .eq("id", id)
    .single();

  if (readError) throw readError;
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
