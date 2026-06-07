import Link from "next/link";

import { AdminActionForm } from "@/components/admin/admin-action-form";
import { AdminStatus, AdminTabs, DateText, PreviewText } from "@/components/admin/admin-ui";
import { PageShell } from "@/components/ui/page-shell";
import { requireAdmin } from "@/lib/auth-guards";
import { listAdminMusicianProfiles } from "@/lib/api/admin";

export default async function AdminMusiciansPage() {
  await requireAdmin("/admin/musicians");
  const profiles = await listAdminMusicianProfiles();

  return (
    <PageShell eyebrow="Admin" title="Musician profiles" body="Hide, verify, review, or clean public musician profiles.">
      <AdminTabs />
      <div className="overflow-x-auto rounded-3xl border border-[#F1F5F9] bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-[#F8FAFC] text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email / user</th>
              <th className="p-4">Status</th>
              <th className="p-4">Bio preview</th>
              <th className="p-4">Created</th>
              <th className="p-4">Updated</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {profiles.map((profile) => (
              <tr key={profile.id} className="align-top">
                <td className="p-4 font-black text-[#0F172A]">{profile.displayName}</td>
                <td className="p-4 text-[#475569]">{profile.email || profile.userId}</td>
                <td className="p-4"><AdminStatus isPublic={profile.isPublic} isVerified={profile.isVerified} /></td>
                <td className="max-w-xs p-4 text-[#475569]"><PreviewText value={profile.bio} /></td>
                <td className="p-4 text-[#64748B]"><DateText value={profile.createdAt} /></td>
                <td className="p-4 text-[#64748B]"><DateText value={profile.updatedAt} /></td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/musicians/${profile.id}`} className="inline-flex min-h-9 items-center rounded-full border border-[#E2E8F0] px-3 text-xs font-bold text-[#0F172A] hover:border-[#0055FF] hover:text-[#0055FF]">View</Link>
                    <AdminActionForm targetType="musician_profile" targetId={profile.id} action={profile.isPublic ? "hide" : "restore"} label={profile.isPublic ? "Hide" : "Restore"} needsReason={profile.isPublic} />
                    <AdminActionForm targetType="musician_profile" targetId={profile.id} action={profile.isVerified ? "unverify" : "verify"} label={profile.isVerified ? "Unverify" : "Verify"} needsReason={profile.isVerified} />
                    <AdminActionForm targetType="musician_profile" targetId={profile.id} action="clear_text" label="Clear bio" needsReason needsText />
                    <AdminActionForm targetType="musician_profile" targetId={profile.id} action="delete" label="Soft delete" destructive needsReason confirmationPhrase="DELETE" />
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
