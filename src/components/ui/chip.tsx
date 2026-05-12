type ChipTone = "blue" | "pink" | "gold" | "neutral";

const toneClass: Record<ChipTone, string> = {
  blue: "bg-[#0055FF]/10 text-[#0055FF]",
  pink: "bg-[#FF3366]/10 text-[#FF3366]",
  gold: "bg-[#FFB000]/10 text-[#8A5C00]",
  neutral: "bg-[#F1F5F9] text-[#475569]",
};

export function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: ChipTone;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${toneClass[tone]}`}>
      {children}
    </span>
  );
}

