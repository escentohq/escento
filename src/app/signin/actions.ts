"use server";

import { redirect } from "next/navigation";

import {
  countFieldErrors,
  fieldError,
  formLevelMessage,
  isValidEmail,
  type FieldErrors,
} from "@/lib/form-utils";
import { sendWelcomeMessageFromEscentoBestEffort } from "@/lib/api/support-account";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SignInState = {
  ok: boolean;
  message?: string;
  fieldErrors?: FieldErrors;
};

export async function signInWithPasswordAction(
  _state: SignInState,
  fd: FormData,
  callbackUrl: string,
): Promise<SignInState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const fieldErrors: FieldErrors = {};

  if (!email) fieldError(fieldErrors, "email", "Enter your email address.");
  if (email && !isValidEmail(email)) fieldError(fieldErrors, "email", "Enter a valid email address.");
  if (!password) fieldError(fieldErrors, "password", "Enter your password.");

  if (Object.keys(fieldErrors).length) {
    return {
      ok: false,
      fieldErrors,
      message: formLevelMessage(fieldErrors, "Enter your email and password."),
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const message =
        error.message.toLowerCase().includes("invalid login")
          ? "That email or password isn't right."
          : "We couldn't sign you in. Try again.";
      return { ok: false, message };
    }

    if (data.user) {
      await sendWelcomeMessageFromEscentoBestEffort({
        userId: data.user.id,
        email: data.user.email ?? email,
        name:
          typeof data.user.user_metadata?.full_name === "string"
            ? data.user.user_metadata.full_name
            : typeof data.user.user_metadata?.name === "string"
              ? data.user.user_metadata.name
              : null,
      });
    }

    redirect(callbackUrl);
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    console.error("Sign in error:", err);
    return { ok: false, message: "We couldn't sign you in. Try again." };
  }
}
