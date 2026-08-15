import { getCurrentSession } from "@/lib/auth-guards";

export type AdminAccess =
  | { ok: true; email: string }
  | { ok: false; reason: "signed_out" | "not_allowed" };

/**
 * The allowlist is a single env var edited by hand, so it tolerates whatever
 * separator and whitespace someone used. Matching addresses rather than
 * splitting means a stray comma or newline cannot silently grant or revoke
 * access to a neighbouring entry.
 */
export function parseAdminEmails(raw: string | undefined | null): Set<string> {
  const emails = (raw ?? "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
  return new Set((emails ?? []).map((email) => email.toLowerCase()));
}

function adminEmailSet() {
  return parseAdminEmails(process.env.ADMIN_EMAILS);
}

export async function getAdminAccess(): Promise<AdminAccess> {
  const session = await getCurrentSession();
  const email = session?.user.email?.toLowerCase() ?? null;
  if (!email) return { ok: false, reason: "signed_out" };

  return adminEmailSet().has(email)
    ? { ok: true, email }
    : { ok: false, reason: "not_allowed" };
}

export async function requireAdminEmail(): Promise<string> {
  const access = await getAdminAccess();
  if (!access.ok) throw new Error("Not authorized.");
  return access.email;
}
