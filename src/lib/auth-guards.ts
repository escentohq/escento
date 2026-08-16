import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type AppRole } from "@/lib/onboarding-role";

export type AppSession = {
  user: {
    id: string;
    email: string | null;
    name?: string | null;
    /**
     * The first capability this account claimed, immutable once set. Use it for a
     * one-word label or to tell that onboarding has not happened yet. **Never
     * authorize on it** — an account may hold both capabilities. Use
     * `capabilities` for that.
     */
    role?: AppRole | null;
    /** Authorization truth. Empty means onboarding is incomplete. */
    capabilities: AppRole[];
    image?: string | null;
  };
};

export const getCurrentSession = cache(async (): Promise<AppSession | null> => {
  const supabase = await createSupabaseServerClient();

  // getClaims() verifies the JWT locally when the project uses asymmetric signing keys,
  // which removes a network round trip to the Auth server from every request. With
  // legacy symmetric (HS256) secrets it transparently falls back to a getUser() call, so
  // this is safe regardless of how the project is configured.
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims?.sub) return null;

  const { data: appUser, error: appUserError } = await supabase
    .from("app_user")
    .select("role, is_musician, is_creator, name, image")
    .eq("id", claims.sub)
    .single();

  // Log unexpected errors (RLS violations, timeouts, etc) but ignore expected "not found"
  if (appUserError && appUserError.code !== "PGRST116") {
    console.error("[auth] app_user query failed:", appUserError);
  }

  const capabilities: AppRole[] = [];
  if (appUser?.is_musician) capabilities.push("MUSICIAN");
  if (appUser?.is_creator) capabilities.push("CREATOR");

  return {
    user: {
      id: claims.sub,
      email: claims.email ?? null,
      name: appUser?.name ?? null,
      role: (appUser?.role as AppRole | null | undefined) ?? null,
      capabilities,
      image: appUser?.image ?? null,
    },
  };
});

export async function requireSignedIn(callbackUrl: string): Promise<AppSession> {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return session;
}

export async function requireUser(callbackUrl: string): Promise<AppSession> {
  const session = await requireSignedIn(callbackUrl);
  if (session.user.capabilities.length === 0) redirect("/onboarding/role");
  return session;
}

/**
 * Membership, not equality: an account may hold both capabilities.
 *
 * This function must never read the active-view cookie. The view is a
 * presentation preference; authorization is capability membership. If the two
 * were joined, every guard in the app would be bypassable by editing a cookie.
 * `eslint.config.mjs` forbids this file from importing `@/lib/active-view`, and
 * `tests/unit/auth-flow-invariants.test.ts` asserts the same thing in prose.
 *
 * A user who lacks the capability is sent to the onboarding screen to add it,
 * not bounced to `/`. Silently landing someone on the homepage after they
 * clicked "Post a gig" is the locked-out experience issue #6 is about.
 */
export async function requireRole(
  role: AppRole,
  callbackUrl: string,
): Promise<AppSession> {
  const session = await requireUser(callbackUrl);
  if (!session.user.capabilities.includes(role)) {
    redirect(`/onboarding/role?add=${role}&next=${encodeURIComponent(callbackUrl)}`);
  }
  return session;
}

/** Non-redirecting predicate, for surfaces that branch on what a user can do. */
export function hasCapability(session: AppSession | null | undefined, role: AppRole): boolean {
  return Boolean(session?.user.capabilities.includes(role));
}
