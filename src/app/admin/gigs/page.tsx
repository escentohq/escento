import Link from "next/link";

import { AdminActionForm } from "@/components/admin/admin-action-form";
import { AdminStatus, AdminTabs, DateText, PreviewText } from "@/components/admin/admin-ui";
import { PageShell } from "@/components/ui/page-shell";
import { requireAdmin } from "@/lib/auth-guards";
import { listAdminGigs } from "@/lib/api/admin";

export default async function AdminGigsPage() {
  await requireAdmin("/admin/gigs");
  const gigs = await listAdminGigs();

  return (
    <PageShell eyebrow="Admin" title="Gig posts" body="Moderate public gig listings and project descriptions.">
      <AdminTabs />
      <div className="overflow-x-auto rounded-3xl border border-[#F1F5F9] bg-white shadow-sm">
        <table className="w-full min-w-[1040px] text-left text-sm">
          <thead className="bg-[#F8FAFC] text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Creator</th>
              <th className="p-4">Status</th>
              <th className="p-4">Description preview</th>
              <th className="p-4">Created</th>
              <th className="p-4">Updated</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {gigs.map((gig) => (
              <tr key={gig.id} className="align-top">
                <td className="p-4 font-black text-[#0F172A]">{gig.title}</td>
                <td className="p-4 text-[#475569]">{gig.creatorName || gig.creatorEmail || gig.creatorId}</td>
                <td className="p-4"><AdminStatus isPublic={gig.isPublic} isVerified={gig.isVerified} /></td>
                <td className="max-w-xs p-4 text-[#475569]"><PreviewText value={gig.description} /></td>
                <td className="p-4 text-[#64748B]"><DateText value={gig.createdAt} /></td>
                <td className="p-4 text-[#64748B]"><DateText value={gig.updatedAt} /></td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/gigs/${gig.id}`} className="inline-flex min-h-9 items-center rounded-full border border-[#E2E8F0] px-3 text-xs font-bold text-[#0F172A] hover:border-[#0055FF] hover:text-[#0055FF]">View</Link>
                    <AdminActionForm targetType="gig" targetId={gig.id} action={gig.isPublic ? "hide" : "restore"} label={gig.isPublic ? "Hide" : "Restore"} needsReason={gig.isPublic} />
                    <AdminActionForm targetType="gig" targetId={gig.id} action={gig.isVerified ? "unverify" : "verify"} label={gig.isVerified ? "Unverify" : "Verify"} needsReason={gig.isVerified} />
                    <AdminActionForm targetType="gig" targetId={gig.id} action="clear_text" label="Clear description" needsReason needsText />
                    <AdminActionForm targetType="gig" targetId={gig.id} action="delete" label="Soft delete" destructive needsReason confirmationPhrase="DELETE" />
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
