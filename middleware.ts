import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;
  const publicRoute =
    pathname === "/" ||
    pathname === "/help" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/compliance" ||
    pathname === "/musicians" ||
    /^\/musicians\/[^/]+$/.test(pathname) ||
    pathname === "/gigs" ||
    (/^\/gigs\/[^/]+$/.test(pathname) && !["/gigs/create", "/gigs/manage"].includes(pathname));

  // Public HTML never waits for authentication. The client navigation identity
  // endpoint remains matched below and refreshes cookies for signed-in visitors.
  if (publicRoute) return supabaseResponse;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables in middleware");
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Refresh session — required by @supabase/ssr to keep JWTs fresh. Without this
  // call, tokens expire after ~1 hour and users become silently deauthenticated.
  // getClaims() still performs that refresh, but verifies the JWT locally when the
  // project uses asymmetric signing keys, saving a round trip to the Auth server on
  // every non-public request.
  let userId: string | null = null;
  try {
    const { data } = await supabase.auth.getClaims();
    userId = data?.claims?.sub ?? null;
  } catch {
    // User doesn't exist (403) or other auth errors — let the Supabase SDK handle
    // cookie cleanup. Normal for deleted accounts or stale tokens.
  }

  if (!userId && request.nextUrl.pathname.startsWith("/onboarding")) {
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  // /api/navigation stays matched — it is the identity endpoint and needs the cookie
  // refresh. Everything excluded here is a static asset that was paying an auth hop.
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
