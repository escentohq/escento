import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureInstruments, ensureGenres } from "./tags";
import type { Gig, CreateGigInput, UpdateGigInput } from "./types";

type GigCreatorSummary = {
  id: string;
  name: string | null;
  email: string | null;
};

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
      .select("id, name, email")
      .in("id", uniqueIds);

    if (error) throw error;

    return new Map(
      (data ?? []).map((user) => [
        user.id,
        {
          id: user.id,
          name: user.name ?? null,
          email: user.email ?? null,
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

function toGig(raw: any, creatorSummary?: GigCreatorSummary): Gig {
  const joinedCreator = raw.app_user
    ? { name: raw.app_user.name ?? null, email: raw.app_user.email ?? null }
    : undefined;

  return {
    id: raw.id,
    creatorId: raw.creator_id,
    title: raw.title,
    description: raw.description,
    projectType: raw.project_type,
    location: raw.location,
    isRemote: raw.is_remote,
    compensationType: raw.compensation_type,
    compensationDetails: raw.compensation_details,
    deadline: raw.deadline,
    status: raw.status,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    instruments: raw.gig_instrument?.map((x: any) => x.instrument?.name).filter(Boolean) ?? [],
    genres: raw.gig_genre?.map((x: any) => x.genre?.name).filter(Boolean) ?? [],
    creator: creatorSummary ?? joinedCreator,
  };
}

export async function getGig(id: string): Promise<Gig | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("gig")
    .select("*, gig_instrument(*, instrument(*)), gig_genre(*, genre(*)), app_user(name, email)")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  if (!data) return null;

  const [gig] = await withCreatorSummaries([data]);
  return gig;
}

interface ListOpenGigsFilters {
  projectType?: string;
  instrument?: string;
  genre?: string;
}

export async function listOpenGigs(filters?: ListOpenGigsFilters): Promise<Gig[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("gig")
    .select("*, gig_instrument(*, instrument(*)), gig_genre(*, genre(*)), app_user(name, email)")
    .eq("status", "OPEN")
    .order("created_at", { ascending: false });

  if (filters?.projectType) {
    query = query.eq("project_type", filters.projectType);
  }

  if (filters?.instrument) {
    query = query
      .select("*, gig_instrument!inner(instrument!inner(name)), gig_genre(*, genre(*)), app_user(name, email)")
      .eq("gig_instrument.instrument.name", filters.instrument);
  }

  if (filters?.genre) {
    query = query
      .select("*, gig_instrument(*, instrument(*)), gig_genre!inner(genre!inner(name)), app_user(name, email)")
      .eq("gig_genre.genre.name", filters.genre);
  }

  const { data, error } = await query;

  if (error) throw error;

  return withCreatorSummaries((data || []).slice(0, 50));
}

export async function listGigsByCreator(creatorId: string): Promise<Gig[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("gig")
    .select("*, gig_instrument(*, instrument(*)), gig_genre(*, genre(*)), app_user(name, email)")
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
      is_remote: input.isRemote,
      compensation_type: input.compensationType,
      compensation_details: input.compensationDetails,
      deadline: normalizeDeadline(input.deadline),
      status: "OPEN",
    })
    .select()
    .single();

  if (gigError) throw gigError;

  await Promise.all([
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

  return {
    id: gig.id,
    creatorId: gig.creator_id,
    title: gig.title,
    description: gig.description,
    projectType: gig.project_type,
    location: gig.location,
    isRemote: gig.is_remote,
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
  if (input.isRemote !== undefined) updateData.is_remote = input.isRemote;
  if (input.compensationType !== undefined) updateData.compensation_type = input.compensationType;
  if (input.compensationDetails !== undefined) updateData.compensation_details = input.compensationDetails;
  if (input.deadline !== undefined) updateData.deadline = normalizeDeadline(input.deadline);

  if (instrumentNames || genreNames) {
    await Promise.all([
      supabase.from("gig_instrument").delete().eq("gig_id", id),
      supabase.from("gig_genre").delete().eq("gig_id", id),
    ]);
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

    await Promise.all([
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
  }

  const { data } = await supabase
    .from("gig")
    .select("*, gig_instrument(*, instrument(*)), gig_genre(*, genre(*))")
    .eq("id", id)
    .single();

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

export async function deleteGig(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("gig").delete().eq("id", id);

  if (error) throw error;
}
