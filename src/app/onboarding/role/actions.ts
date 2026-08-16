"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSignedIn } from "@/lib/auth-guards";
import { isAppRole, roleDestination, type AppRole } from "@/lib/onboarding-role";
import { ACCOUNT_NAME_PATH, hasPublicName } from "@/lib/public-name";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

const UNIQUE_VIOLATION = "23505";

/**
 * Claim a role for an account that does not have one yet, and report the role
 * that is actually durable afterwards.
 *
 * The write is a compare-and-set (`.is("role", null)`): it can only ever turn a
 * NULL role into a real one, so a direct call from an account that already has
 * a role changes nothing and simply reads the existing value back. A database
 * trigger (20260816000000) enforces the same invariant for callers that bypass
 * this action entirely.
 */
async function claimRole(
  supabase: SupabaseServerClient,
  userId: string,
  email: string | null,
  requested: AppRole,
): Promise<AppRole> {
  // Two passes: one for the ordinary path, one for the narrow race where the
  // signup trigger's row appears between our update and our insert.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data: claimed, error: claimError } = await supabase
      .from("app_user")
      .update({ role: requested })
      .eq("id", userId)
      .is("role", null)
      .select("role")
      .maybeSingle();

    if (claimError) throw claimError;
    if (isAppRole(claimed?.role)) return claimed.role;

    // Nothing was claimed: either the row already carries a role, or the row
    // does not exist yet (the auth trigger creates it, so this is rare).
    const { data: existing, error: readError } = await supabase
      .from("app_user")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (readError) throw readError;
    if (existing) {
      if (isAppRole(existing.role)) return existing.role;
      continue; // Row exists with a NULL role — retry the compare-and-set.
    }

    const { error: insertError } = await supabase
      .from("app_user")
      .insert({ id: userId, email, role: requested });

    if (!insertError) return requested;
    // A concurrent insert won; loop once more and read its result.
    if (insertError.code !== UNIQUE_VIOLATION) throw insertError;
  }

  throw new Error("Could not assign a role. Please try again.");
}

export async function setRole(role: "MUSICIAN" | "CREATOR"): Promise<void> {
  const session = await requireSignedIn("/onboarding/role");
  if (!isAppRole(role)) throw new Error(`Unsupported role: ${String(role)}`);

  const supabase = await createSupabaseServerClient();
  const effectiveRole = await claimRole(supabase, session.user.id, session.user.email, role);

  revalidatePath("/onboarding/role");
  revalidatePath("/");
  // Always the role the account actually has, never the one that was asked for.
  // OAuth accounts can arrive with no provider name; send those creators to
  // Account before they can publish, instead of onto an empty manage page.
  if (effectiveRole === "CREATOR") {
    const { data: row } = await supabase
      .from("app_user")
      .select("name")
      .eq("id", session.user.id)
      .maybeSingle();
    if (!hasPublicName(row?.name ?? session.user.name)) {
      redirect(ACCOUNT_NAME_PATH);
    }
  }
  redirect(roleDestination(effectiveRole));
}
