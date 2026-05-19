import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { syncAppUserFromAuth } from "@/lib/auth/sync-app-user";

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

  const app = await syncAppUserFromAuth(user);
  return {
    user: {
      id: app.id,
      email: app.email,
      role: app.role,
      name: app.name,
      image: app.image,
    },
  };
}

export async function requireSignedIn(callbackUrl: string): Promise<AppSession> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const app = await syncAppUserFromAuth(user);
  return {
    user: {
      id: app.id,
      email: app.email,
      role: app.role,
      name: app.name,
      image: app.image,
    },
  };
}

export async function requireUser(callbackUrl: string): Promise<AppSession> {
  const session = await requireSignedIn(callbackUrl);
  if (!session.user.role) redirect("/onboarding/role");
  return session;
}

export async function requireRole(
  role: "MUSICIAN" | "CREATOR",
  callbackUrl: string,
): Promise<AppSession> {
  const session = await requireUser(callbackUrl);
  if (session.user.role !== role) redirect("/");
  return session;
}
