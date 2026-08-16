"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { writeActiveViewCookie } from "@/lib/active-view";
import { requireSignedIn, requireUser } from "@/lib/auth-guards";
import { safeInternalPath } from "@/lib/internal-path";
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

/**
 * OAuth accounts can arrive with no provider name, and creators have no profile
 * page to carry one. Returns the path to send them to first, or null.
 */
async function creatorNameGate(
  supabase: SupabaseServerClient,
  userId: string,
  sessionName: string | null | undefined,
): Promise<string | null> {
  const { data: row } = await supabase
    .from("app_user")
    .select("name")
    .eq("id", userId)
    .maybeSingle();

  return hasPublicName(row?.name ?? sessionName) ? null : ACCOUNT_NAME_PATH;
}

export async function setRole(role: AppRole): Promise<void> {
  const session = await requireSignedIn("/onboarding/role");
  if (!isAppRole(role)) throw new Error(`Unsupported role: ${String(role)}`);

  const supabase = await createSupabaseServerClient();
  // Unchanged compare-and-set. It still writes only `role`; the database trigger
  // (20260816050844) sets the matching capability from it.
  const effectiveRole = await claimRole(supabase, session.user.id, session.user.email, role);

  // Always the role the account actually has, never the one that was asked for.
  await writeActiveViewCookie(effectiveRole);
  revalidatePath("/onboarding/role");
  revalidatePath("/", "layout");

  if (effectiveRole === "CREATOR") {
    const gate = await creatorNameGate(supabase, session.user.id, session.user.name);
    if (gate) redirect(gate);
  }
  redirect(roleDestination(effectiveRole));
}

/**
 * Add a second capability to an account that already has one (issue #6).
 *
 * Separate from `setRole` because the two do different things: `setRole` claims
 * the immutable first `role`, this one only ever flips a capability boolean. The
 * write is idempotent and additive — the trigger rejects any attempt to turn a
 * capability back off, including from the service role — so this is safe to call
 * twice and impossible to use as a downgrade.
 */
export async function grantCapability(role: AppRole, next?: string): Promise<void> {
  const session = await requireUser("/onboarding/role");
  if (!isAppRole(role)) throw new Error(`Unsupported capability: ${String(role)}`);

  const supabase = await createSupabaseServerClient();

  if (!session.user.capabilities.includes(role)) {
    // Same publish precondition a first-time creator gets. Checked before the
    // write so an account cannot end up creator-capable with no public name.
    if (role === "CREATOR") {
      const gate = await creatorNameGate(supabase, session.user.id, session.user.name);
      if (gate) redirect(gate);
    }

    const column = role === "MUSICIAN" ? "is_musician" : "is_creator";
    const { error } = await supabase
      .from("app_user")
      .update({ [column]: true })
      .eq("id", session.user.id);

    if (error) throw error;
  }

  await writeActiveViewCookie(role);
  revalidatePath("/onboarding/role");
  revalidatePath("/", "layout");
  redirect(safeInternalPath(next, roleDestination(role)));
}
