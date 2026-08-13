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
    <PageShell eyebrow="Admin" title="Escento admin" body="Private moderation tools for Escento operators.">
      <AdminNav />
      <ModerationTodo />

      <dl className="grid border-y border-rule md:grid-cols-4 md:divide-x md:divide-rule">
        {stats.map(([label, value]) => (
          <div key={label} className="py-5 md:px-5">
            <dt className="text-meta uppercase text-muted">{label}</dt>
            <dd className="mt-3 text-section-heading text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Recent" title="Profiles">
          <div className="divide-y divide-rule border-y border-rule">
            {dashboard.recentProfiles.map((profile) => (
              <div key={profile.id} className="py-4">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{profile.displayName}</p>
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
          <div className="divide-y divide-rule border-y border-rule">
            {dashboard.recentGigs.map((gig) => (
              <div key={gig.id} className="py-4">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{gig.title}</p>
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
