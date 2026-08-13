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
        <span className="text-meta uppercase text-muted">
          {eyebrow}
        </span>
      ) : null}
      {title ? (
        <h2 className={`${eyebrow ? "mt-3" : ""} text-section-heading text-ink`}>
          {title}
        </h2>
      ) : null}
      <div className={title || eyebrow ? "mt-5" : ""}>{children}</div>
    </section>
  );
}
