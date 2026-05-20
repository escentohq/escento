"use server";

import { redirect } from "next/navigation";
import { validatePassword } from "@/lib/password";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SignUpValidationResult = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Validates sign-up fields before Supabase `signUp` runs on the client. */
export async function validateSignUp(
  formData: FormData,
): Promise<SignUpValidationResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!email) fieldErrors.email = "Add your email.";
  if (email && !isValidEmail(email)) {
    fieldErrors.email = "Use a valid email address.";
  }

  const passwordError = validatePassword(password);
  if (!password) fieldErrors.password = "Create a password.";
  if (password && passwordError) fieldErrors.password = passwordError;
  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords need to match.";
  }

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "Tighten the account details.", fieldErrors };
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
        message: error.message,
      };
    }

    if (data.session) {
      redirect(next);
    }

    return {
      ok: false,
      message:
        "Check your email to confirm your account, then sign in to continue.",
    };
  } catch (err) {
    // Re-throw Next.js redirect errors
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Sign up error:", errorMsg);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}