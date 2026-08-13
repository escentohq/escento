import "./globals.css";

import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { getCurrentSession } from "@/lib/auth-guards";
import { getProfileByUserId } from "@/lib/api/profiles";
import { getUnreadConversationSummariesForUser } from "@/lib/api/messaging";
import { NavBar } from "@/components/ui/nav-bar";
import { Footer } from "@/components/ui/footer";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-escento",
  display: "swap",
});

const siteUrl = "https://www.escento.com";
const siteDescription =
  "Escento helps musicians get discovered for gigs, collaborations, and creative opportunities.";

export const metadata: Metadata = {
  title: "Escento",
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  applicationName: "Escento",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Escento",
    siteName: "Escento",
    description: siteDescription,
    url: siteUrl,
    type: "website",
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Escento",
    url: siteUrl,
    logo: `${siteUrl}/icon.png`,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Escento",
    url: siteUrl,
  },
];

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
  let unreadConversationCount = 0;
  if (session?.user?.id && session.user.role) {
    try {
      const unread = await getUnreadConversationSummariesForUser(session.user.id);
      unreadConversationCount = unread.length;
    } catch (error) {
      console.error("[layout] unread messaging badge failed:", error);
    }
  }

  return (
    <html lang="en" className={archivo.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-[#FAFAFA] text-[#0F172A] antialiased">
        <NavBar
          signedIn={!!session?.user}
          email={session?.user?.email}
          role={session?.user?.role}
          name={session?.user?.name}
          image={session?.user?.image}
          musicianProfilePath={musicianProfilePath}
          isCreator={isCreator}
          unreadConversationCount={unreadConversationCount}
        />

        <main className="flex-1">{children}</main>

        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
