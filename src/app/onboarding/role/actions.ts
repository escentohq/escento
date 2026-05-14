"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSignedIn } from "@/lib/auth-guards";
import { updateUser } from "@/lib/api/users";

export async function setRole(role: "MUSICIAN" | "CREATOR") {
  const session = await requireSignedIn("/onboarding/role");

  await updateUser(session.user.id, { role });

  revalidatePath("/");
  if (role === "MUSICIAN") {
    redirect("/profile/create");
  } else {
    redirect("/gigs/manage");
  }
}
