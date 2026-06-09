import Link from "next/link";

import { Chip } from "@/components/ui/chip";

export function AdminNav({ supportBadgeCount = 0 }: { supportBadgeCount?: number } = {}) {
  const links = [
    ["/admin", "Dashboard"],
    ["/admin/users", "Users"],
    ["/admin/musicians", "Musicians"],
    ["/admin/creators", "Creators"],
    ["/admin/gigs", "Gigs"],
    ["/admin/taxonomy", "Taxonomy"],
    ["/admin/support", "Support"],
  ] as const;

  return (
    <div className="mb-8 flex gap-2 overflow-x-auto rounded-2xl border border-[#F1F5F9] bg-white p-2 shadow-sm">
      {links.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className="relative whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold text-[#475569] transition-colors hover:bg-[#F8FAFC] hover:text-[#0055FF]"
        >
          {label}
          {href === "/admin/support" && supportBadgeCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF3366] px-1.5 text-[10px] font-black leading-none text-white">
              {supportBadgeCount > 99 ? "99+" : supportBadgeCount}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

export function AdminUnavailable({ reason }: { reason: "signed_out" | "not_allowed" }) {
  return (
    <div className="bg-[#FAFAFA] px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-xl rounded-3xl border border-[#F1F5F9] bg-white p-8 text-center shadow-sm">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FF3366]">
          Admin
        </span>
        <h1 className="mt-3 text-3xl font-black text-[#0F172A]">Not authorized</h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-[#475569]">
          {reason === "signed_out"
            ? "Sign in with an approved admin email to view this page."
            : "Your account is not on the Motivo admin allowlist."}
        </p>
      </div>
    </div>
  );
}

export function AdminSetupRequired() {
  return (
    <div className="bg-[#FAFAFA] px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#F1F5F9] bg-white p-8 shadow-sm">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#FFB000]">
          Admin setup
        </span>
        <h1 className="mt-3 text-3xl font-black text-[#0F172A]">Admin database setup required</h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-[#475569]">
          The admin dashboard is isolated from the public app, but it needs the admin moderation migration before it can load moderation columns.
        </p>
        <div className="mt-5 rounded-2xl border border-[#F1F5F9] bg-[#F8FAFC] p-4 text-sm font-semibold text-[#334155]">
          Apply <code className="font-mono text-[#0055FF]">supabase/migrations/20260607002000_add_safe_admin_moderation.sql</code> and confirm the server has <code className="font-mono text-[#0055FF]">SUPABASE_SERVICE_ROLE_KEY</code> configured.
        </div>
        <p className="mt-4 text-xs font-medium leading-relaxed text-[#64748B]">
          Public user pages, gigs, messaging, onboarding, and normal auth flows are not changed by this admin setup.
        </p>
      </div>
    </div>
  );
}

export function ModerationTodo() {
  return (
    <div className="mb-6 rounded-2xl border border-[#FFB000]/30 bg-[#FFB000]/10 p-4 text-sm font-medium leading-relaxed text-[#8A5C00]">
      TODO: Public directory queries are intentionally unchanged for safety. Hide/restore writes admin metadata only until public filtering is explicitly added later.
    </div>
  );
}

export function StatusCells({
  isPublic,
  isVerified,
  moderationStatus,
}: {
  isPublic?: boolean | null;
  isVerified?: boolean | null;
  moderationStatus?: string | null;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip tone={isPublic === false ? "pink" : "blue"}>{isPublic === false ? "Hidden" : "Public"}</Chip>
      <Chip tone={isVerified ? "blue" : "neutral"}>{isVerified ? "Verified" : "Unverified"}</Chip>
      {moderationStatus ? <Chip tone={moderationStatus === "hidden" ? "pink" : "neutral"}>{moderationStatus}</Chip> : null}
    </div>
  );
}

export function Preview({ value }: { value?: string | null }) {
  if (!value) return <span className="text-[#94A3B8]">None</span>;
  return <span>{value.length > 120 ? `${value.slice(0, 120)}...` : value}</span>;
}

export function DateValue({ value }: { value?: string | null }) {
  if (!value) return <span className="text-[#94A3B8]">Unknown</span>;
  return <time dateTime={value}>{new Date(value).toLocaleDateString()}</time>;
}
