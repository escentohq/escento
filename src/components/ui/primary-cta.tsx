import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

type Props = {
  href: string;
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  badgeCount?: number;
};

export function PrimaryCta({ href, children, icon: Icon = ArrowRight, className = "", badgeCount = 0 }: Props) {
  return (
    <Link
      href={href}
      className={`group relative flex min-h-14 min-w-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#0F172A] px-6 py-3 text-center text-sm font-bold leading-tight tracking-wide text-white transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2 sm:px-8 ${className}`}
    >
      <span className="relative z-10 min-w-0">{children}</span>
      <Icon className="relative z-10 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
      {badgeCount > 0 ? (
        <span className="absolute -right-1 -top-1 z-20 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#FF3366] px-1.5 text-[10px] font-black leading-none text-white ring-2 ring-white">
          {badgeCount > 9 ? "9+" : badgeCount}
        </span>
      ) : null}
      <div className="absolute inset-0 bg-linear-to-r from-[#0055FF] to-[#FF3366] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Link>
  );
}
