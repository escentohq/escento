import Link from "next/link";

import { AdminActionButton } from "@/components/admin/admin-action-button";
import {
  AdminNav,
  AdminSetupRequired,
  AdminUnavailable,
  DateValue,
  ModerationTodo,
  Preview,
  StatusCells,
} from "@/components/admin/admin-display";
import { PageShell } from "@/components/ui/page-shell";
import { getAdminAccess } from "@/lib/admin-auth";
import { listAdminGigs } from "@/lib/api/admin-dashboard";

export default async function AdminGigsPage() {
  const access = await getAdminAccess();
  if (!access.ok) return <AdminUnavailable reason={access.reason} />;
  let gigs;
  try {
    gigs = await listAdminGigs();
  } catch (error) {
    console.error("[admin] gig data failed", error);
    return <AdminSetupRequired />;
  }

  return (
    <PageShell
      eyebrow="Admin"
      title="Gigs"
      body="Review gig listings and mark moderation metadata."
    >
      <AdminNav />
      <ModerationTodo />
      <div className="overflow-x-auto rounded-3xl border border-[#F1F5F9] bg-white shadow-sm">
        <table className="w-full min-w-270 text-left text-sm">
          <thead className="bg-[#F8FAFC] text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Title</th>
              <th className="p-4">Creator</th>
              <th className="p-4">Status</th>
              <th className="p-4">Description</th>
              <th className="p-4">Created</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {gigs.map((gig) => (
              <tr key={gig.id} className="align-top">
                <td className="max-w-40 truncate p-4 font-mono text-xs text-[#64748B]">
                  {gig.id}
                </td>
                <td className="p-4 font-bold text-[#0F172A]">{gig.title}</td>
                <td className="p-4 text-[#475569]">
                  {gig.creatorName || gig.creatorEmail || gig.creatorId}
                </td>
                <td className="p-4">
                  <StatusCells
                    isPublic={gig.isPublic}
                    isVerified={gig.isVerified}
                    moderationStatus={gig.moderationStatus}
                  />
                </td>
                <td className="max-w-xs p-4 text-[#475569]">
                  <Preview value={gig.description} />
                </td>
                <td className="p-4 text-[#64748B]">
                  <DateValue value={gig.createdAt} />
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/gigs/${gig.id}/edit`}
                      className="inline-flex min-h-9 items-center rounded-full border border-[#E2E8F0] px-3 text-xs font-bold text-[#0F172A] transition-colors hover:border-[#0055FF] hover:text-[#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
                    >
                      Edit full gig
                    </Link>
                    <AdminActionButton
                      targetType="gig"
                      targetId={gig.id}
                      action={gig.isPublic === false ? "restore" : "hide"}
                      label={gig.isPublic === false ? "Restore" : "Hide"}
                    />
                    <AdminActionButton
                      targetType="gig"
                      targetId={gig.id}
                      action={gig.isVerified ? "unverify" : "verify"}
                      label={gig.isVerified ? "Unverify" : "Verify"}
                    />
                    <AdminActionButton
                      targetType="gig"
                      targetId={gig.id}
                      action="clear_text"
                      label="Clear description"
                      needsText
                      tone="danger"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
