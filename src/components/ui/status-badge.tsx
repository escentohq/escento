import { gigStatusLabel } from "@/lib/display";

export function StatusBadge({ status }: { status: string }) {
  const closed = status === "CLOSED";
  return (
    <span className={`inline-flex items-center border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${closed ? "border-[#FF3366] text-[#FF3366]" : "border-[#0055FF] text-[#0055FF]"}`}>
      {gigStatusLabel(status)}
    </span>
  );
}
