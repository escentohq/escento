import Link from "next/link";
import { type LucideIcon } from "lucide-react";

type Props = {
  href: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  badgeCount?: number;
  prefetch?: boolean;
};

export function PrimaryCta({ href, children, icon: Icon, className = "", badgeCount = 0, prefetch }: Props) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={`relative inline-flex min-h-12 min-w-0 items-center justify-center gap-2 border border-brand bg-brand px-6 py-3 text-center text-control text-white transition-colors duration-150 hover:border-brand-hover hover:bg-brand-hover active:border-brand-pressed active:bg-brand-pressed focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 ${className}`}
    >
      <span className="relative z-10 min-w-0">{children}</span>
      {Icon ? <Icon className="relative z-10 h-4 w-4 shrink-0" aria-hidden /> : null}
      {badgeCount > 0 ? (
        <span className="absolute -right-1 -top-1 z-20 flex h-6 min-w-6 items-center justify-center bg-coral px-1.5 text-[10px] font-bold leading-none text-white ring-2 ring-white">
          {badgeCount > 9 ? "9+" : badgeCount}
        </span>
      ) : null}
    </Link>
  );
}
