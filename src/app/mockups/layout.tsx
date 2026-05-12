import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

export const metadata = {
  title: "Mockups — Gig Forge",
  robots: { index: false, follow: false },
};

// Hide from prod unless explicitly enabled.
const PROD_GATE_OPEN = process.env.MOCKUPS_ENABLED === "true";
const IS_PROD = process.env.NODE_ENV === "production";

export default function MockupsLayout({ children }: { children: ReactNode }) {
  if (IS_PROD && !PROD_GATE_OPEN) notFound();

  return (
    <div className="relative left-1/2 -mb-12 -mt-6 min-h-screen w-screen -translate-x-1/2 bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link href="/mockups" className="text-sm font-semibold tracking-tight">
            ← Mockup Gallery
          </Link>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
            INTERNAL · NOT PROD
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}
