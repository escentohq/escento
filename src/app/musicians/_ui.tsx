import Link from "next/link";

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-950/40 px-2.5 py-1 text-xs text-zinc-200">
      {children}
    </span>
  );
}

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_60px_rgba(0,0,0,0.45)]">
      <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-xl bg-violet-500 px-3 py-2 text-sm font-semibold text-zinc-950 shadow-sm hover:bg-violet-400"
    >
      {children}
    </Link>
  );
}

