import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";

type Role = "MUSICIAN" | "CREATOR";

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function requireUser(callbackUrl: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  if (!session.user.role) redirect("/onboarding/role");
  return session;
}

export async function requireRole(role: Role, callbackUrl: string) {
  const session = await requireUser(callbackUrl);
  if (session.user.role !== role) redirect("/");
  return session;
}

