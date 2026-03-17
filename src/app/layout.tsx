import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GigForge",
  description:
    "GigForge is a platform connecting student musicians with student creators who need collaborators for creative projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}

