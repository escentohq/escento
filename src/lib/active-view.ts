import { cookies } from "next/headers";
import { cache } from "react";

import { getCurrentSession } from "@/lib/auth-guards";
import { isAppRole, type AppRole } from "@/lib/onboarding-role";

/**
 * Which mode a dual-capability account is currently acting in.
 *
 * This is a **presentation preference and nothing else**. No guard reads it, and
 * `src/lib/auth-guards.ts` is forbidden by `eslint.config.mjs` from importing this
 * module, because a view that could grant access would make every guard in the app
 * bypassable by editing a cookie.
 *
 * The stored value is the actor mode (`MUSICIAN` / `CREATOR`), not the surface
 * (`musicians` / `gigs`). The switch drives the user menu and the profile prompts
 * as well as `/`, and the surface mapping is inverted anyway: a musician's default
 * surface is gigs (find work), a creator's is musicians (find talent).
 */
export const ACTIVE_VIEW_COOKIE = "escento_view";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** The marketplace surface a mode opens on. Musicians look for work, creators for players. */
export function surfaceForView(view: AppRole | null): "musicians" | "gigs" {
  return view === "MUSICIAN" ? "gigs" : "musicians";
}

/**
 * Pure so it can be tested without a request.
 *
 * The capability filter is what makes a stale or hand-edited cookie inert: a value
 * naming a capability the account does not hold is ignored rather than honored.
 */
export function resolveActiveView(
  capabilities: AppRole[],
  cookieValue: string | null | undefined,
  primaryRole: AppRole | null | undefined,
): AppRole | null {
  if (isAppRole(cookieValue) && capabilities.includes(cookieValue)) return cookieValue;
  if (primaryRole && capabilities.includes(primaryRole)) return primaryRole;
  return capabilities[0] ?? null;
}

/** Request-scoped, so a page and its children resolve the view once. */
export const getActiveView = cache(async (): Promise<AppRole | null> => {
  const [session, cookieStore] = await Promise.all([getCurrentSession(), cookies()]);
  if (!session) return null;

  return resolveActiveView(
    session.user.capabilities,
    cookieStore.get(ACTIVE_VIEW_COOKIE)?.value,
    session.user.role,
  );
});

/**
 * Only callable from a Server Action or route handler — Server Components cannot
 * write cookies.
 */
export async function writeActiveViewCookie(view: AppRole): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_VIEW_COOKIE, view, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
}

/** Sign-out must drop it, or the next account on a shared browser inherits the view. */
export async function clearActiveViewCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_VIEW_COOKIE);
}
