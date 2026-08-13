import Link from "next/link";

import { EscentoWordmark } from "./brand";

export function Footer() {
  return (
    <footer className="border-t border-[#CBD5E1] bg-white py-8 md:py-10">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end md:gap-12">
          <div className="flex items-center gap-3">
            <EscentoWordmark className="text-lg text-[#0F172A]" />
            <span className="text-xs font-medium text-[#94A3B8]">
              &copy; {new Date().getFullYear()}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-medium text-[#475569]">
            <Link
              href="/musicians"
              prefetch={false}
              className="transition-colors hover:text-[#0055FF]"
            >
              Musicians
            </Link>
            <Link
              href="/gigs"
              prefetch={false}
              className="transition-colors hover:text-[#0055FF]"
            >
              Gigs
            </Link>

            <div className="h-5 w-px bg-[#E2E8F0]" />
            <Link
              href="/privacy"
              className="text-xs text-[#94A3B8] transition-colors hover:text-[#0055FF]"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-[#94A3B8] transition-colors hover:text-[#0055FF]"
            >
              Terms
            </Link>
            <Link
              href="/compliance"
              className="text-xs text-[#94A3B8] transition-colors hover:text-[#0055FF]"
            >
              Compliance
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
