import { AdminActionForm } from "@/components/admin/admin-action-form";
import { AdminStatus, AdminTabs, DateText } from "@/components/admin/admin-ui";
import { PageShell } from "@/components/ui/page-shell";
import { requireAdmin } from "@/lib/auth-guards";
import { listAdminUsers } from "@/lib/api/admin";

export default async function AdminUsersPage() {
  await requireAdmin("/admin/users");
  const users = await listAdminUsers();

  return (
    <PageShell eyebrow="Admin" title="User accounts" body="Review account roles, suspension state, and public account status.">
      <AdminTabs />
      <div className="overflow-x-auto rounded-3xl border border-[#F1F5F9] bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-[#F8FAFC] text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email / ID</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
              <th className="p-4">Updated</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {users.map((user) => (
              <tr key={user.id} className="align-top">
                <td className="p-4 font-black text-[#0F172A]">{user.name || "Unnamed user"}{user.isAdmin ? " (admin)" : ""}</td>
                <td className="p-4 text-[#475569]">{user.email || user.id}</td>
                <td className="p-4 text-[#475569]">{user.role || "No role"}</td>
                <td className="p-4"><AdminStatus isPublic={user.isPublic} isVerified={user.isVerified} suspendedAt={user.suspendedAt} /></td>
                <td className="p-4 text-[#64748B]"><DateText value={user.createdAt} /></td>
                <td className="p-4 text-[#64748B]"><DateText value={user.updatedAt} /></td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <AdminActionForm targetType="user" targetId={user.id} action={user.isPublic ? "hide" : "restore"} label={user.isPublic ? "Hide" : "Restore"} needsReason={user.isPublic} />
                    <AdminActionForm targetType="user" targetId={user.id} action={user.isVerified ? "unverify" : "verify"} label={user.isVerified ? "Unverify" : "Verify"} needsReason={user.isVerified} />
                    <AdminActionForm targetType="user" targetId={user.id} action={user.suspendedAt ? "unsuspend" : "suspend"} label={user.suspendedAt ? "Unsuspend" : "Suspend"} destructive={!user.suspendedAt} needsReason={!user.suspendedAt} />
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
