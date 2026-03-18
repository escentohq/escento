"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { db } from "@/lib/db";

async function ensureCreatorOwnsGig(gigId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/api/auth/signin");
  if (session.user.role !== "CREATOR") redirect("/");

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
  redirect("/gigs/manage");
}

export async function deleteGig(gigId: string) {
  await ensureCreatorOwnsGig(gigId);
  await db.$transaction(async (tx) => {
    await tx.gigInstrument.deleteMany({ where: { gigId } });
    await tx.gigGenre.deleteMany({ where: { gigId } });
    await tx.gig.delete({ where: { id: gigId } });
  });
  redirect("/gigs/manage");
}
