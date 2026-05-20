"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface SignInState {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function signInWithPasswordAction(
  _state: SignInState,
  fd: FormData,
  callbackUrl: string,
): Promise<SignInState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Enter your email and password." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const message =
        error.message.toLowerCase().includes("invalid login")
          ? "That email or password is not right."
          : error.message;
      return { ok: false, message };
    }

    redirect(callbackUrl);
  } catch (err) {
    // Re-throw Next.js redirect errors
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Sign in error:", errorMsg);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}
