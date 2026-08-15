/**
 * The single classification of every page route in the app.
 *
 * Two consumers read this file, and that is the point:
 *
 *  - `tests/unit/route-inventory.test.ts` enumerates `src/app/**​/page.tsx` and
 *    fails if a route is missing here, listed here but deleted, or classified
 *    `protected` while its page file no longer calls an auth guard.
 *  - `e2e/smoke.spec.ts` derives its signed-out expectations from the same
 *    entries, so a classification is a claim the browser actually verifies.
 *
 * Adding `src/app/anything/page.tsx` therefore fails CI in seconds with a
 * message naming the file, instead of shipping unguarded.
 */

/** How a signed-out visitor must be treated. */
export type RouteAccess =
  | "public" // renders for anyone
  | "protected" // must redirect a signed-out visitor to /signin
  | "admin" // allowlisted operators only; 404 in production, notice in dev
  | "mixed"; // depends on session state — needs an explicit reason

export type RouteEntry = {
  /** Route pattern with dynamic segments kept as written on disk, e.g. `/gigs/[id]`. */
  pattern: string;
  access: RouteAccess;
  /**
   * Concrete URL for the signed-out smoke check. Omit for dynamic routes (no
   * stable fixture id in a read-only suite) — the unit test still covers them.
   */
  smokePath?: string;
  /** Required for `mixed` and for any route that opts out of the guard check. */
  reason?: string;
  /** Guard identifiers the page file must contain. Defaults per access level. */
  guards?: string[];
};

const DEFAULT_GUARDS: Record<RouteAccess, string[]> = {
  // requireRole/requireUser/requireSignedIn all funnel through getCurrentSession.
  protected: ["requireSignedIn", "requireUser", "requireRole"],
  admin: ["getAdminAccess", "requireAdminEmail"],
  public: [],
  mixed: [],
};

export const ROUTE_INVENTORY: RouteEntry[] = [
  // ---- Public -----------------------------------------------------------
  { pattern: "/", access: "public", smokePath: "/" },
  { pattern: "/privacy", access: "public", smokePath: "/privacy" },
  { pattern: "/terms", access: "public", smokePath: "/terms" },
  { pattern: "/compliance", access: "public", smokePath: "/compliance" },
  { pattern: "/help", access: "public", smokePath: "/help" },
  { pattern: "/forgot-password", access: "public", smokePath: "/forgot-password" },
  { pattern: "/musicians", access: "public", smokePath: "/musicians" },
  { pattern: "/gigs", access: "public", smokePath: "/gigs" },
  {
    pattern: "/musicians/[id]",
    access: "public",
    reason: "Public profile detail; no stable fixture id in the read-only suite.",
  },
  {
    pattern: "/gigs/[id]",
    access: "public",
    reason: "Public gig detail; no stable fixture id in the read-only suite.",
  },

  // ---- Session-dependent -------------------------------------------------
  {
    pattern: "/signin",
    access: "mixed",
    smokePath: "/signin",
    reason: "Renders the form signed out; redirects an already-signed-in visitor home.",
  },
  {
    pattern: "/signup",
    access: "mixed",
    smokePath: "/signup",
    reason: "Renders the form signed out; redirects an already-signed-in visitor home.",
  },
  {
    pattern: "/onboarding/role",
    access: "mixed",
    reason:
      "Middleware bounces signed-out visitors to /signin; the page itself redirects home once a role exists. Covered by a dedicated smoke case.",
  },

  // ---- Protected ---------------------------------------------------------
  { pattern: "/account", access: "protected", smokePath: "/account" },
  { pattern: "/account/update-password", access: "protected", smokePath: "/account/update-password" },
  { pattern: "/messages", access: "protected", smokePath: "/messages" },
  { pattern: "/messages/blocked", access: "protected", smokePath: "/messages/blocked" },
  { pattern: "/messages/requests", access: "protected", smokePath: "/messages/requests" },
  {
    pattern: "/messages/[conversationId]",
    access: "protected",
    reason: "Dynamic; guarded by requireUser and covered by the write-flow suite.",
  },
  { pattern: "/profile/create", access: "protected", smokePath: "/profile/create" },
  { pattern: "/profile/create/identity", access: "protected", smokePath: "/profile/create/identity" },
  { pattern: "/profile/create/craft", access: "protected", smokePath: "/profile/create/craft" },
  { pattern: "/profile/create/context", access: "protected", smokePath: "/profile/create/context" },
  { pattern: "/profile/create/reach", access: "protected", smokePath: "/profile/create/reach" },
  { pattern: "/profile/edit", access: "protected", smokePath: "/profile/edit" },
  { pattern: "/gigs/create", access: "protected", smokePath: "/gigs/create" },
  { pattern: "/gigs/manage", access: "protected", smokePath: "/gigs/manage" },
  {
    pattern: "/gigs/[id]/edit",
    access: "protected",
    reason: "Dynamic; guarded by requireRole and covered by the write-flow suite.",
  },

  // ---- Admin -------------------------------------------------------------
  // Every page carries its own getAdminAccess() check. The layout gate and the
  // per-page gate are two independent mechanisms; the unit test asserts the
  // per-page one exists on all of them, because only one failing is silent.
  { pattern: "/admin", access: "admin" },
  { pattern: "/admin/users", access: "admin" },
  { pattern: "/admin/musicians", access: "admin" },
  { pattern: "/admin/musicians/[id]/edit", access: "admin" },
  { pattern: "/admin/creators", access: "admin" },
  { pattern: "/admin/gigs", access: "admin" },
  { pattern: "/admin/gigs/[id]/edit", access: "admin" },
  { pattern: "/admin/reports", access: "admin" },
  { pattern: "/admin/support", access: "admin" },
  { pattern: "/admin/taxonomy", access: "admin" },
];

export function guardsFor(entry: RouteEntry): string[] {
  return entry.guards ?? DEFAULT_GUARDS[entry.access];
}

/** Concrete public paths a signed-out visitor must be able to load. */
export const PUBLIC_PATHS = ROUTE_INVENTORY.filter(
  (entry) => entry.access === "public" && entry.smokePath && entry.smokePath !== "/",
).map((entry) => entry.smokePath as string);

/** Concrete protected paths that must bounce a signed-out visitor to /signin. */
export const PROTECTED_PATHS = ROUTE_INVENTORY.filter(
  (entry) => entry.access === "protected" && entry.smokePath,
).map((entry) => entry.smokePath as string);

/** Session-dependent paths that must still render for a signed-out visitor. */
export const MIXED_PATHS = ROUTE_INVENTORY.filter(
  (entry) => entry.access === "mixed" && entry.smokePath,
).map((entry) => entry.smokePath as string);

/**
 * `route.ts` handlers allowed to exist. Rule #2 in AGENTS.md makes server
 * actions the mutation path, so a new REST route is a deliberate exception and
 * has to be added here (and to the matching ESLint rule) on purpose.
 */
export const ALLOWED_ROUTE_HANDLERS = [
  "src/app/auth/callback/route.ts",
  "src/app/api/navigation/route.ts",
  "src/app/api/messaging/context/route.ts",
];
