"use server";

import { validatePassword } from "@/lib/password";

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
