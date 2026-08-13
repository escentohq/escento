type ChipTone = "blue" | "pink" | "gold" | "neutral";

const toneClass: Record<ChipTone, string> = {
  blue: "border-[#0055FF] text-[#0055FF]",
  pink: "border-[#FF3366] text-[#FF3366]",
  gold: "border-[#FFB000] text-[#7A5200]",
  neutral: "border-[#CBD5E1] text-[#475569]",
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
