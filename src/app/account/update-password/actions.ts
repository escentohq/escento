"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSignedIn } from "@/lib/auth-guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface UpdatePasswordState {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function updatePasswordAction(
  _state: UpdatePasswordState,
  fd: FormData,
): Promise<UpdatePasswordState> {
  await requireSignedIn("/account/update-password");

  const password = String(fd.get("password") ?? "").trim();
  const confirm = String(fd.get("confirm") ?? "").trim();

  if (!password) {
    return { ok: false, fieldErrors: { password: "Password is required." } };
  }

  if (password.length < 8) {
    return { ok: false, fieldErrors: { password: "Password must be at least 8 characters." } };
  }

  if (password !== confirm) {
    return {
      ok: false,
      fieldErrors: { confirm: "Passwords do not match." },
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error("Password update error:", error.message, error.status, error);
      return { ok: false, message: `Failed: ${error.message}` };
    }

    revalidatePath("/account");
    redirect("/account");
  } catch (err) {
    // Re-throw Next.js redirect errors
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Password update exception:", errorMsg, err);
    return { ok: false, message: `Error: ${errorMsg}` };
  }
}
