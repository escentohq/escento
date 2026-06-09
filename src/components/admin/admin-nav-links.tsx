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
    <div className="mb-8 flex gap-2 overflow-x-auto rounded-2xl border border-[#F1F5F9] bg-white p-2 shadow-sm">
      {links.map(({ href, label, badgeCount = 0 }) => {
        const isActive =
          href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`relative whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              isActive
                ? "bg-[#0055FF] text-white shadow-sm"
                : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0055FF]"
            }`}
          >
            {label}
            {badgeCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF3366] px-1.5 text-[10px] font-black leading-none text-white">
                {badgeCount > 99 ? "99+" : badgeCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
