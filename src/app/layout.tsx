import "./globals.css";

import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "GigForge",
  description:
    "GigForge is a platform connecting student musicians with student creators who need collaborators for creative projects.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  let musicianProfilePath: "/profile/create" | "/profile/edit" | null = null;
  if (session?.user?.role === "MUSICIAN" && session.user.id) {
    const existing = await db.musicianProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    musicianProfilePath = existing ? "/profile/edit" : "/profile/create";
  }

  const isCreator = session?.user?.role === "CREATOR";

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <header className="border-b border-zinc-900/80 bg-zinc-950/70 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-semibold tracking-tight text-zinc-50"
              >
                GigForge
              </Link>
              <div className="flex items-center gap-4 text-sm text-zinc-300">
                <Link href="/musicians" className="transition-colors hover:text-white">
                  Browse Musicians
                </Link>
                <Link href="/gigs" className="transition-colors hover:text-white">
                  Browse Gigs
                </Link>
                {musicianProfilePath ? (
                  <Link href={musicianProfilePath} className="transition-colors hover:text-white">
                    {musicianProfilePath === "/profile/create"
                      ? "Create Profile"
                      : "Edit Profile"}
                  </Link>
                ) : null}
                {isCreator ? (
                  <>
                    <Link href="/gigs/manage" className="transition-colors hover:text-white">
                      Manage Gigs
                    </Link>
                    <Link href="/gigs/create" className="transition-colors hover:text-white">
                      Post a Gig
                    </Link>
                  </>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              {!session?.user ? (
                <a
                  href="/api/auth/signin"
                  className="rounded-xl bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-white"
                >
                  Sign in
                </a>
              ) : (
                <>
                  <div className="hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/40 px-3 py-1.5 text-xs text-zinc-300 sm:flex">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="truncate max-w-[160px]">
                      {session.user.email ?? "Signed in"}
                    </span>
                    {session.user.role ? (
                      <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-300">
                        {session.user.role.toLowerCase()}
                      </span>
                    ) : null}
                  </div>
                  <a
                    href="/api/auth/signout"
                    className="rounded-xl border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-zinc-500"
                  >
                    Sign out
                  </a>
                </>
              )}
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 pb-12 pt-6">{children}</main>
      </body>
    </html>
  );
}

