"use server";

import { requireSignedIn } from "@/lib/auth-guards";
import { getUserById, updateUser, deleteUser } from "@/lib/api/users";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { strOrEmpty } from "@/lib/form-utils";
import type { ActionState } from "@/lib/form-utils";

export async function updateNameAction(
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const session = await requireSignedIn("/account");
  const name = strOrEmpty(fd.get("name"));

  if (!name) {
    return { ok: false, fieldErrors: { name: "Name is required." } };
  }

  if (name.length > 80) {
    return { ok: false, fieldErrors: { name: "Name must be 80 characters or fewer." } };
  }

  await updateUser(session.user.id, { name });
  revalidatePath("/account");
  revalidatePath("/");

  return { ok: true, message: "Name updated." };
}

export async function deleteAccountAction(): Promise<void> {
  const session = await requireSignedIn("/account");
  const user = await getUserById(session.user.id);
  if (!user?.supabaseUserId) {
    throw new Error("Authenticated user is missing a Supabase auth id.");
  }

  // 1. Delete app user first (cascades to profiles, gigs, junctions)
  await deleteUser(user.id);

  // 2. Delete auth user second
  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.supabaseUserId, false);
  if (error) throw error;

  // 3. Sign out
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  redirect("/");
}
