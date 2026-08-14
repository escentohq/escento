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
  };
};

export const getCurrentSession = cache(async (): Promise<AppSession | null> => {
  const supabase = await createSupabaseServerClient();

  // getClaims() verifies the JWT locally when the project uses asymmetric signing keys,
  // which removes a network round trip to the Auth server from every request. With
  // legacy symmetric (HS256) secrets it transparently falls back to a getUser() call, so
  // this is safe regardless of how the project is configured.
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  if (!claims?.sub) return null;

  const { data: appUser, error: appUserError } = await supabase
    .from("app_user")
    .select("role, name, image")
    .eq("id", claims.sub)
    .single();

  // Log unexpected errors (RLS violations, timeouts, etc) but ignore expected "not found"
  if (appUserError && appUserError.code !== "PGRST116") {
    console.error("[auth] app_user query failed:", appUserError);
  }

  return {
    user: {
      id: claims.sub,
      email: claims.email ?? null,
      name: appUser?.name ?? null,
      role: appUser?.role ?? null,
      image: appUser?.image ?? null,
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
