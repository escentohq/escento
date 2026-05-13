import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#F1F5F9] bg-white py-10 md:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-2 text-center md:justify-start">
            <span className="text-lg font-black tracking-tight text-[#0F172A]">
              Motivo
            </span>
            <span className="text-sm font-medium text-[#64748B]">
              &copy; {new Date().getFullYear()}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-bold text-[#475569]">
            <Link href="/musicians" className="transition-colors hover:text-[#0055FF]">
              Musicians
            </Link>
            <Link href="/gigs" className="transition-colors hover:text-[#0055FF]">
              Gigs
            </Link>
            <Link
              href="/signin"
              prefetch={false}
              className="transition-colors hover:text-[#0055FF]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              prefetch={false}
              className="transition-colors hover:text-[#0055FF]"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
