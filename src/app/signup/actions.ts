"use server";

import { redirect } from "next/navigation";

import {
  fieldError,
  formLevelMessage,
  isValidEmail,
  type FieldErrors,
} from "@/lib/form-utils";
import { validatePassword } from "@/lib/password";
import { sendWelcomeMessageFromEscentoBestEffort } from "@/lib/api/support-account";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SignUpValidationResult = {
  ok: boolean;
  message?: string;
  fieldErrors?: FieldErrors;
};

/** Validates sign-up fields before Supabase `signUp` runs on the client. */
export async function validateSignUp(
  formData: FormData,
): Promise<SignUpValidationResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const termsAccepted = formData.get("termsAccepted") === "on";

  const fieldErrors: FieldErrors = {};
  if (!email) fieldError(fieldErrors, "email", "Enter your email address.");
  if (email && !isValidEmail(email)) {
    fieldError(fieldErrors, "email", "Enter a valid email address.");
  }

  const passwordError = validatePassword(password);
  if (!password) fieldError(fieldErrors, "password", "Choose a password.");
  if (password && passwordError) fieldError(fieldErrors, "password", passwordError);
  if (password !== confirmPassword) {
    fieldError(fieldErrors, "confirmPassword", "Passwords need to match.");
  }
  if (!termsAccepted) {
    fieldError(fieldErrors, "termsAccepted", "Agree to the terms, privacy policy, and compliance policy to continue.");
  }

  if (Object.keys(fieldErrors).length) {
    return {
      ok: false,
      message: formLevelMessage(fieldErrors, "Tighten the account details."),
      fieldErrors,
    };
  }

  return { ok: true };
}

export async function signUpWithPasswordAction(
  _state: SignUpValidationResult,
  fd: FormData,
  callbackUrl: string,
): Promise<SignUpValidationResult> {
  const validated = await validateSignUp(fd);
  if (!validated.ok) {
    return validated;
  }

  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const name = String(fd.get("name") ?? "").trim();

  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const next = callbackUrl.startsWith("/") ? callbackUrl : "/onboarding/role";

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        data: {
          full_name: name || undefined,
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        return {
          ok: false,
          fieldErrors: {
            email: "An account already exists for this email. Sign in instead.",
          },
        };
      }
      if (error.message.includes("429") || error.message.toLowerCase().includes("rate limit")) {
        return {
          ok: false,
          message: "Too many signup attempts. Wait a few minutes and try again.",
        };
      }
      return {
        ok: false,
        message: "Something went wrong. Try again.",
      };
    }

    if (data.session && data.user) {
      await sendWelcomeMessageFromEscentoBestEffort({
        userId: data.user.id,
        email: data.user.email ?? email,
        name: name || null,
      });
      redirect(next);
    }

    return {
      ok: false,
      message:
        "Check your email to confirm your account, then sign in to continue.",
    };
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    console.error("Sign up error:", err);
    return { ok: false, message: "Something went wrong. Try again." };
  }
}
