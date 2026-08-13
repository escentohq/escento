"use server";

import { revalidatePath } from "next/cache";
import { invalidatePublicGig } from "@/lib/public-cache-invalidation";
import { redirect } from "next/navigation";

import { requireAdminEmail } from "@/lib/admin-auth";
import { getAdminEditableGig, updateAdminEditableGig } from "@/lib/api/admin-edits";
import { COMPENSATION_TYPES, GIG_STATUSES, PROJECT_TYPES } from "@/lib/display";
import {
  type ActionState,
  fieldError,
  formLevelMessage,
  nonEmptyOrNull,
  parseCsv,
  parseOptionalDate,
  pickEnum,
  strOrEmpty,
} from "@/lib/form-utils";
import { gigValuesFromFormData } from "@/lib/form-snapshots";
import { parseStructuredLocation, validateStructuredLocation } from "@/lib/location";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function adminUpdateGigAction(
  gigId: string,
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const adminEmail = await requireAdminEmail();
  const gig = await getAdminEditableGig(gigId);
  if (!gig) redirect("/admin/gigs");

  const fieldErrors: Record<string, string> = {};
  const title = strOrEmpty(fd.get("title"));
  const description = strOrEmpty(fd.get("description"));
  const projectType = pickEnum(fd.get("projectType"), PROJECT_TYPES);
  const location = parseStructuredLocation(fd);
  const isRemote = fd.get("isRemote") === "on";
  const compensationType = pickEnum(fd.get("compensationType"), COMPENSATION_TYPES);
  const compensationDetails = nonEmptyOrNull(fd.get("compensationDetails"));
  const deadlineRaw = strOrEmpty(fd.get("deadline"));
  const deadline = parseOptionalDate(deadlineRaw);
  const status = pickEnum(fd.get("status"), GIG_STATUSES);
  const instruments = parseCsv(fd.get("instrumentsCsv"));
  const genres = parseCsv(fd.get("genresCsv"));

  if (!title) fieldError(fieldErrors, "title", "Add a title.");
  if (title.length > 120) fieldError(fieldErrors, "title", "Keep the title under 120 characters.");
  if (!description) fieldError(fieldErrors, "description", "Add the project details.");
  if (description.length > 2400) fieldError(fieldErrors, "description", "Keep the description under 2,400 characters.");
  if (!projectType) fieldError(fieldErrors, "projectType", "Choose a project type.");
  if (!compensationType) fieldError(fieldErrors, "compensationType", "Choose a compensation type.");
  if (!status) fieldError(fieldErrors, "status", "Choose a gig status.");
  if (deadlineRaw && !deadline) fieldError(fieldErrors, "deadline", "Use a valid date.");
  validateStructuredLocation(fieldErrors, location, isRemote);

  if (Object.keys(fieldErrors).length) {
    return {
      ok: false,
      message: formLevelMessage(fieldErrors, "Tighten the gig before saving."),
      fieldErrors,
      values: gigValuesFromFormData(fd),
    };
  }

  await updateAdminEditableGig({
    gigId,
    input: {
      title,
      description,
      projectType: projectType!,
      location: location.location,
      locationDisplayName: location.locationDisplayName,
      locationPlaceId: location.locationPlaceId,
      locationLat: location.locationLat,
      locationLng: location.locationLng,
      locationCity: location.locationCity,
      locationState: location.locationState,
      locationCountry: location.locationCountry,
      locationProvider: location.locationProvider,
      providerPlaceId: location.providerPlaceId,
      locationVisibility: location.locationVisibility,
      isRemote,
      compensationType: compensationType!,
      compensationDetails,
      deadline,
      status: status!,
    },
    instrumentNames: instruments,
    genreNames: genres,
  });

  const admin = createSupabaseAdminClient();
  const { error: auditError } = await admin.from("admin_audit_log").insert({
    admin_user_email: adminEmail,
    action: "edit_gig",
    target_type: "gig",
    target_id: gigId,
    reason: "Full admin gig edit",
  });

  if (auditError) {
    console.error("[admin] gig edit audit failed", auditError);
  }

  revalidatePath("/admin/gigs");
  revalidatePath(`/admin/gigs/${gigId}/edit`);
  revalidatePath("/gigs");
  revalidatePath(`/gigs/${gigId}`);
  revalidatePath("/");
  invalidatePublicGig(gigId);
  redirect("/admin/gigs");
}
