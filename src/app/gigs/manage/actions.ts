"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";

async function ensureCreatorOwnsGig(gigId: string) {
  const session = await requireRole("CREATOR", "/gigs/manage");

  const gig = await db.gig.findUnique({
    where: { id: gigId },
    select: { creatorId: true },
  });
  if (!gig || gig.creatorId !== session.user.id) redirect("/gigs/manage");
  return session;
}

export async function closeGig(gigId: string) {
  await ensureCreatorOwnsGig(gigId);
  await db.gig.update({
    where: { id: gigId },
    data: { status: "CLOSED" },
  });
  revalidatePath("/gigs");
  revalidatePath("/gigs/manage");
  revalidatePath(`/gigs/${gigId}`);
  redirect("/gigs/manage");
}

export async function deleteGig(gigId: string) {
  await ensureCreatorOwnsGig(gigId);
  await db.$transaction(async (tx) => {
    await tx.gigInstrument.deleteMany({ where: { gigId } });
    await tx.gigGenre.deleteMany({ where: { gigId } });
    await tx.gig.delete({ where: { id: gigId } });
  });
  revalidatePath("/gigs");
  revalidatePath("/gigs/manage");
  redirect("/gigs/manage");
}
