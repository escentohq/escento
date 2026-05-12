export function SectionCard({
  title,
  eyebrow,
  children,
  className = "",
}: {
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-[#F1F5F9] bg-white p-6 shadow-sm ${className}`}>
      {eyebrow ? (
        <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
          {eyebrow}
        </span>
      ) : null}
      {title ? (
        <h2 className={`${eyebrow ? "mt-3" : ""} text-2xl font-black tracking-tight text-[#0F172A]`}>
          {title}
        </h2>
      ) : null}
      <div className={title || eyebrow ? "mt-5" : ""}>{children}</div>
    </section>
  );
}

