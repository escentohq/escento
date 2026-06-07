import { AdminActionForm } from "@/components/admin/admin-action-form";
import { AdminStatus, AdminTabs, DateText } from "@/components/admin/admin-ui";
import { PageShell } from "@/components/ui/page-shell";
import { requireAdmin } from "@/lib/auth-guards";
import { listAdminCreatorProfiles } from "@/lib/api/admin";

export default async function AdminCreatorsPage() {
  await requireAdmin("/admin/creators");
  const creators = await listAdminCreatorProfiles();

  return (
    <PageShell eyebrow="Admin" title="Creator profiles" body="Moderate creator accounts and profile visibility.">
      <AdminTabs />
      <div className="overflow-x-auto rounded-3xl border border-[#F1F5F9] bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[#F8FAFC] text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email / user</th>
              <th className="p-4">Profile type</th>
              <th className="p-4">Status</th>
              <th className="p-4">Gigs</th>
              <th className="p-4">Created</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {creators.map((creator) => (
              <tr key={creator.id} className="align-top">
                <td className="p-4 font-black text-[#0F172A]">{creator.name || "Unnamed creator"}</td>
                <td className="p-4 text-[#475569]">{creator.email || creator.id}</td>
                <td className="p-4 text-[#475569]">{creator.profileType}</td>
                <td className="p-4"><AdminStatus isPublic={creator.isPublic} isVerified={creator.isVerified} suspendedAt={creator.suspendedAt} /></td>
                <td className="p-4 text-[#475569]">{creator.gigCount}</td>
                <td className="p-4 text-[#64748B]"><DateText value={creator.createdAt} /></td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <AdminActionForm targetType="creator_profile" targetId={creator.id} action={creator.isPublic ? "hide" : "restore"} label={creator.isPublic ? "Hide" : "Restore"} needsReason={creator.isPublic} />
                    <AdminActionForm targetType="creator_profile" targetId={creator.id} action={creator.isVerified ? "unverify" : "verify"} label={creator.isVerified ? "Unverify" : "Verify"} needsReason={creator.isVerified} />
                    <AdminActionForm targetType="creator_profile" targetId={creator.id} action={creator.suspendedAt ? "unsuspend" : "suspend"} label={creator.suspendedAt ? "Unsuspend" : "Suspend"} destructive={!creator.suspendedAt} needsReason={!creator.suspendedAt} />
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
