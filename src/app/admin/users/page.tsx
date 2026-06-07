import { AdminNav, AdminSetupRequired, AdminUnavailable, DateValue, ModerationTodo, StatusCells } from "@/components/admin/admin-display";
import { AdminActionButton } from "@/components/admin/admin-action-button";
import { PageShell } from "@/components/ui/page-shell";
import { getAdminAccess } from "@/lib/admin-auth";
import { listAdminUsers } from "@/lib/api/admin-dashboard";

export default async function AdminUsersPage() {
  const access = await getAdminAccess();
  if (!access.ok) return <AdminUnavailable reason={access.reason} />;
  let users;
  try {
    users = await listAdminUsers();
  } catch (error) {
    console.error("[admin] users data failed", error);
    return <AdminSetupRequired />;
  }

  return (
    <PageShell eyebrow="Admin" title="Users" body="View Motivo user accounts and admin moderation metadata.">
      <AdminNav />
      <ModerationTodo />
      <div className="overflow-x-auto rounded-3xl border border-[#F1F5F9] bg-white shadow-sm">
        <table className="w-full min-w-[940px] text-left text-sm">
          <thead className="bg-[#F8FAFC] text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
            <tr><th className="p-4">ID</th><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Created</th><th className="p-4">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {users.map((user) => (
              <tr key={user.id} className="align-top">
                <td className="max-w-[160px] truncate p-4 font-mono text-xs text-[#64748B]">{user.id}</td>
                <td className="p-4 font-bold text-[#0F172A]">{user.name || "Unnamed"}</td>
                <td className="p-4 text-[#475569]">{user.email || "None"}</td>
                <td className="p-4 text-[#475569]">{user.role || "No role"}</td>
                <td className="p-4"><StatusCells isPublic={user.isPublic} isVerified={user.isVerified} moderationStatus={user.moderationStatus} /></td>
                <td className="p-4 text-[#64748B]"><DateValue value={user.createdAt} /></td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <AdminActionButton targetType="user" targetId={user.id} action={user.isPublic === false ? "restore" : "hide"} label={user.isPublic === false ? "Restore" : "Hide"} />
                    <AdminActionButton targetType="user" targetId={user.id} action={user.isVerified ? "unverify" : "verify"} label={user.isVerified ? "Unverify" : "Verify"} />
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
