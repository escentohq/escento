import Link from "next/link";

import { Chip } from "@/components/ui/chip";

export function AdminTabs() {
  const links = [
    ["/admin", "Dashboard"],
    ["/admin/musicians", "Musicians"],
    ["/admin/creators", "Creators"],
    ["/admin/gigs", "Gigs"],
    ["/admin/users", "Users"],
    ["/admin/audit-log", "Audit Log"],
  ] as const;

  return (
    <div className="mb-8 flex gap-2 overflow-x-auto rounded-2xl border border-[#F1F5F9] bg-white p-2 shadow-sm">
      {links.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold text-[#475569] transition-colors hover:bg-[#F8FAFC] hover:text-[#0055FF]"
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

export function AdminStatus({
  isPublic,
  isVerified,
  suspendedAt,
}: {
  isPublic?: boolean;
  isVerified?: boolean;
  suspendedAt?: string | null;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip tone={isPublic === false ? "pink" : "blue"}>{isPublic === false ? "Hidden" : "Public"}</Chip>
      <Chip tone={isVerified === false ? "gold" : "blue"}>{isVerified === false ? "Unverified" : "Verified"}</Chip>
      {suspendedAt ? <Chip tone="pink">Suspended</Chip> : null}
    </div>
  );
}

export function PreviewText({ value }: { value?: string | null }) {
  if (!value) return <span className="text-[#94A3B8]">None</span>;
  return <span>{value.length > 120 ? `${value.slice(0, 120)}...` : value}</span>;
}

export function DateText({ value }: { value?: string | null }) {
  if (!value) return <span className="text-[#94A3B8]">Unknown</span>;
  return <time dateTime={value}>{new Date(value).toLocaleDateString()}</time>;
}
