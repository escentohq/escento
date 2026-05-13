"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSignedIn } from "@/lib/auth-guards";
import { db } from "@/lib/db";

export async function setRole(role: "MUSICIAN" | "CREATOR") {
  const session = await requireSignedIn("/onboarding/role");

  await db.user.update({
    where: { id: session.user.id },
    data: { role },
  });

  revalidatePath("/");
  redirect("/");
}
