type ChipTone = "blue" | "pink" | "gold" | "neutral";

const toneClass: Record<ChipTone, string> = {
  blue: "border-brand text-brand",
  pink: "border-coral text-coral",
  gold: "border-amber text-amber-ink",
  neutral: "border-border-strong text-muted",
};

export function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: ChipTone;
}) {
  return (
    <span className={`inline-flex items-center border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${toneClass[tone]}`}>
      {children}
    </span>
  );
}
