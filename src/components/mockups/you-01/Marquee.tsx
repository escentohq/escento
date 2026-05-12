const ITEMS = ["Jazz", "Indie", "Hip-Hop", "Folk", "Electronic", "Classical", "Punk", "Soul"];

export function Marquee() {
  return (
    <div className="overflow-hidden border-b-2 border-neutral-900 bg-neutral-900 py-6 text-white">
      <div className="flex animate-[marquee_30s_linear_infinite] gap-12 whitespace-nowrap">
        {[...ITEMS, ...ITEMS, ...ITEMS].map((it, i) => (
          <span key={i} className="text-3xl font-bold italic">
            {it} ·
          </span>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
