"use client";

import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";

export function GoogleButton({
  callbackUrl,
  label = "Continue with Google",
}: {
  callbackUrl: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl })}
      className="group flex min-h-14 w-full cursor-pointer items-center justify-between rounded-2xl border-2 border-[#E2E8F0] bg-white px-6 text-sm font-bold tracking-wide text-[#0F172A] transition-all hover:border-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
    >
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
    </button>
  );
}

