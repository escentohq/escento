import Link from "next/link";
import { type LucideIcon } from "lucide-react";

type Props = { href: string; children: React.ReactNode; icon?: LucideIcon; className?: string };

export function SecondaryCta({ href, children, icon: Icon, className = "" }: Props) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 min-w-0 items-center justify-center gap-2 border border-[#0F172A] bg-transparent px-6 py-3 text-center text-sm font-semibold leading-tight text-[#0F172A] transition-colors hover:bg-[#0F172A] hover:text-white focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden /> : null}
      <span className="min-w-0">{children}</span>
    </Link>
  );
}
