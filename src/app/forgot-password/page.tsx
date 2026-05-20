import { type Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./_forgot-password-form";

export const metadata: Metadata = { title: "Forgot Password" };

export default async function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#FAFAFA]">
      <div className="w-full max-w-md">
        <div className="mb-12">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
            Password reset
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-[#0F172A]">
            Get back in.
          </h1>
          <p className="mt-4 text-base font-medium leading-relaxed text-[#475569]">
            Enter your email and we&apos;ll send a link to reset your password.
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="mt-8 text-center">
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
