"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSignedIn } from "@/lib/auth-guards";
import {
  ADMIN_CREDENTIALS_ERROR,
  DELETE_ACCOUNT_UNAVAILABLE,
} from "@/lib/account-deletion";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type ActionState } from "@/lib/form-utils";

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

export async function deleteAccountAction(): Promise<void> {
  const session = await requireSignedIn("/account");
  const supabase = await createSupabaseServerClient();

  const [profileResult, gigResult, appUserResult] = await Promise.all([
    supabase.from("musician_profile").delete().eq("user_id", session.user.id),
    supabase.from("gig").delete().eq("creator_id", session.user.id),
    supabase.from("app_user").delete().eq("id", session.user.id),
  ]);

  const deleteError = profileResult.error ?? gigResult.error ?? appUserResult.error;
  if (deleteError) throw deleteError;

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.auth.admin.deleteUser(session.user.id);
    if (error) throw error;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === ADMIN_CREDENTIALS_ERROR
    ) {
      console.error("[deleteAccount] missing SUPABASE_SERVICE_ROLE_KEY");
      throw new Error(DELETE_ACCOUNT_UNAVAILABLE);
    }
    throw error;
  }

  await supabase.auth.signOut().catch(() => {});
  revalidatePath("/");
  redirect("/signin");
}

export async function updateNameAction(_state: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireSignedIn("/account");
  const name = String(fd.get("name") ?? "").trim();

  if (!name) {
    return { ok: false, fieldErrors: { name: "Add a display name." } };
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
