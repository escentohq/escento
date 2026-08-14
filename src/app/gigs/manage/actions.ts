"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth-guards";
import { closeGig, deleteGig, getGigForCreator, reopenGig } from "@/lib/api/gigs";
import { invalidatePublicGig } from "@/lib/public-cache-invalidation";

async function ensureCreatorOwnsGig(gigId: string) {
  const session = await requireRole("CREATOR", "/gigs/manage");
  const gig = await getGigForCreator(gigId, session.user.id);

  if (!gig) redirect("/gigs/manage");
  return session;
}

export async function closeGigAction(gigId: string) {
  await ensureCreatorOwnsGig(gigId);
  await closeGig(gigId);
  revalidatePath("/gigs");
  revalidatePath("/gigs/manage");
  revalidatePath(`/gigs/${gigId}`);
  revalidatePath("/");
  invalidatePublicGig(gigId);
  redirect("/gigs/manage");
}

export async function reopenGigAction(gigId: string) {
  await ensureCreatorOwnsGig(gigId);
  await reopenGig(gigId);
  revalidatePath("/gigs");
  revalidatePath("/gigs/manage");
  revalidatePath(`/gigs/${gigId}`);
  revalidatePath("/");
  invalidatePublicGig(gigId);
  redirect("/gigs/manage");
}

export async function deleteGigAction(gigId: string) {
  await ensureCreatorOwnsGig(gigId);
  await deleteGig(gigId);
  revalidatePath("/gigs");
  revalidatePath("/gigs/manage");
  revalidatePath("/");
  invalidatePublicGig(gigId);
  redirect("/gigs/manage");
}
