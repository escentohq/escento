export function PageShell({
  eyebrow,
  title,
  body,
  action,
  children,
  size = "wide",
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  size?: "wide" | "medium" | "narrow";
}) {
  const maxWidth =
    size === "narrow" ? "max-w-2xl" : size === "medium" ? "max-w-5xl" : "max-w-[1280px]";

  return (
    <div className="bg-paper px-4 py-10 sm:px-6 md:py-14 lg:px-8 lg:py-16">
      <div className={`mx-auto w-full ${maxWidth}`}>
          <header className="mb-8 flex flex-col gap-6 border-b border-border-strong pb-8 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              {eyebrow ? (
                <span className="text-meta uppercase text-brand">
                  {eyebrow}
                </span>
              ) : null}
              <h1 className={`${eyebrow ? "mt-3" : ""} text-page-title text-ink`}>
                {title}
              </h1>
              {body ? (
                <p className="mt-4 max-w-2xl text-body text-muted md:text-lg">
                  {body}
                </p>
              ) : null}
            </div>
            {action ? <div className="w-full shrink-0 md:w-auto [&>a]:w-full md:[&>a]:w-auto">{action}</div> : null}
          </header>
        {children}
      </div>
    </div>
  );
}
