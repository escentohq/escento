"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSignedIn } from "@/lib/auth-guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function setRole(role: "MUSICIAN" | "CREATOR") {
  const session = await requireSignedIn("/onboarding/role");
  const supabase = await createSupabaseServerClient();

  await supabase
    .from("user")
    .update({ role })
    .eq("id", session.user.id);

  revalidatePath("/");
  redirect("/");
}
