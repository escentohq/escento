export function EmptyState({
  eyebrow = "Nothing yet",
  title,
  body,
  cta,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="border-y border-[#CBD5E1] py-10 sm:py-12">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0055FF]">
        {eyebrow}
      </span>
      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-[#0F172A]">{title}</h3>
      {body && <p className="mt-2 max-w-2xl leading-relaxed text-[#475569]">{body}</p>}
      {cta && <div className="mt-6 flex">{cta}</div>}
    </div>
  );
}
