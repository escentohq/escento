"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth-guards";
import { createGig } from "@/lib/api/gigs";
import { COMPENSATION_TYPES, PROJECT_TYPES } from "@/lib/display";
import {
  type ActionState,
  fieldError,
  nonEmptyOrNull,
  parseCsv,
  parseOptionalDate,
  pickEnum,
  strOrEmpty,
} from "@/lib/form-utils";

export async function createGigAction(_state: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireRole("CREATOR", "/gigs/create");
  const fieldErrors: Record<string, string> = {};

  const title = strOrEmpty(fd.get("title"));
  const description = strOrEmpty(fd.get("description"));
  const projectType = pickEnum(fd.get("projectType"), PROJECT_TYPES);
  const location = nonEmptyOrNull(fd.get("location"));
  const isRemote = fd.get("isRemote") === "on";
  const compensationType = pickEnum(fd.get("compensationType"), COMPENSATION_TYPES);
  const compensationDetails = nonEmptyOrNull(fd.get("compensationDetails"));
  const deadlineRaw = strOrEmpty(fd.get("deadline"));
  const deadline = parseOptionalDate(deadlineRaw);
  const instruments = parseCsv(fd.get("instrumentsCsv"));
  const genres = parseCsv(fd.get("genresCsv"));

  if (!title) fieldError(fieldErrors, "title", "Add a title.");
  if (title.length > 120) fieldError(fieldErrors, "title", "Keep the title under 120 characters.");
  if (!description) fieldError(fieldErrors, "description", "Add the project details.");
  if (description.length > 2400) fieldError(fieldErrors, "description", "Keep the description under 2,400 characters.");
  if (!projectType) fieldError(fieldErrors, "projectType", "Choose a project type.");
  if (!compensationType) fieldError(fieldErrors, "compensationType", "Choose a compensation type.");
  if (deadlineRaw && !deadline) fieldError(fieldErrors, "deadline", "Use a valid date.");

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "Tighten the set before publishing.", fieldErrors };
  }

  const gig = await createGig(
    {
      creatorId: session.user.id,
      title,
      description,
      projectType: projectType!,
      location,
      isRemote,
      compensationType: compensationType!,
      compensationDetails,
      deadline,
    },
    instruments,
    genres,
  );

  revalidatePath("/gigs");
  revalidatePath("/gigs/manage");
  redirect(`/gigs/draft/${gig.id}/step/2`);
}
