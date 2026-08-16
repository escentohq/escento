"use server";

import {
  fieldError,
  formLevelMessage,
  isValidEmail,
  type FieldErrors,
} from "@/lib/form-utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ResetPasswordState = {
  ok: boolean;
  message?: string;
  fieldErrors?: FieldErrors;
};

export async function resetPasswordAction(
  _state: ResetPasswordState,
  fd: FormData,
): Promise<ResetPasswordState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const fieldErrors: FieldErrors = {};

  if (!email) fieldError(fieldErrors, "email", "Enter your email address.");
  if (email && !isValidEmail(email)) {
    fieldError(fieldErrors, "email", "Enter a valid email address.");
  }

  if (Object.keys(fieldErrors).length) {
    return {
      ok: false,
      fieldErrors,
      message: formLevelMessage(fieldErrors, "Enter your email address."),
    };
  }

  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/account/update-password`,
    });

    if (error) {
      console.error("Password reset error:", error);
    }

    return {
      ok: true,
      message:
        "If an account exists with that email, you'll receive a reset link shortly.",
    };
  } catch (err) {
    console.error("Password reset error:", err);
    return {
      ok: false,
      message: "We couldn't send a reset link. Try again.",
    };
  }
}
