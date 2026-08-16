import type { AppRole } from "@/lib/onboarding-role";

export type NavigationState = {
  signedIn: boolean;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  /** The immutable first claim. Display only; branch on `capabilities`. */
  role?: string | null;
  capabilities?: AppRole[];
  activeView?: AppRole | null;
  musicianProfilePath?: string | null;
  musicianProfileLabel?: "Create profile" | "Continue setup" | "Edit profile" | null;
  musicianProfileMode?: "create" | "resume" | "edit" | null;
  isCreator?: boolean;
  unreadConversationCount?: number;
};

let navigationRequest: Promise<NavigationState | null> | null = null;

export const NAVIGATION_REFRESH_EVENT = "escento:navigation-refresh";

// Bumped for the capability fields (issue #6): readCachedNavigationState only
// validates `signedIn`, so a blob written by the previous version would be
// accepted while missing `capabilities` and `activeView`.
const CACHE_KEY = "escento:navigation-state:v2";

/**
 * Last known identity, kept per-tab so a full page load can paint the signed-in nav
 * immediately instead of flashing the signed-out shell while /api/navigation resolves.
 * Cleared on sign-out via refreshNavigationState().
 */
export function readCachedNavigationState(): NavigationState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NavigationState;
    return parsed && typeof parsed.signedIn === "boolean" ? parsed : null;
  } catch {
    return null;
  }
}

function writeCachedNavigationState(state: NavigationState) {
  if (typeof window === "undefined") return;
  try {
    if (state.signedIn) {
      window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(state));
    } else {
      window.sessionStorage.removeItem(CACHE_KEY);
    }
  } catch {
    // Private mode or a full quota — the network fetch still works.
  }
}

/**
 * Resolves the current identity, or `null` when the request itself failed.
 *
 * The distinction matters: a failed fetch used to resolve as `{ signedIn: false }`
 * and then stay memoized, so one transient error left the header showing "Sign in"
 * to a signed-in user for the rest of the page's life. A failure now clears the
 * memo so the next call retries, and reports "unknown" so callers can keep
 * whatever they already knew instead of downgrading to signed-out.
 */
export function loadNavigationState(force = false): Promise<NavigationState | null> {
  if (force) navigationRequest = null;
  if (!navigationRequest) {
    navigationRequest = fetch("/api/navigation", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Navigation identity unavailable");
        const state = (await response.json()) as NavigationState;
        writeCachedNavigationState(state);
        return state;
      })
      .catch(() => {
        navigationRequest = null;
        return null;
      });
  }

  return navigationRequest;
}

export function refreshNavigationState() {
  navigationRequest = null;
  try {
    window.sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Nothing cached to clear.
  }
  window.dispatchEvent(new Event(NAVIGATION_REFRESH_EVENT));
}
