import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureInstruments, ensureGenres } from "./tags";
import type { Gig, CreateGigInput, UpdateGigInput } from "./types";

function normalizeDeadline(deadline: Date | string | null | undefined): string | null {
  if (!deadline) return null;
  if (typeof deadline === "string") return deadline;
  if (deadline instanceof Date) return deadline.toISOString().split("T")[0];
  return null;
}

function toGig(raw: any): Gig {
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
    experienceLevel: raw.experience_level,
    ensembleSize: raw.ensemble_size,
    equipmentRequirements: raw.equipment_requirements,
    creatorName: raw.creator_name,
    creatorPhone: raw.creator_phone,
    creatorBio: raw.creator_bio,
    creatorContactMethod: raw.creator_contact_method,
    creatorContactLink: raw.creator_contact_link,
    instruments: raw.gig_instrument?.map((x: any) => x.instrument?.name).filter(Boolean) ?? [],
    genres: raw.gig_genre?.map((x: any) => x.genre?.name).filter(Boolean) ?? [],
    applicationQuestions: raw.gig_application_questions?.map((q: any) => ({
      text: q.question_text,
      type: q.question_type,
    })) ?? [],
    ...(raw.user && {
      creator: {
        name: raw.user.name,
        email: raw.user.email,
      },
    }),
  };
}

export async function getGig(id: string): Promise<Gig | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("gig")
    .select("*, gig_instrument(*, instrument(*)), gig_genre(*, genre(*)), user(name, email)")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ? toGig(data) : null;
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
    .select("*, gig_instrument(*, instrument(*)), gig_genre(*, genre(*))")
    .eq("status", "OPEN")
    .order("created_at", { ascending: false });

  if (filters?.projectType) {
    query = query.eq("project_type", filters.projectType);
  }

  const { data, error } = await query;

  if (error) throw error;

  let gigs = (data || []).map(toGig);

  if (filters?.instrument) {
    const instrument = filters.instrument;
    gigs = gigs.filter((g) => g.instruments?.includes(instrument));
  }

  if (filters?.genre) {
    const genre = filters.genre;
    gigs = gigs.filter((g) => g.genres?.includes(genre));
  }

  return gigs.slice(0, 50);
}

export async function listGigsByCreator(creatorId: string): Promise<Gig[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("gig")
    .select("*, gig_instrument(*, instrument(*)), gig_genre(*, genre(*))")
    .eq("creator_id", creatorId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(toGig);
}

export async function createGig(input: CreateGigInput, instrumentNames: string[], genreNames: string[]): Promise<Gig> {
  const supabase = await createSupabaseServerClient();
  const [instruments, genres] = await Promise.all([
    ensureInstruments(instrumentNames),
    ensureGenres(genreNames),
  ]);

  const { data: gig, error: gigError } = await supabase
    .from("gig")
    .insert({
      id: crypto.randomUUID(),
      creator_id: input.creatorId,
      title: input.title,
      description: input.description,
      project_type: input.projectType,
      location: input.location,
      is_remote: input.isRemote,
      compensation_type: input.compensationType,
      compensation_details: input.compensationDetails,
      deadline: normalizeDeadline(input.deadline),
      status: "DRAFT",
    })
    .select()
    .single();

  if (gigError) throw gigError;

  await Promise.all([
    ...instruments.map((inst) =>
      supabase.from("gig_instrument").insert({ 
        id: crypto.randomUUID(),
        gig_id: gig.id, 
        instrument_id: inst.id 
      })
    ),
    ...genres.map((genre) => supabase.from("gig_genre").insert({ 
      id: crypto.randomUUID(),
      gig_id: gig.id, 
      genre_id: genre.id 
    })),
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
    experienceLevel: gig.experience_level || null,
    ensembleSize: gig.ensemble_size || null,
    equipmentRequirements: gig.equipment_requirements || null,
    creatorName: gig.creator_name || null,
    creatorPhone: gig.creator_phone || null,
    creatorBio: gig.creator_bio || null,
    creatorContactMethod: gig.creator_contact_method || null,
    creatorContactLink: gig.creator_contact_link || null,
    instruments: instrumentNames,
    genres: genreNames,
  };
}

export async function updateGig(
  id: string,
  input: UpdateGigInput,
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
  if (input.status !== undefined) updateData.status = input.status;
  if (input.experienceLevel !== undefined) updateData.experience_level = input.experienceLevel;
  if (input.ensembleSize !== undefined) updateData.ensemble_size = input.ensembleSize;
  if (input.equipmentRequirements !== undefined) updateData.equipment_requirements = input.equipmentRequirements;
  if (input.creatorName !== undefined) updateData.creator_name = input.creatorName;
  if (input.creatorPhone !== undefined) updateData.creator_phone = input.creatorPhone;
  if (input.creatorBio !== undefined) updateData.creator_bio = input.creatorBio;
  if (input.creatorContactMethod !== undefined) updateData.creator_contact_method = input.creatorContactMethod;
  if (input.creatorContactLink !== undefined) updateData.creator_contact_link = input.creatorContactLink;

  if (instrumentNames || genreNames) {
    await Promise.all([
      supabase.from("gig_instrument").delete().eq("gig_id", id),
      supabase.from("gig_genre").delete().eq("gig_id", id),
    ]);
  }

  const { data: gig, error: gigError } = await supabase
    .from("gig")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (gigError) throw gigError;

  if (instrumentNames || genreNames) {
    const [instruments, genres] = await Promise.all([
      instrumentNames ? ensureInstruments(instrumentNames) : Promise.resolve([]),
      genreNames ? ensureGenres(genreNames) : Promise.resolve([]),
    ]);

    await Promise.all([
      ...instruments.map((inst) =>
        supabase.from("gig_instrument").insert({ 
          id: crypto.randomUUID(),
          gig_id: id, 
          instrument_id: inst.id 
        })
      ),
      ...genres.map((genre) => supabase.from("gig_genre").insert({ 
        id: crypto.randomUUID(),
        gig_id: id, 
        genre_id: genre.id 
      })),
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
  const { error } = await supabase.from("gig").update({ status: "CLOSED" }).eq("id", id);

  if (error) throw error;
}

export async function deleteGig(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();

  await Promise.all([
    supabase.from("gig_instrument").delete().eq("gig_id", id),
    supabase.from("gig_genre").delete().eq("gig_id", id),
  ]);

  const { error } = await supabase.from("gig").delete().eq("id", id);

  if (error) throw error;
}

export async function publishGig(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("gig").update({ status: "OPEN" }).eq("id", id);
  if (error) throw error;
}

export async function saveGigApplicationQuestions(
  gigId: string,
  questions: { text: string; type: string }[],
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.from("gig_application_questions").delete().eq("gig_id", gigId);

  if (questions.length === 0) return;

  const rows = questions.map((q, i) => ({
    id: crypto.randomUUID(),
    gig_id: gigId,
    question_text: q.text,
    question_type: q.type,
    sort_order: i,
  }));

  const { error } = await supabase.from("gig_application_questions").insert(rows);
  if (error) throw error;
}
