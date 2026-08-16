"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireSignedIn } from "@/lib/auth-guards";
import {
  fieldError,
  formLevelMessage,
  type FieldErrors,
} from "@/lib/form-utils";
import { validatePassword } from "@/lib/password";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UpdatePasswordState = {
  ok: boolean;
  message?: string;
  fieldErrors?: FieldErrors;
};

export async function updatePasswordAction(
  _state: UpdatePasswordState,
  fd: FormData,
): Promise<UpdatePasswordState> {
  await requireSignedIn("/account/update-password");

  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");
  const fieldErrors: FieldErrors = {};

  if (!password) fieldError(fieldErrors, "password", "Choose a password.");
  const passwordError = validatePassword(password);
  if (password && passwordError) fieldError(fieldErrors, "password", passwordError);
  if (password !== confirm) {
    fieldError(fieldErrors, "confirm", "Passwords need to match.");
  }

  if (Object.keys(fieldErrors).length) {
    return {
      ok: false,
      fieldErrors,
      message: formLevelMessage(fieldErrors, "Fix the highlighted fields."),
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error("Password update error:", error.message);
      return { ok: false, message: "We couldn't update your password. Try again." };
    }

    revalidatePath("/account");
    redirect("/account");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    console.error("Password update exception:", err);
    return { ok: false, message: "We couldn't update your password. Try again." };
  }
}
