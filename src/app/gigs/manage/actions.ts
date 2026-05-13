"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";

async function ensureCreatorOwnsGig(gigId: string) {
  const session = await requireRole("CREATOR", "/gigs/manage");
  const supabase = await (await import("@/lib/supabase/server")).createSupabaseServerClient();

  const { data: gig } = await supabase
    .from("gig")
    .select("creator_id")
    .eq("id", gigId)
    .single();

  if (!gig || gig.creator_id !== session.user.id) redirect("/gigs/manage");
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
  const supabase = await (await import("@/lib/supabase/server")).createSupabaseServerClient();

  // Delete in order: relationships first, then gig
  await Promise.all([
    supabase.from("gig_instrument").delete().eq("gig_id", gigId),
    supabase.from("gig_genre").delete().eq("gig_id", gigId),
  ]);

  await supabase.from("gig").delete().eq("id", gigId);

  revalidatePath("/gigs");
  revalidatePath("/gigs/manage");
  redirect("/gigs/manage");
}
