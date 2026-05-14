import Link from "next/link";
import { redirect } from "next/navigation";

import { GoogleButton } from "./_google-button";
import { SignInForm } from "./_signin-form";
import { getCurrentSession } from "@/lib/auth-guards";

function safeCallbackUrl(callbackUrl?: string) {
  if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/";
  }
  return callbackUrl;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await getCurrentSession();
  if (session?.user?.id) redirect("/account");

  const { callbackUrl, error } = await searchParams;
  const base = safeCallbackUrl(callbackUrl);
  const signupHref = `/signup?callbackUrl=${encodeURIComponent(base)}`;
  const authError = error === "auth";

  return (
    <div className="bg-[#FAFAFA] px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto w-full max-w-md">
        <header className="mb-8">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
            Soundcheck
          </span>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#0F172A]">
            Sign in
          </h1>
          <p className="mt-3 text-base font-medium leading-relaxed text-[#475569]">
            Use your email and password, or continue with Google.
          </p>
        </header>

        <div className="relative overflow-hidden rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm sm:p-8">
          <div
            className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-linear-to-br from-[#0055FF]/5 to-transparent"
            aria-hidden
          />
          <div className="relative z-10 space-y-6">
            {authError ? (
              <div className="rounded-2xl border border-[#FF3366]/20 bg-[#FF3366]/10 px-4 py-3 text-sm font-bold text-[#B42318]">
                Something went wrong finishing sign-in. Try again.
              </div>
            ) : null}
            <SignInForm callbackUrl={base} />

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-[#F1F5F9]" />
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
                Or
              </span>
              <div className="h-px flex-1 bg-[#F1F5F9]" />
            </div>

            <GoogleButton callbackUrl={base} />
          </div>
        </div>

        <p className="mt-6 text-center text-sm font-bold text-[#475569]">
          New here?{" "}
          <Link
            href={signupHref}
            className="cursor-pointer text-[#0055FF] transition-colors hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
