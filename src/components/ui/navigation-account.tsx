"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { NAVIGATION_REFRESH_EVENT, loadNavigationState, type NavigationState } from "@/lib/navigation-state";
import { UserMenu } from "./_user-menu";

export function NavigationAccount() {
  const [state, setState] = useState<NavigationState | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    const load = (force = false) => void loadNavigationState(force).then((next) => {
      if (active) setState(next);
    });
    load(true);
    const refresh = () => load(true);
    window.addEventListener(NAVIGATION_REFRESH_EVENT, refresh);
    return () => {
      active = false;
      window.removeEventListener(NAVIGATION_REFRESH_EVENT, refresh);
    };
  }, [pathname]);

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
        className="inline-flex min-h-11 items-center border border-ink bg-surface px-4 py-2 text-xs font-semibold text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
      >
        Sign in
      </Link>
      <Link
        href="/signup"
        className="hidden min-h-11 items-center border border-brand bg-brand px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-ink hover:bg-ink focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 sm:inline-flex"
      >
        Sign up
      </Link>
    </div>
  );
}
