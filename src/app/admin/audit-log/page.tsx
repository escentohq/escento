import { AdminTabs, DateText } from "@/components/admin/admin-ui";
import { PageShell } from "@/components/ui/page-shell";
import { requireAdmin } from "@/lib/auth-guards";
import { listAdminAuditLog } from "@/lib/api/admin";

export default async function AdminAuditLogPage() {
  await requireAdmin("/admin/audit-log");
  const logs = await listAdminAuditLog();

  return (
    <PageShell eyebrow="Admin" title="Audit log" body="Recent moderation actions taken by Motivo admins.">
      <AdminTabs />
      <div className="overflow-x-auto rounded-3xl border border-[#F1F5F9] bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[#F8FAFC] text-xs font-black uppercase tracking-[0.14em] text-[#64748B]">
            <tr>
              <th className="p-4">Time</th>
              <th className="p-4">Admin</th>
              <th className="p-4">Action</th>
              <th className="p-4">Target</th>
              <th className="p-4">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="p-4 text-[#64748B]"><DateText value={log.createdAt} /></td>
                <td className="p-4 font-bold text-[#0F172A]">{log.adminName || log.adminEmail || log.adminUserId}</td>
                <td className="p-4 text-[#475569]">{log.action}</td>
                <td className="p-4 text-[#475569]">{log.targetType}: {log.targetId}</td>
                <td className="p-4 text-[#475569]">{log.reason || "No reason provided"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
