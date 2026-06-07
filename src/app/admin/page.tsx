import { AdminNav, AdminSetupRequired, AdminUnavailable, DateValue, ModerationTodo, Preview } from "@/components/admin/admin-display";
import { PageShell } from "@/components/ui/page-shell";
import { SectionCard } from "@/components/ui/section-card";
import { getAdminAccess } from "@/lib/admin-auth";
import { getAdminDashboardData } from "@/lib/api/admin-dashboard";

export default async function AdminDashboardPage() {
  const access = await getAdminAccess();
  if (!access.ok) return <AdminUnavailable reason={access.reason} />;

  let dashboard;
  try {
    dashboard = await getAdminDashboardData();
  } catch (error) {
    console.error("[admin] dashboard data failed", error);
    return <AdminSetupRequired />;
  }
  const stats = [
    ["Total users", dashboard.totalUsers],
    ["Musician profiles", dashboard.totalMusicianProfiles],
    ["Creator profiles", dashboard.totalCreatorProfiles],
    ["Gigs", dashboard.totalGigs],
  ] as const;

  return (
    <PageShell eyebrow="Admin" title="Motivo admin" body="Private moderation tools for Motivo operators.">
      <AdminNav />
      <ModerationTodo />

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[#F1F5F9] bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#64748B]">{label}</p>
            <p className="mt-3 text-3xl font-black text-[#0F172A]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Recent" title="Profiles">
          <div className="space-y-4">
            {dashboard.recentProfiles.map((profile) => (
              <div key={profile.id} className="rounded-2xl border border-[#F1F5F9] p-4">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-black text-[#0F172A]">{profile.displayName}</p>
                    <p className="mt-1 text-xs text-[#64748B]">{profile.email || profile.userId}</p>
                  </div>
                  <span className="text-xs font-bold text-[#64748B]"><DateValue value={profile.createdAt} /></span>
                </div>
                <p className="mt-3 text-sm text-[#475569]"><Preview value={profile.bio} /></p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Recent" title="Gigs">
          <div className="space-y-4">
            {dashboard.recentGigs.map((gig) => (
              <div key={gig.id} className="rounded-2xl border border-[#F1F5F9] p-4">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-black text-[#0F172A]">{gig.title}</p>
                    <p className="mt-1 text-xs text-[#64748B]">{gig.creatorEmail || gig.creatorId}</p>
                  </div>
                  <span className="text-xs font-bold text-[#64748B]"><DateValue value={gig.createdAt} /></span>
                </div>
                <p className="mt-3 text-sm text-[#475569]"><Preview value={gig.description} /></p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
