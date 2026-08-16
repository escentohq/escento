import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { GoogleButton } from "./_google-button";
import { SignInForm } from "./_signin-form";
import { getCurrentSession } from "@/lib/auth-guards";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Escento with Google or email.",
};

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
    <div className="bg-paper px-4 py-12 sm:px-6 md:py-20 lg:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(22rem,1fr)] lg:gap-20">
        <header>
          <h1 className="text-page-title text-ink">
            Sign in
          </h1>
          <p className="mt-4 max-w-md text-body text-muted">
            Use Google or sign in with your email and password.
          </p>
        </header>

        <div className="border-y border-rule py-6 sm:py-8">
          <div className="space-y-6">
            {authError ? (
              <div className="border-l-4 border-coral px-4 py-3 text-secondary font-semibold text-[#B42318]">
                {"We couldn't finish signing you in. Try again."}
              </div>
            ) : null}
            <GoogleButton callbackUrl={base} />
            <p className="px-2 text-center text-xs font-medium leading-relaxed text-[#64748B]">
              By signing in, you agree to Escento&apos;s{" "}
              <Link href="/terms" className="font-bold text-[#0055FF] underline-offset-4 hover:underline">
                Terms
              </Link>
              ,{" "}
              <Link href="/privacy" className="font-bold text-[#0055FF] underline-offset-4 hover:underline">
                Privacy Policy
              </Link>
              , and{" "}
              <Link href="/compliance" className="font-bold text-[#0055FF] underline-offset-4 hover:underline">
                Acceptable Use
              </Link>
              .
            </p>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-[#F1F5F9]" />
              <span className="text-meta uppercase text-muted">
                Or use email
              </span>
              <div className="h-px flex-1 bg-[#F1F5F9]" />
            </div>

            <SignInForm callbackUrl={base} />
          </div>
        </div>

        <div className="lg:col-start-2">
        <p className="mt-6 text-secondary text-muted">
          New here?{" "}
          <Link
            href={signupHref}
            className="cursor-pointer text-[#0055FF] transition-colors hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
          >
            Create an account
          </Link>
        </p>

        <p className="mt-3 text-secondary text-muted">
          Forgot your password?{" "}
          <Link
            href="/forgot-password"
            className="cursor-pointer text-[#0055FF] transition-colors hover:text-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
          >
            Reset it
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
