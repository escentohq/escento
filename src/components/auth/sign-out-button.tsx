"use client";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  className?: string;
};

export function SignOutButton({ className }: Props) {
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } finally {
      window.location.assign("/");
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => void handleSignOut()}
      className={className}
      aria-label="Sign out"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
