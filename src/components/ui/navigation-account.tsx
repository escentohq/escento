"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

import { NAVIGATION_REFRESH_EVENT, loadNavigationState, readCachedNavigationState, type NavigationState } from "@/lib/navigation-state";

// Radix's dropdown primitive is the single largest chunk in the shared shell, and only
// signed-in visitors ever render it. Loading it on demand keeps it out of first load on
// every public page.
const UserMenu = dynamic(() => import("./_user-menu").then((mod) => mod.UserMenu));

export function NavigationAccount() {
  // Starts null so the client render matches the prerendered signed-out shell; the
  // sessionStorage seed is applied in the effect below, before the network settles.
  const [state, setState] = useState<NavigationState | null>(null);

  useEffect(() => {
    let active = true;
    const apply = (next: NavigationState | null) => {
      if (active && next) setState(next);
    };
    const load = () => {
      // Paint the last known identity first, then reconcile with the server. On a
      // refresh event the cache has already been cleared, so this resolves null and
      // only the network result applies — a sign-out can never be re-seeded stale.
      void Promise.resolve(readCachedNavigationState()).then(apply);
      void loadNavigationState(true).then(apply);
    };
    load();
    window.addEventListener(NAVIGATION_REFRESH_EVENT, load);
    return () => {
      active = false;
      window.removeEventListener(NAVIGATION_REFRESH_EVENT, load);
    };
  }, []);

  if (state?.signedIn) {
    return (
      <div className="flex min-w-[9rem] justify-end sm:min-w-[12.5rem]">
      <UserMenu
        email={state.email}
        name={state.name}
        image={state.image}
        role={state.role}
        musicianProfilePath={state.musicianProfilePath}
        isCreator={state.isCreator}
        unreadConversationCount={state.unreadConversationCount}
      />
      </div>
    );
  }

  return (
    <div className="flex min-w-[9rem] items-center justify-end gap-2 sm:min-w-[12.5rem] sm:gap-3">
      <Link
        href="/signin"
        prefetch={false}
        className="inline-flex min-h-11 items-center border border-ink bg-surface px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
      >
        Sign in
      </Link>
      <Link
        href="/signup"
        prefetch={false}
        className="hidden min-h-11 items-center border border-brand bg-brand px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-ink hover:bg-ink focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 sm:inline-flex"
      >
        Sign up
      </Link>
    </div>
  );
}
