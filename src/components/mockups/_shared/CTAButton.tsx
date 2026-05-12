import Link from "next/link";
import type { ReactNode } from "react";

export function CTAButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition";
  const variants = {
    primary: "bg-neutral-900 text-white hover:bg-neutral-700",
    secondary: "bg-white text-neutral-900 border border-neutral-300 hover:border-neutral-900",
    ghost: "text-neutral-900 hover:bg-neutral-100",
  };
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
