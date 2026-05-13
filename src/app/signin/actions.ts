"use server";

import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export type SignInCheckResult = {
  ok: boolean;
  message?: string;
};

export async function checkCredentials(
  emailInput: string,
  password: string,
): Promise<SignInCheckResult> {
  const email = emailInput.trim().toLowerCase();
  if (!email || !password) {
    return { ok: false, message: "Enter your email and password." };
  }

  const user = await db.user.findUnique({
    where: { email },
    select: {
      passwordHash: true,
      accounts: { select: { provider: true } },
    },
  });

  if (!user) {
    return { ok: false, message: "No account exists for that email." };
  }

  if (!user.passwordHash) {
    const hasGoogle = user.accounts.some((account) => account.provider === "google");
    return {
      ok: false,
      message: hasGoogle
        ? "That email is linked to Google. Sign in with Google instead."
        : "That account does not have a password sign-in set up.",
    };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { ok: false, message: "That password is not right." };
  }

  return { ok: true };
}

