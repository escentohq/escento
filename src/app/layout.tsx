import "./globals.css";

import type { Metadata } from "next";

import { getCurrentSession } from "@/lib/auth-guards";
import { getProfileByUserId } from "@/lib/api/profiles";
import { NavBar } from "@/components/ui/nav-bar";
import { Footer } from "@/components/ui/footer";

export const metadata: Metadata = {
  title: "Motivo",
  description:
    "Motivo is a platform connecting student musicians with student creators who need collaborators for creative projects.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();

  let musicianProfilePath: "/profile/create" | "/profile/edit" | null = null;
  if (session?.user?.role === "MUSICIAN" && session?.user?.id) {
    const existing = await getProfileByUserId(session.user.id);
    musicianProfilePath = existing ? "/profile/edit" : "/profile/create";
  }

  const isCreator = session?.user?.role === "CREATOR";

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-[#FAFAFA] text-[#0F172A] antialiased">
        <NavBar
          signedIn={!!session?.user}
          email={session?.user?.email}
          role={session?.user?.role}
          musicianProfilePath={musicianProfilePath}
          isCreator={isCreator}
        />

        <main className="flex-1">{children}</main>

        <Footer />
      </body>
    </html>
  );
}
