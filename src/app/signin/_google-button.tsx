"use client";

import { useState } from "react";

import { GoogleMark } from "@/components/ui/brand";

export function GoogleButton({
  callbackUrl,
  label = "Continue with Google",
}: {
  callbackUrl: string;
  label?: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function signInWithGoogle() {
    setMessage(null);
    setPending(true);
    try {
      // The Supabase browser SDK is ~230 KB and is only needed once the visitor commits
      // to Google sign-in, so it is fetched here rather than in the page's first load.
      const { createSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const supabase = createSupabaseBrowserClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const next = callbackUrl.startsWith("/") ? callbackUrl : "/";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) {
        setMessage(error.message);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      {message ? (
        <div className="border-l-4 border-coral px-4 py-3 text-secondary font-semibold text-[#B42318]">
          {message}
        </div>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={() => void signInWithGoogle()}
        className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-3 border border-ink bg-surface px-5 text-control text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleMark className="h-5 w-5 shrink-0" />
        {pending ? "Redirecting…" : label}
      </button>
    </div>
  );
}
