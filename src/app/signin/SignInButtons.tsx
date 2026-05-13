"use client";

import { signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";

type Props = { callbackUrl: string };

export function SignInButtons({ callbackUrl }: Props) {
  return (
    <div className="mt-8 flex flex-col gap-3">
      <button
        type="button"
        onClick={() => signIn("github", { callbackUrl })}
        className="group relative flex min-h-14 w-full cursor-pointer items-center justify-between overflow-hidden rounded-2xl bg-[#0F172A] px-6 text-sm font-bold tracking-wide text-white transition-all hover:scale-[1.01] hover:shadow-[0_0_30px_-8px_#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
      >
        <span className="relative z-10">Sign in with GitHub</span>
        <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        <div className="absolute inset-0 bg-linear-to-r from-[#0055FF]/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </button>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="group flex min-h-14 w-full cursor-pointer items-center justify-between rounded-2xl border-2 border-[#E2E8F0] bg-white px-6 text-sm font-bold tracking-wide text-[#0F172A] transition-all hover:border-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
      >
        <span>Sign in with Google</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
      </button>
    </div>
  );
}
