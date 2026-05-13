"use server";

import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { hashPassword, validatePassword } from "@/lib/password";

export type SignUpResult = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createAccount(formData: FormData): Promise<SignUpResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!email) fieldErrors.email = "Add your email.";
  if (email && !isValidEmail(email)) fieldErrors.email = "Use a valid email address.";

  const passwordError = validatePassword(password);
  if (!password) fieldErrors.password = "Create a password.";
  if (password && passwordError) fieldErrors.password = passwordError;
  if (password !== confirmPassword) {
    fieldErrors.confirmPassword = "Passwords need to match.";
  }

  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "Tighten the account details.", fieldErrors };
  }

  const existing = await db.user.findUnique({
    where: { email },
    select: {
      passwordHash: true,
      accounts: { select: { provider: true } },
    },
  });

  if (existing) {
    const hasGoogle = existing.accounts.some((account) => account.provider === "google");
    return {
      ok: false,
      fieldErrors: {
        email: hasGoogle
          ? "An account already exists for this email. Sign in with Google."
          : "An account already exists for this email. Sign in instead.",
      },
    };
  }

  try {
    await db.user.create({
      data: {
        email,
        name: name || null,
        passwordHash: await hashPassword(password),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        ok: false,
        fieldErrors: {
          email: "An account already exists for this email. Sign in instead.",
        },
      };
    }
    throw error;
  }

  return { ok: true };
}

