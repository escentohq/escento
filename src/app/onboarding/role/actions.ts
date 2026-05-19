"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSignedIn } from "@/lib/auth-guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function setRole(role: "MUSICIAN" | "CREATOR"): Promise<void> {
  const session = await requireSignedIn("/onboarding/role");
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.updateUser({
    data: { role },
  });

  if (error) throw error;

  revalidatePath("/");
  if (role === "MUSICIAN") {
    redirect("/profile/create");
  } else {
    redirect("/gigs/manage");
  }
}
