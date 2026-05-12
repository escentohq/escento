import Link from "next/link";
import { Plus, type LucideIcon } from "lucide-react";

type Props = { href: string; children: React.ReactNode; icon?: LucideIcon; className?: string };

export function SecondaryCta({ href, children, icon: Icon = Plus, className = "" }: Props) {
  return (
    <Link
      href={href}
      className={`flex h-14 items-center justify-center gap-2 rounded-full border-2 border-[#E2E8F0] bg-white px-8 text-sm font-bold tracking-wide text-[#0F172A] transition-colors hover:border-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 ${className}`}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {children}
    </Link>
  );
}
