import { type Metadata } from "next";
import Link from "next/link";
import { requireSignedIn } from "@/lib/auth-guards";
import { UpdatePasswordForm } from "./_update-password-form";

export const metadata: Metadata = { title: "Update Password" };

export default async function UpdatePasswordPage() {
  await requireSignedIn("/account/update-password");

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#FAFAFA]">
      <div className="w-full max-w-md">
        <div className="mb-12">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
            New password
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-[#0F172A]">
            Change it up.
          </h1>
          <p className="mt-4 text-base font-medium leading-relaxed text-[#475569]">
            Set a new password to secure your account.
          </p>
        </div>

        <UpdatePasswordForm />

        <div className="mt-8 text-center">
          <Link href="/account" className="text-sm font-bold text-[#0055FF] hover:text-[#0F172A] transition-colors">
            Back to account
          </Link>
        </div>
      </div>
    </div>
  );
}
