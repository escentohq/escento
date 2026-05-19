"use client";

import { useFormStatus } from "react-dom";
import { signOutAction } from "@/app/account/actions";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOutAction} className="contents">
      <SignOutButtonContent className={className} />
    </form>
  );
}

function SignOutButtonContent({ className }: { className?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      aria-label="Sign out"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
