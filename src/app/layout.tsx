import "./globals.css";

import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { NavBar } from "@/components/ui/nav-bar";
import { Footer } from "@/components/ui/footer";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-escento",
  display: "swap",
});

const siteUrl = SITE_URL;
const siteDescription = SITE_DESCRIPTION;

export const metadata: Metadata = {
  title: "Escento | Find Musicians and Gigs",
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
    title: "Escento | Find Musicians and Gigs",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={archivo.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-paper text-ink antialiased">
        <NavBar />

        <main className="flex-1">{children}</main>

        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
