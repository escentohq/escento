import Link from "next/link";

export type DirectoryView = "musicians" | "gigs";

const VIEWS: Array<{ value: DirectoryView; label: string }> = [
  { value: "musicians", label: "Musicians" },
  { value: "gigs", label: "Gigs" },
];

/**
 * Switches `/` between the two directories.
 *
 * Plain links, not a form: the switch has to work for a signed-out visitor and
 * without JavaScript, and `?view=` keeps the surface shareable. Active filters
 * ride along so switching does not silently drop a search.
 */
export function DirectoryViewSwitch({
  view,
  params,
}: {
  view: DirectoryView;
  params: Record<string, string | string[] | undefined>;
}) {
  return (
    <nav aria-label="Directory" className="flex flex-wrap gap-3">
      {VIEWS.map((option) => {
        const active = option.value === view;

        return (
          <Link
            key={option.value}
            href={hrefFor(option.value, params)}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-11 items-center border px-5 py-2 text-control transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 ${
              active
                ? "border-ink bg-ink text-white"
                : "border-rule text-muted hover:border-brand hover:text-brand"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Current search params with `view` replaced. Multi-value keys keep every entry. */
function hrefFor(
  view: DirectoryView,
  params: Record<string, string | string[] | undefined>,
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (key === "view" || value === undefined) continue;
    for (const entry of Array.isArray(value) ? value : [value]) {
      if (entry) search.append(key, entry);
    }
  }

  search.set("view", view);

  return `/?${search.toString()}`;
}
