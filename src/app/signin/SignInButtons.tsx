"use client";

import { signIn } from "next-auth/react";

type Props = { callbackUrl: string };

export function SignInButtons({ callbackUrl }: Props) {
  return (
    <div className="mt-8 flex flex-col gap-3">
      <button
        type="button"
        onClick={() => signIn("github", { callbackUrl })}
        className="btn-primary w-full"
      >
        Sign in with GitHub
      </button>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="btn-secondary w-full"
      >
        Sign in with Google
      </button>
    </div>
  );
}
