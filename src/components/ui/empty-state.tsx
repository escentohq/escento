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
    <div className="rounded-3xl border border-[#F1F5F9] bg-white p-12 text-center shadow-sm">
      <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">
        {eyebrow}
      </span>
      <h3 className="mt-3 text-2xl font-bold">{title}</h3>
      {body && <p className="mt-2 font-medium leading-relaxed text-[#475569]">{body}</p>}
      {cta && <div className="mt-6 flex justify-center">{cta}</div>}
    </div>
  );
}
