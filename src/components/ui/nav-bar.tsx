import Link from "next/link";
import { EscentoWordmark } from "./brand";
import { NavigationAccount } from "./navigation-account";

export function NavBar() {
  const publicLinks = (
    <>
      <Link href="/musicians" className="inline-flex min-h-11 items-center whitespace-nowrap transition-colors hover:text-[#0055FF]">Browse musicians</Link>
      <Link href="/gigs" className="inline-flex min-h-11 items-center whitespace-nowrap transition-colors hover:text-[#0055FF]">Browse gigs</Link>
      <Link href="/help" className="inline-flex min-h-11 items-center whitespace-nowrap transition-colors hover:text-[#0055FF]">Help</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-[#CBD5E1] bg-white">
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8 lg:py-4">
        <div className="flex min-w-0 items-center gap-8">
          <Link
            href="/"
            aria-label="Escento home"
            className="text-[#0F172A] transition-opacity hover:opacity-80"
          >
            <EscentoWordmark className="text-lg" />
          </Link>
          <div className="hidden items-center gap-6 text-sm font-semibold text-[#475569] lg:flex">
            {publicLinks}
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 text-sm sm:gap-3">
          <NavigationAccount />
        </div>
      </nav>
      <div className="border-t border-[#CBD5E1] lg:hidden">
        <div className="mx-auto flex max-w-[1280px] gap-5 overflow-x-auto px-4 text-sm font-semibold text-[#475569] sm:px-6">
          {publicLinks}
        </div>
      </div>
    </header>
  );
}
