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

export function loadNavigationState(force = false) {
  if (force) navigationRequest = null;
  if (!navigationRequest) {
    navigationRequest = fetch("/api/navigation", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Navigation identity unavailable");
        return response.json() as Promise<NavigationState>;
      })
      .catch(() => ({ signedIn: false }));
  }

  return navigationRequest;
}

export function refreshNavigationState() {
  navigationRequest = null;
  window.dispatchEvent(new Event(NAVIGATION_REFRESH_EVENT));
}
