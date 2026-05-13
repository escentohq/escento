"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PasswordField } from "@/components/auth/password-field";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setMessage(null);
    setPending(true);
    try {
      const email = String(formData.get("email") ?? "").trim().toLowerCase();
      const password = String(formData.get("password") ?? "");
      if (!email || !password) {
        setMessage("Enter your email and password.");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("invalid login")) {
          setMessage("That email or password is not right.");
        } else {
          setMessage(error.message);
        }
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } finally {
      setPending(false);
    }
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

      <button type="submit" disabled={pending} className="btn-primary w-full">
        <span>{pending ? "Signing in..." : "Sign in"}</span>
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
