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
import { listAdminMusicians } from "@/lib/api/admin-dashboard";

export default async function AdminMusiciansPage() {
  const access = await getAdminAccess();
  if (!access.ok) return <AdminUnavailable reason={access.reason} />;
  let profiles;
  try {
    profiles = await listAdminMusicians();
  } catch (error) {
    console.error("[admin] musician data failed", error);
    return <AdminSetupRequired />;
  }

  return (
    <PageShell
      eyebrow="Admin"
      title="Musician profiles"
      body="Review musician profile content without changing public app behavior."
    >
      <AdminNav />
      <ModerationTodo />
      <div className="overflow-x-auto rounded-3xl border border-[#F1F5F9] bg-white shadow-sm">
        <table className="w-full min-w-260 text-left text-sm">
          <thead className="bg-[#F8FAFC] text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Status</th>
              <th className="p-4">Bio</th>
              <th className="p-4">Created</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {profiles.map((profile) => (
              <tr key={profile.id} className="align-top">
                <td className="max-w-40 truncate p-4 font-mono text-xs text-[#64748B]">
                  {profile.id}
                </td>
                <td className="p-4 font-bold text-[#0F172A]">
                  {profile.displayName}
                </td>
                <td className="p-4 text-[#475569]">
                  {profile.email || profile.userId}
                </td>
                <td className="p-4">
                  <StatusCells
                    isPublic={profile.isPublic}
                    isVerified={profile.isVerified}
                    moderationStatus={profile.moderationStatus}
                  />
                </td>
                <td className="max-w-xs p-4 text-[#475569]">
                  <Preview value={profile.bio} />
                </td>
                <td className="p-4 text-[#64748B]">
                  <DateValue value={profile.createdAt} />
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <AdminActionButton
                      targetType="musician_profile"
                      targetId={profile.id}
                      action={profile.isPublic === false ? "restore" : "hide"}
                      label={profile.isPublic === false ? "Restore" : "Hide"}
                    />
                    <AdminActionButton
                      targetType="musician_profile"
                      targetId={profile.id}
                      action={profile.isVerified ? "unverify" : "verify"}
                      label={profile.isVerified ? "Unverify" : "Verify"}
                    />
                    <AdminActionButton
                      targetType="musician_profile"
                      targetId={profile.id}
                      action="clear_text"
                      label="Clear bio"
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
