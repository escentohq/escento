export type NavigationState = {
  signedIn: boolean;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: string | null;
  musicianProfilePath?: "/profile/create" | "/profile/edit" | null;
  isCreator?: boolean;
  unreadConversationCount?: number;
};

let navigationRequest: Promise<NavigationState> | null = null;

export const NAVIGATION_REFRESH_EVENT = "escento:navigation-refresh";

const CACHE_KEY = "escento:navigation-state";

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

export function loadNavigationState(force = false) {
  if (force) navigationRequest = null;
  if (!navigationRequest) {
    navigationRequest = fetch("/api/navigation", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Navigation identity unavailable");
        const state = (await response.json()) as NavigationState;
        writeCachedNavigationState(state);
        return state;
      })
      .catch(() => ({ signedIn: false }));
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
