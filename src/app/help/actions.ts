"use server";

import { headers } from "next/headers";

import { getCurrentSession } from "@/lib/auth-guards";
import {
  type ActionState,
  fieldError,
  formLevelMessage,
  isValidEmail,
  strOrEmpty,
} from "@/lib/form-utils";
import { sendSupportEmail } from "@/lib/support-email";

const SUPPORT_SUCCESS_MESSAGE =
  "Thanks! Your message has been sent to the Escento team. We'll get back to you as soon as possible.";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_SUBMISSIONS = 3;
const DUPLICATE_WINDOW_MS = 60 * 1000;
const supportRateLimit = new Map<string, { count: number; resetAt: number; lastSignature?: string; lastAt?: number }>();

export type HelpFormState = ActionState & {
  deliveryFailed?: boolean;
};

function cleanText(value: unknown, maxLength: number) {
  return strOrEmpty(value)
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .slice(0, maxLength);
}

function getClientIp(headersList: Headers) {
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return headersList.get("x-real-ip") || "unknown";
}

function checkRateLimit(key: string, signature: string) {
  const now = Date.now();
  const existing = supportRateLimit.get(key);

  if (!existing || existing.resetAt <= now) {
    supportRateLimit.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
      lastSignature: signature,
      lastAt: now,
    });
    return true;
  }

  if (existing.lastSignature === signature && existing.lastAt && now - existing.lastAt < DUPLICATE_WINDOW_MS) {
    return false;
  }

  if (existing.count >= RATE_LIMIT_MAX_SUBMISSIONS) {
    return false;
  }

  supportRateLimit.set(key, {
    ...existing,
    count: existing.count + 1,
    lastSignature: signature,
    lastAt: now,
  });
  return true;
}

export async function submitHelpRequest(_prevState: HelpFormState, formData: FormData): Promise<HelpFormState> {
  const name = cleanText(formData.get("name"), 120) || null;
  const email = cleanText(formData.get("email"), 254).toLowerCase();
  const subject = cleanText(formData.get("subject"), 160);
  const message = cleanText(formData.get("message"), 4000);
  const values = { name: name ?? "", email, subject, message };
  const fieldErrors: Record<string, string> = {};

  if (!email) fieldError(fieldErrors, "email", "Add your email address.");
  else if (!isValidEmail(email)) fieldError(fieldErrors, "email", "Enter a valid email address.");

  if (!subject) fieldError(fieldErrors, "subject", "Add a subject.");
  if (!message) fieldError(fieldErrors, "message", "Add a message.");

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: formLevelMessage(fieldErrors, "Fix the highlighted field to continue."),
      fieldErrors,
      values,
    };
  }

  const headersList = await headers();
  const session = await getCurrentSession();
  const rateKey = `${session?.user?.id ?? getClientIp(headersList)}:${email}`;
  const signature = `${email}:${subject}:${message}`;

  if (!checkRateLimit(rateKey, signature)) {
    return {
      ok: false,
      message: "Please wait a bit before sending another support request.",
      values,
    };
  }

  const submittedAt = new Date().toISOString();
  const result = await sendSupportEmail({
    name,
    email,
    subject,
    message,
    submittedAt,
    userId: session?.user?.id ?? null,
  });

  if (!result.ok) {
    return {
      ok: false,
      deliveryFailed: true,
      message: "We could not send your message automatically right now.",
      values,
    };
  }

  return {
    ok: true,
    message: SUPPORT_SUCCESS_MESSAGE,
    values: { name: "", email: "", subject: "", message: "" },
  };
}

