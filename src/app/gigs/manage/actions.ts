"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth-guards";
import { getGig, closeGig, deleteGig } from "@/lib/api/gigs";

async function ensureCreatorOwnsGig(gigId: string) {
  const session = await requireRole("CREATOR", "/gigs/manage");
  const gig = await getGig(gigId);

  if (!gig || gig.creatorId !== session.user.id) redirect("/gigs/manage");
  return session;
}

export async function closeGigAction(gigId: string) {
  await ensureCreatorOwnsGig(gigId);
  await closeGig(gigId);
  revalidatePath("/gigs");
  revalidatePath("/gigs/manage");
  revalidatePath(`/gigs/${gigId}`);
  redirect("/gigs/manage");
}

export async function deleteGigAction(gigId: string) {
  await ensureCreatorOwnsGig(gigId);
  await deleteGig(gigId);
  revalidatePath("/gigs");
  revalidatePath("/gigs/manage");
  redirect("/gigs/manage");
}
