"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSignedIn } from "@/lib/auth-guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function deleteAccountAction(): Promise<void> {
  const session = await requireSignedIn("/account");
  const admin = createSupabaseAdminClient();

  // Delete auth user (cascades delete profiles/gigs in DB)
  const { error } = await admin.auth.admin.deleteUser(session.user.id);
  if (error) throw error;

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateNameAction(
  _state: { ok: boolean; message?: string; fieldErrors?: Record<string, string> },
  fd: FormData,
) {
  const session = await requireSignedIn("/account");
  const name = String(fd.get("name") ?? "").trim();

  if (!name) {
    return { ok: false, fieldErrors: { name: "Name is required." } };
  }

  if (name.length > 80) {
    return { ok: false, fieldErrors: { name: "Name must be 80 characters or fewer." } };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    data: { full_name: name },
  });

  if (error) throw error;

  revalidatePath("/account");
  revalidatePath("/");

  return { ok: true, message: "Name updated." };
}
