"use client";

import { ArrowRight } from "lucide-react";
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
        <div className="rounded-2xl border border-[#FF3366]/20 bg-[#FF3366]/10 px-4 py-3 text-sm font-bold text-[#B42318]">
          {message}
        </div>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={() => void signInWithGoogle()}
        className="group flex min-h-14 w-full cursor-pointer items-center justify-between rounded-2xl border-2 border-[#E2E8F0] bg-white px-6 text-sm font-bold tracking-wide text-[#0F172A] transition-all hover:border-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{pending ? "Redirecting…" : label}</span>
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          aria-hidden
        />
      </button>
    </div>
  );
}
