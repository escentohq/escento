import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#F1F5F9] bg-white py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-[#0F172A]">
              GigForge
            </span>
            <span className="text-sm font-medium text-[#64748B]">
              &copy; {new Date().getFullYear()}
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-bold text-[#475569]">
            <Link href="/musicians" className="transition-colors hover:text-[#0055FF]">
              Musicians
            </Link>
            <Link href="/gigs" className="transition-colors hover:text-[#0055FF]">
              Gigs
            </Link>
            <Link href="/signin" className="transition-colors hover:text-[#0055FF]">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
