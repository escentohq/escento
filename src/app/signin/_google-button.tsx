"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M23.52 12.273c0-.851-.076-1.67-.218-2.455H12v4.642h6.458a5.52 5.52 0 0 1-2.394 3.622v3.01h3.878c2.27-2.09 3.578-5.17 3.578-8.819Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.956-1.075 7.942-2.908l-3.878-3.01c-1.075.72-2.45 1.146-4.064 1.146-3.125 0-5.77-2.11-6.714-4.946H1.276v3.108A11.995 11.995 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.286 14.282A7.213 7.213 0 0 1 4.91 12c0-.79.136-1.558.376-2.282V6.61H1.276A11.995 11.995 0 0 0 0 12c0 1.936.464 3.768 1.276 5.39l4.01-3.108Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.773c1.762 0 3.344.606 4.59 1.795l3.44-3.44C17.952 1.19 15.236 0 12 0A11.995 11.995 0 0 0 1.276 6.61l4.01 3.108C6.23 6.882 8.875 4.773 12 4.773Z"
      />
    </svg>
  );
}

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
        <span className="flex items-center gap-3">
          <GoogleLogo className="h-[18px] w-[18px] shrink-0" />
          {pending ? "Redirecting…" : label}
        </span>
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          aria-hidden
        />
      </button>
    </div>
  );
}
