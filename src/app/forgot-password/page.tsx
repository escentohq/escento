import { type Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./_forgot-password-form";

export const metadata: Metadata = { title: "Forgot Password" };

export default async function ForgotPasswordPage() {
  return (
    <div className="bg-paper px-6 py-16">
      <div className="mx-auto w-full max-w-2xl border-y border-rule py-10">
        <div className="mb-10">
          <span className="text-meta uppercase text-brand">
            Password reset
          </span>
          <h1 className="mt-4 text-page-title text-ink">
            Reset your password
          </h1>
          <p className="mt-4 text-body text-muted">
            Enter your email. We&apos;ll send you a reset link.
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="mt-8">
          <p className="text-sm text-[#475569]">
            Remember your password?{" "}
            <Link href="/signin" className="font-bold text-[#0055FF] hover:text-[#0F172A] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
