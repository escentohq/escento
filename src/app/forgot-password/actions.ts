"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function resetPasswordAction(
  _state: { ok: boolean; message: string },
  fd: FormData,
) {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { ok: false, message: "Email is required." };
  }

  if (!email.includes("@")) {
    return { ok: false, message: "Please enter a valid email." };
  }

  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/account/update-password`,
    });

    if (error) {
      console.error("Password reset error:", error);
      if (error.message.includes("429") || error.message.toLowerCase().includes("rate limit")) {
        return {
          ok: true,
          message: "If an account exists with that email, you'll receive a reset link shortly. (Check spam folder too.)",
        };
      }
      // Don't leak whether email exists or not
      return {
        ok: true,
        message: "If an account exists with that email, you'll receive a reset link shortly.",
      };
    }

    return {
      ok: true,
      message: "If an account exists with that email, you'll receive a reset link shortly.",
    };
  } catch (err) {
    console.error("Password reset error:", err);
    return {
      ok: false,
      message: "Something went wrong. Please try again.",
    };
  }
}
