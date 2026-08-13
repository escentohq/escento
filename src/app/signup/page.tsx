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
            Continue with Google, or start with email and password.
          </p>
        </header>

        <div className="relative overflow-hidden  border border-[#F1F5F9] bg-white p-6 shadow-sm sm:p-8">
          <div
            className="pointer-events-none absolute right-0 top-0 h-40 w-40    "
            aria-hidden
          />
          <div className="relative z-10 space-y-6">
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
