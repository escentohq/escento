import Link from "next/link";
import { redirect } from "next/navigation";

import { GoogleButton } from "@/app/signin/_google-button";
import { getCurrentSession } from "@/lib/auth-guards";
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
  const session = await getCurrentSession();
  if (session?.user?.id) redirect("/account");

  const { callbackUrl } = await searchParams;
  const base = safeCallbackUrl(callbackUrl);
  const signinHref = `/signin?callbackUrl=${encodeURIComponent(base)}`;

  return (
    <div className="bg-paper px-4 py-12 sm:px-6 md:py-20 lg:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(22rem,1fr)] lg:gap-20">
        <header className="border-t-4 border-brand pt-6">
          <span className="text-meta uppercase text-brand">
            New account
          </span>
          <h1 className="mt-3 text-page-title text-ink">
            Create account
          </h1>
          <p className="mt-4 max-w-md text-body text-muted">
            Continue with Google, or start with email and password.
          </p>
        </header>

        <div className="border-y border-rule py-6 sm:py-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <GoogleButton callbackUrl={base} label="Sign up with Google" />
              <p className="px-2 text-center text-xs font-medium leading-relaxed text-[#64748B]">
                By signing up with Google, you agree to Escento&apos;s{" "}
                <Link href="/terms" className="font-bold text-[#0055FF] underline-offset-4 hover:underline">
                  Terms
                </Link>
                ,{" "}
                <Link href="/privacy" className="font-bold text-[#0055FF] underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>
                , and{" "}
                <Link href="/compliance" className="font-bold text-[#0055FF] underline-offset-4 hover:underline">
                  Compliance Policy
                </Link>
                .
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-[#F1F5F9]" />
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
                Or continue with email
              </span>
              <div className="h-px flex-1 bg-[#F1F5F9]" />
            </div>

            <SignUpForm callbackUrl={base} />
          </div>
        </div>

        <p className="text-secondary text-muted lg:col-start-2">
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
