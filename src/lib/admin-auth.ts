import { getCurrentSession } from "@/lib/auth-guards";

export type AdminAccess =
  | { ok: true; email: string }
  | { ok: false; reason: "signed_out" | "not_allowed" };

function adminEmailSet() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
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
