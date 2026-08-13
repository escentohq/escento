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
      <span className="text-meta uppercase text-brand">
        {eyebrow}
      </span>
      <h3 className="mt-3 text-item-heading text-ink">{title}</h3>
      {body && <p className="mt-2 max-w-2xl text-body text-muted">{body}</p>}
      {cta && <div className="mt-6 flex">{cta}</div>}
    </div>
  );
}
