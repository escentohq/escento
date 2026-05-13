"use server";

import { requireSignedIn } from "@/lib/auth-guards";
import { updateUser, deleteUser } from "@/lib/api/users";
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
  await deleteUser(session.user.id);

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  redirect("/");
}
