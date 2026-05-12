"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";

export async function setRole(role: "MUSICIAN" | "CREATOR") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/signin?callbackUrl=/onboarding/role");

  await db.user.update({
    where: { id: session.user.id },
    data: { role },
  });

  revalidatePath("/");
  redirect("/");
}
