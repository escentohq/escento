"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSignedIn } from "@/lib/auth-guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

export async function deleteAccountAction(): Promise<void> {
  const session = await requireSignedIn("/account");
  const serverSupabase = await createSupabaseServerClient();
  const adminSupabase = createSupabaseAdminClient();

  // Delete auth user — all app data cascades automatically
  await adminSupabase.auth.admin.deleteUser(session.user.id);

  // Clear session cookies — will error if auth row already gone, safe to ignore
  await serverSupabase.auth.signOut().catch(() => {});

  redirect("/signin");
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

  // Update both app_user and auth metadata
  const [appUserError, authError] = await Promise.all([
    supabase
      .from("app_user")
      .update({ name })
      .eq("id", session.user.id)
      .then(r => r.error),
    supabase.auth
      .updateUser({ data: { full_name: name } })
      .then(r => r.error),
  ]);

  if (appUserError || authError) throw appUserError || authError;

  revalidatePath("/account");
  revalidatePath("/");

  return { ok: true, message: "Name updated." };
}
