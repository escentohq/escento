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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

