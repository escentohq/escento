import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppSession = {
  user: {
    id: string;
    email: string | null;
    name?: string | null;
    role?: string | null;
    image?: string | null;
    isAdmin?: boolean;
    isSuspended?: boolean;
  };
};

export const getCurrentSession = cache(async (): Promise<AppSession | null> => {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) return null;

  const adminLookup = await supabase
    .from("app_user")
    .select("role, name, image, is_admin, suspended_at")
    .eq("id", user.id)
    .single();
  let appUser: any = adminLookup.data;
  let appUserError = adminLookup.error;

  if (appUserError && appUserError.code !== "PGRST116") {
    const fallback = await supabase
      .from("app_user")
      .select("role, name, image")
      .eq("id", user.id)
      .single();

    if (!fallback.error || fallback.error.code === "PGRST116") {
      appUser = fallback.data;
      appUserError = fallback.error;
    }
  }

  // Log unexpected errors (RLS violations, timeouts, etc) but ignore expected "not found"
  if (appUserError && appUserError.code !== "PGRST116") {
    console.error("[auth] app_user query failed:", appUserError);
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      name: appUser?.name ?? null,
      role: appUser?.role ?? null,
      image: appUser?.image ?? null,
      isAdmin: "is_admin" in (appUser ?? {}) ? Boolean(appUser?.is_admin) : false,
      isSuspended: "suspended_at" in (appUser ?? {}) ? Boolean(appUser?.suspended_at) : false,
    },
  };
});

export async function requireSignedIn(callbackUrl: string): Promise<AppSession> {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return session;
}

export async function requireUser(callbackUrl: string): Promise<AppSession> {
  const session = await requireSignedIn(callbackUrl);
  if (session.user.isSuspended) redirect("/");
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

export async function requireAdmin(callbackUrl: string): Promise<AppSession> {
  const session = await requireUser(callbackUrl);
  if (!session.user.isAdmin) redirect("/");
  return session;
}
