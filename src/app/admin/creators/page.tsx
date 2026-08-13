import { AdminActionButton } from "@/components/admin/admin-action-button";
import {
  AdminNav,
  AdminSetupRequired,
  AdminUnavailable,
  DateValue,
  ModerationTodo,
  StatusCells,
} from "@/components/admin/admin-display";
import { PageShell } from "@/components/ui/page-shell";
import { getAdminAccess } from "@/lib/admin-auth";
import { listAdminCreators } from "@/lib/api/admin-dashboard";

export default async function AdminCreatorsPage() {
  const access = await getAdminAccess();
  if (!access.ok) return <AdminUnavailable reason={access.reason} />;
  let creators;
  try {
    creators = await listAdminCreators();
  } catch (error) {
    console.error("[admin] creator data failed", error);
    return <AdminSetupRequired />;
  }

  return (
    <PageShell
      eyebrow="Admin"
      title="Creator profiles"
      body="Creator profiles are represented by creator user accounts in this MVP."
    >
      <AdminNav />
      <ModerationTodo />
      <div className="overflow-x-auto  border border-[#F1F5F9] bg-white shadow-sm">
        <table className="w-full min-w-230 text-left text-sm">
          <thead className="bg-[#F8FAFC] text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Status</th>
              <th className="p-4">Gigs</th>
              <th className="p-4">Created</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {creators.map((creator) => (
              <tr key={creator.id} className="align-top">
                <td className="max-w-40 truncate p-4 font-mono text-xs text-[#64748B]">
                  {creator.id}
                </td>
                <td className="p-4 font-bold text-[#0F172A]">
                  {creator.name || "Unnamed creator"}
                </td>
                <td className="p-4 text-[#475569]">
                  {creator.email || "None"}
                </td>
                <td className="p-4">
                  <StatusCells
                    isPublic={creator.isPublic}
                    isVerified={creator.isVerified}
                    moderationStatus={creator.moderationStatus}
                  />
                </td>
                <td className="p-4 text-[#475569]">{creator.gigCount}</td>
                <td className="p-4 text-[#64748B]">
                  <DateValue value={creator.createdAt} />
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <AdminActionButton
                      targetType="creator_profile"
                      targetId={creator.id}
                      action={creator.isPublic === false ? "restore" : "hide"}
                      label={creator.isPublic === false ? "Restore" : "Hide"}
                    />
                    <AdminActionButton
                      targetType="creator_profile"
                      targetId={creator.id}
                      action={creator.isVerified ? "unverify" : "verify"}
                      label={creator.isVerified ? "Unverify" : "Verify"}
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
