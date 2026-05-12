import Link from "next/link";

import { PageShell } from "@/components/ui/page-shell";
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
    <PageShell
      eyebrow="Soundcheck"
      title="Sign in"
      body="Choose a provider. You will pick musician or creator after the first sign-in."
      size="narrow"
    >
      <div className="rounded-3xl border border-[#F1F5F9] bg-white p-8 shadow-sm">
        <SignInButtons callbackUrl={base} />
        <p className="mt-6 text-center text-sm font-bold text-[#475569]">
          <Link href="/" className="transition-colors hover:text-[#0055FF]">
            Back to home
          </Link>
        </p>
      </div>
    </PageShell>
  );
}

