import { Suspense } from "react";

import { AdminNavLinks } from "@/components/admin/admin-nav-links";
import { Chip } from "@/components/ui/chip";
import { getOpenReportCount } from "@/lib/api/reports";

function adminLinks({
  reportsBadgeCount = 0,
  supportBadgeCount = 0,
}: { reportsBadgeCount?: number; supportBadgeCount?: number }) {
  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/musicians", label: "Musicians" },
    { href: "/admin/creators", label: "Creators" },
    { href: "/admin/gigs", label: "Gigs" },
    { href: "/admin/reports", label: "Reports", badgeCount: reportsBadgeCount },
    { href: "/admin/taxonomy", label: "Taxonomy" },
    { href: "/admin/support", label: "Support", badgeCount: supportBadgeCount },
  ];

  return <AdminNavLinks links={links} />;
}

/**
 * The nav renders on every admin page and used to block it on a report count query.
 * The links paint with a zero badge, then the real count streams in behind Suspense.
 */
async function AdminNavWithReportCount({ supportBadgeCount }: { supportBadgeCount: number }) {
  let reportsBadgeCount = 0;
  try {
    reportsBadgeCount = await getOpenReportCount();
  } catch (error) {
    console.error("[admin] report badge count failed", error);
  }

  return adminLinks({ reportsBadgeCount, supportBadgeCount });
}

export function AdminNav({
  supportBadgeCount = 0,
}: { supportBadgeCount?: number } = {}) {
  return (
    <Suspense fallback={adminLinks({ supportBadgeCount })}>
      <AdminNavWithReportCount supportBadgeCount={supportBadgeCount} />
    </Suspense>
  );
}

export function AdminUnavailable({
  reason,
}: {
  reason: "signed_out" | "not_allowed";
}) {
  return (
    <div className="bg-[#FAFAFA] px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-xl border-y border-rule py-8">
        <span className="text-meta uppercase text-muted">
          Admin
        </span>
        <h1 className="mt-3 text-page-title text-ink">
          Not authorized
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-[#475569]">
          {reason === "signed_out"
            ? "Sign in with an approved admin email to view this page."
            : "Your account is not on the Escento admin allowlist."}
        </p>
      </div>
    </div>
  );
}

export function AdminSetupRequired() {
  return (
    <div className="bg-[#FAFAFA] px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl border-y border-rule py-8">
        <span className="text-meta uppercase text-muted">
          Admin setup
        </span>
        <h1 className="mt-3 text-page-title text-ink">
          Admin database setup required
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-[#475569]">
          The admin dashboard is isolated from the public app, but it needs the
          admin moderation migration before it can load moderation columns.
        </p>
        <div className="mt-5 border-y border-rule py-4 text-secondary font-semibold text-[#334155]">
          Apply{" "}
          <code className="font-mono text-[#0055FF]">
            supabase/migrations/20260607002000_add_safe_admin_moderation.sql
          </code>{" "}
          and confirm the server has{" "}
          <code className="font-mono text-[#0055FF]">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{" "}
          configured.
        </div>
      </div>
    </div>
  );
}

export function ModerationVisibilityNotice() {
  return (
    <div className="mb-6 border-l-4 border-brand px-4 py-3 text-secondary text-[#334155]">
      Hide removes the selected account or listing from anonymous marketplace
      reads. Restore republishes it when both the account and listing are active.
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
      <Chip tone={isPublic === false ? "pink" : "blue"}>
        {isPublic === false ? "Hidden" : "Public"}
      </Chip>
      <Chip tone={isVerified ? "blue" : "neutral"}>
        {isVerified ? "Verified" : "Unverified"}
      </Chip>
      {moderationStatus ? (
        <Chip tone={moderationStatus === "hidden" ? "pink" : "neutral"}>
          {moderationStatus}
        </Chip>
      ) : null}
    </div>
  );
}

export function Preview({ value }: { value?: string | null }) {
  if (!value) return <span className="text-[#94A3B8]">None</span>;
  return (
    <span>{value.length > 120 ? `${value.slice(0, 120)}...` : value}</span>
  );
}

export function DateValue({ value }: { value?: string | null }) {
  if (!value) return <span className="text-[#94A3B8]">Unknown</span>;
  return <time dateTime={value}>{new Date(value).toLocaleDateString()}</time>;
}
