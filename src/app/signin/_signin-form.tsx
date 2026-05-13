"use client";

import { ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { PasswordField } from "@/components/auth/password-field";
import { checkCredentials } from "./actions";

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function submit(formData: FormData) {
    setMessage(null);

    startTransition(async () => {
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");
      const checked = await checkCredentials(email, password);

      if (!checked.ok) {
        setMessage(checked.message ?? "Could not sign in.");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setMessage("Could not sign in. Try again.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  }

  return (
    <form action={submit} className="space-y-5">
      {message ? (
        <div className="rounded-2xl border border-[#FF3366]/20 bg-[#FF3366]/10 px-4 py-3 text-sm font-bold text-[#B42318]">
          {message}
        </div>
      ) : null}

      <div>
        <label htmlFor="email" className="text-sm font-bold text-[#0F172A]">
          Email <span className="text-[#FF3366]">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="input-base"
          required
        />
      </div>

      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="current-password"
      />

      <button type="submit" disabled={isPending} className="btn-primary w-full">
        <span>{isPending ? "Signing in..." : "Sign in"}</span>
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}

