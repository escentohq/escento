export function EmptyState({
  eyebrow = "Nothing yet",
  title,
  body,
  cta,
  headingLevel = "h2",
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  cta?: React.ReactNode;
  headingLevel?: "h1" | "h2" | "h3";
}) {
  const Heading = headingLevel;

  return (
    <div className="border-y border-[#CBD5E1] py-10 sm:py-12">
      <span className="text-meta uppercase text-brand">
        {eyebrow}
      </span>
      <Heading className="mt-3 text-item-heading text-ink">{title}</Heading>
      {body && <p className="mt-2 max-w-2xl text-body text-muted">{body}</p>}
      {cta && <div className="mt-6 flex">{cta}</div>}
    </div>
  );
}
