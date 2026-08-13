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
    <section className={`border-t border-[#CBD5E1] py-6 ${className}`}>
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">
          {eyebrow}
        </span>
      ) : null}
      {title ? (
        <h2 className={`${eyebrow ? "mt-3" : ""} text-2xl font-semibold tracking-[-0.02em] text-[#0F172A]`}>
          {title}
        </h2>
      ) : null}
      <div className={title || eyebrow ? "mt-5" : ""}>{children}</div>
    </section>
  );
}
