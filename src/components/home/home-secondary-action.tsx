"use client";

import { useEffect, useState } from "react";

import { SecondaryCta } from "@/components/ui/secondary-cta";
import { loadNavigationState, type NavigationState } from "@/lib/navigation-state";

export function HomeSecondaryAction() {
  const [state, setState] = useState<NavigationState | null>(null);

  useEffect(() => {
    let active = true;
    void loadNavigationState().then((next) => {
      if (active) setState(next);
    });
    return () => { active = false; };
  }, []);

  const href = state?.role === "CREATOR"
    ? "/gigs/create"
    : state?.musicianProfilePath ?? "/signin";
  const label = state?.role === "CREATOR"
    ? "Post a Gig"
    : state?.musicianProfilePath === "/profile/edit"
      ? "Edit Profile"
      : state?.musicianProfilePath === "/profile/create"
        ? "Create Profile"
        : "Sign In";

  return <SecondaryCta href={href} prefetch={false} className="w-full sm:w-auto">{label}</SecondaryCta>;
}
