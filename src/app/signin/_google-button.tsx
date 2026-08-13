"use client";

import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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
        className="flex min-h-12 w-full cursor-pointer items-center justify-center border border-ink bg-surface px-5 text-control text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Redirecting…" : label}
      </button>
    </div>
  );
}
