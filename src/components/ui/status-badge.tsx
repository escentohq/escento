import { gigStatusLabel } from "@/lib/display";

export function StatusBadge({ status }: { status: string }) {
  const closed = status === "CLOSED";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${closed ? "bg-[#FF3366]/10 text-[#FF3366]" : "bg-[#0055FF]/10 text-[#0055FF]"}`}>
      {gigStatusLabel(status)}
    </span>
  );
}

