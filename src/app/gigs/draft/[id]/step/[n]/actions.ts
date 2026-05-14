"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { getGig, updateGig, publishGig, saveGigApplicationQuestions } from "@/lib/api/gigs";
import { ensureInstruments, ensureGenres } from "@/lib/api/tags";
import { ActionState, emptyActionState, parseCsv, strOrEmpty, fieldError } from "@/lib/form-utils";

export async function updateGigDraftAction(
  _state: ActionState,
  fd: FormData,
  gigId: string
): Promise<ActionState> {
  const session = await requireRole("CREATOR", `/gigs/draft/${gigId}/step/2`);
  const gig = await getGig(gigId);

  if (!gig || gig.creatorId !== session.user.id) {
    redirect("/gigs/manage");
  }

  const fieldErrors: Record<string, string> = {};
  const instruments = parseCsv(fd.get("instrumentsCsv"));
  const genres = parseCsv(fd.get("genresCsv"));
  const experienceLevel = strOrEmpty(fd.get("experienceLevel"));
  const ensembleSize = strOrEmpty(fd.get("ensembleSize"));
  const equipmentRequirements = strOrEmpty(fd.get("equipmentRequirements"));

  if (!instruments.length) fieldError(fieldErrors, "instruments", "Add at least one instrument.");
  if (!genres.length) fieldError(fieldErrors, "genres", "Add at least one genre.");

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "Please fix the errors below", fieldErrors };
  }

  await updateGig(
    gigId,
    {
      experienceLevel: experienceLevel || null,
      ensembleSize: ensembleSize || null,
      equipmentRequirements: equipmentRequirements || null,
    },
    instruments,
    genres
  );

  revalidatePath(`/gigs/draft/${gigId}`);
  redirect(`/gigs/draft/${gigId}/step/3`);
}

export async function publishGigAction(
  _state: ActionState,
  fd: FormData,
  gigId: string
): Promise<ActionState> {
  const session = await requireRole("CREATOR", `/gigs/draft/${gigId}/step/3`);
  const gig = await getGig(gigId);

  if (!gig || gig.creatorId !== session.user.id) {
    redirect("/gigs/manage");
  }

  const fieldErrors: Record<string, string> = {};
  const creatorName = strOrEmpty(fd.get("creatorName"));
  const creatorPhone = strOrEmpty(fd.get("creatorPhone"));
  const creatorBio = strOrEmpty(fd.get("creatorBio"));
  const creatorContactMethod = strOrEmpty(fd.get("creatorContactMethod"));
  const creatorContactLink = strOrEmpty(fd.get("creatorContactLink"));

  if (!creatorName) fieldError(fieldErrors, "creatorName", "Add your name.");
  if (!creatorContactMethod)
    fieldError(fieldErrors, "creatorContactMethod", "Choose a contact method.");

  // Parse custom questions (indexed FormData: question[0][text], question[0][type], etc.)
  const questions: Array<{ text: string; type: string }> = [];
  let idx = 0;
  while (fd.get(`question[${idx}][text]`)) {
    const text = strOrEmpty(fd.get(`question[${idx}][text]`));
    const type = strOrEmpty(fd.get(`question[${idx}][type]`)) || "text";
    if (text) {
      questions.push({ text, type });
    }
    idx++;
  }

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "Please fix the errors below", fieldErrors };
  }

  await updateGig(
    gigId,
    {
      creatorName: creatorName || null,
      creatorPhone: creatorPhone || null,
      creatorBio: creatorBio || null,
      creatorContactMethod: creatorContactMethod || null,
      creatorContactLink: creatorContactLink || null,
    },
    gig.instruments || [],
    gig.genres || []
  );

  if (questions.length > 0) {
    await saveGigApplicationQuestions(
      gigId,
      questions.map((q, i) => ({
        id: `q-${i}`,
        gigId,
        questionText: q.text,
        questionType: q.type,
        displayOrder: i,
      }))
    );
  }

  await publishGig(gigId);

  revalidatePath("/gigs");
  revalidatePath("/gigs/manage");
  redirect(`/gigs/${gigId}`);
}
