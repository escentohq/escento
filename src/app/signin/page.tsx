import Link from "next/link";

import { SignInButtons } from "./SignInButtons";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const base =
    typeof callbackUrl === "string" && callbackUrl.length > 0 ? callbackUrl : "/";

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
            Choose a provider. Pick your role after the first sign-in.
          </p>
        </header>

        <div className="relative overflow-hidden rounded-3xl border border-[#F1F5F9] bg-white p-8 shadow-sm">
          <div
            className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-linear-to-br from-[#0055FF]/5 to-transparent"
            aria-hidden
          />
          <div className="relative z-10">
            <p className="text-sm font-bold text-[#64748B]">
              No password. GitHub or Google — one click.
            </p>
            <SignInButtons callbackUrl={base} />
          </div>
        </div>

        <p className="mt-6 text-center text-sm font-bold text-[#475569]">
          <Link
            href="/"
            className="cursor-pointer transition-colors hover:text-[#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
          >
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
