import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendWelcomeMessageFromEscentoBestEffort } from "@/lib/api/support-account";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

      // Route new users (no role set) to onboarding, regardless of ?next parameter
      if (user) {
        await sendWelcomeMessageFromEscentoBestEffort({
          userId: user.id,
          email: user.email ?? null,
          name:
            typeof user.user_metadata?.full_name === "string"
              ? user.user_metadata.full_name
              : typeof user.user_metadata?.name === "string"
                ? user.user_metadata.name
                : null,
        });

        const { data: appUser } = await supabase
          .from("app_user")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!appUser?.role) {
          return NextResponse.redirect(new URL("/onboarding/role", origin));
        }
      }

      return NextResponse.redirect(new URL(safeNext, origin));
    }
  }

  return NextResponse.redirect(new URL("/signin?error=auth", origin));
}
