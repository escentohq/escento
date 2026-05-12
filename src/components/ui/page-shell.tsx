import { Reveal } from "@/components/ui/reveal";

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
    size === "narrow" ? "max-w-xl" : size === "medium" ? "max-w-4xl" : "max-w-6xl";

  return (
    <div className="bg-[#FAFAFA] px-4 py-12 sm:px-6 md:py-18 lg:py-24">
      <div className={`mx-auto w-full ${maxWidth}`}>
        <Reveal>
          <header className="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              {eyebrow ? (
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
                  {eyebrow}
                </span>
              ) : null}
              <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl md:text-5xl">
                {title}
              </h1>
              {body ? (
                <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[#475569] md:text-lg">
                  {body}
                </p>
              ) : null}
            </div>
            {action ? <div className="w-full shrink-0 md:w-auto [&>a]:w-full md:[&>a]:w-auto">{action}</div> : null}
          </header>
        </Reveal>
        {children}
      </div>
    </div>
  );
}
