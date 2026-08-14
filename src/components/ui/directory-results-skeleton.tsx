/**
 * Placeholder for the streamed result rows on /musicians and /gigs. The page shell and
 * filter bar render immediately; this stands in until the directory read resolves.
 * Row height matches the real rows so the filter bar does not shift when they arrive.
 */
export function DirectoryResultsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <section className="mt-10" aria-hidden>
      <div className="divide-y divide-rule border-y border-rule">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-28 bg-surface" />
        ))}
      </div>
    </section>
  );
}
