import Link from "next/link";
import { Plus, type LucideIcon } from "lucide-react";

type Props = { href: string; children: React.ReactNode; icon?: LucideIcon; className?: string };

export function SecondaryCta({ href, children, icon: Icon = Plus, className = "" }: Props) {
  return (
    <Link
      href={href}
      className={`flex min-h-14 min-w-0 items-center justify-center gap-2 rounded-full border-2 border-[#E2E8F0] bg-white px-6 py-3 text-center text-sm font-bold leading-tight tracking-wide text-[#0F172A] transition-colors hover:border-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 sm:px-8 ${className}`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span className="min-w-0">{children}</span>
    </Link>
  );
}
