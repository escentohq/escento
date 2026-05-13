import Link from "next/link";

import { GoogleButton } from "@/app/signin/_google-button";
import { SignUpForm } from "./_signup-form";

function safeCallbackUrl(callbackUrl?: string) {
  if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/onboarding/role";
  }
  return callbackUrl;
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const base = safeCallbackUrl(callbackUrl);
  const signinHref = `/signin?callbackUrl=${encodeURIComponent(base)}`;

  return (
    <div className="bg-[#FAFAFA] px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto w-full max-w-md">
        <header className="mb-8">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
            Take the stage
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#0F172A]">
            Create account
          </h1>
          <p className="mt-3 text-base font-medium leading-relaxed text-[#475569]">
            Start with email and password, or continue with Google.
          </p>
        </header>

        <div className="relative overflow-hidden rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm sm:p-8">
          <div
            className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-linear-to-br from-[#FF3366]/5 to-transparent"
            aria-hidden
          />
          <div className="relative z-10 space-y-6">
            <SignUpForm callbackUrl={base} />

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-[#F1F5F9]" />
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
                Or
              </span>
              <div className="h-px flex-1 bg-[#F1F5F9]" />
            </div>

            <GoogleButton callbackUrl={base} label="Sign up with Google" />
          </div>
        </div>

        <p className="mt-6 text-center text-sm font-bold text-[#475569]">
          Already have an account?{" "}
          <Link
            href={signinHref}
            className="cursor-pointer text-[#0055FF] transition-colors hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

