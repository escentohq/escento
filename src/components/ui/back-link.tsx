import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-bold text-[#475569] transition-colors hover:text-[#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {children}
    </Link>
  );
}

