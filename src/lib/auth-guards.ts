import { redirect } from "next/navigation";

import { syncAppUserFromAuth } from "@/lib/auth/sync-app-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Role = "MUSICIAN" | "CREATOR";

export type AppSession = {
  user: {
    id: string;
    email: string | null;
    role: string | null;
    name: string | null;
    image: string | null;
  };
};

export async function getCurrentSession(): Promise<AppSession | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const appUser = await syncAppUserFromAuth(user);
  return {
    user: {
      id: appUser.id,
      email: appUser.email,
      role: appUser.role,
      name: appUser.name,
      image: appUser.image,
    },
  };
}

/** Signed in with Supabase; app user synced. Role may still be null (onboarding). */
export async function requireSignedIn(callbackUrl: string): Promise<AppSession> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const appUser = await syncAppUserFromAuth(user);
  return {
    user: {
      id: appUser.id,
      email: appUser.email,
      role: appUser.role,
      name: appUser.name,
      image: appUser.image,
    },
  };
}

export async function requireUser(callbackUrl: string): Promise<AppSession> {
  const session = await requireSignedIn(callbackUrl);
  if (!session.user.role) redirect("/onboarding/role");
  return session;
}

export async function requireRole(role: Role, callbackUrl: string) {
  const session = await requireUser(callbackUrl);
  if (session.user.role !== role) redirect("/");
  return session;
}
