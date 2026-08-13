"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavLink = {
  href: string;
  label: string;
  badgeCount?: number;
};

export function AdminNavLinks({ links }: { links: AdminNavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex gap-1 overflow-x-auto border-y border-rule py-2" aria-label="Admin sections">
      {links.map(({ href, label, badgeCount = 0 }) => {
        const isActive =
          href === "/admin"
            ? pathname === "/admin"
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`relative whitespace-nowrap border-b-2 px-4 py-2 text-control transition-colors ${
              isActive
                ? "border-brand text-brand"
                : "border-transparent text-muted hover:text-brand"
            }`}
          >
            {label}
            {badgeCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center bg-coral px-1.5 text-[10px] font-bold leading-none text-white">
                {badgeCount > 99 ? "99+" : badgeCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
