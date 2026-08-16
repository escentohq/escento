import { type Metadata } from "next";
import Link from "next/link";
import { requireSignedIn } from "@/lib/auth-guards";
import { UpdatePasswordForm } from "./_update-password-form";

export const metadata: Metadata = { title: "Update Password" };

export default async function UpdatePasswordPage() {
  await requireSignedIn("/account/update-password");

  return (
    <div className="bg-paper px-6 py-16">
      <div className="mx-auto w-full max-w-2xl border-y border-rule py-10">
        <div className="mb-12">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
            New password
          </span>
          <h1 className="mt-4 text-page-title text-ink">
            Choose a new password
          </h1>
          <p className="mt-4 text-base font-medium leading-relaxed text-[#475569]">
          Enter and confirm your new password.
          </p>
        </div>

        <UpdatePasswordForm />

        <div className="mt-8">
          <Link href="/account" className="text-sm font-bold text-[#0055FF] hover:text-[#0F172A] transition-colors">
            Back to account
          </Link>
        </div>
      </div>
    </div>
  );
}
