import Link from "next/link";
import { type LucideIcon } from "lucide-react";

type Props = { href: string; children: React.ReactNode; icon?: LucideIcon; className?: string };

export function SecondaryCta({ href, children, icon: Icon, className = "" }: Props) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 min-w-0 items-center justify-center gap-2 border border-ink bg-transparent px-6 py-3 text-center text-control text-ink transition-colors duration-150 hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden /> : null}
      <span className="min-w-0">{children}</span>
    </Link>
  );
}
