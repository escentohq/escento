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
    <div className="bg-[#FAFAFA] px-6 py-16 md:py-24">
      <div className={`mx-auto w-full ${maxWidth}`}>
        <Reveal>
          <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {eyebrow ? (
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0055FF]">
                  {eyebrow}
                </span>
              ) : null}
              <h1 className="mt-3 text-4xl font-black tracking-tight text-[#0F172A] md:text-5xl">
                {title}
              </h1>
              {body ? (
                <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[#475569] md:text-lg">
                  {body}
                </p>
              ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </header>
        </Reveal>
        {children}
      </div>
    </div>
  );
}

