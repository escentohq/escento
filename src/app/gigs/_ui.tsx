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
    <section className="card p-5">
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
  return <Link href={href} className="btn-primary">{children}</Link>;
}

