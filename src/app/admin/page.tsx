import Link from "next/link";

import { AdminTabs, DateText, PreviewText } from "@/components/admin/admin-ui";
import { PageShell } from "@/components/ui/page-shell";
import { Reveal } from "@/components/ui/reveal";
import { SectionCard } from "@/components/ui/section-card";
import { requireAdmin } from "@/lib/auth-guards";
import { getAdminDashboard } from "@/lib/api/admin";

export default async function AdminDashboardPage() {
  await requireAdmin("/admin");
  const dashboard = await getAdminDashboard();

  const stats = [
    ["Total users", dashboard.totalUsers],
    ["Musician profiles", dashboard.totalMusicianProfiles],
    ["Creator profiles", dashboard.totalCreatorProfiles],
    ["Gigs", dashboard.totalGigs],
  ] as const;

  return (
    <PageShell
      eyebrow="Admin"
      title="Moderation dashboard"
      body="Review public content, account status, and recent activity across Motivo."
    >
      <AdminTabs />

      <Reveal>
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-[#F1F5F9] bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#64748B]">{label}</p>
              <p className="mt-3 text-3xl font-black text-[#0F172A]">{value}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SectionCard eyebrow="Recent" title="Musician profiles">
          <div className="space-y-4">
            {dashboard.recentProfiles.map((profile) => (
              <Link key={profile.id} href="/admin/musicians" className="block rounded-2xl border border-[#F1F5F9] p-4 transition-colors hover:border-[#0055FF]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-black text-[#0F172A]">{profile.displayName}</p>
                    <p className="mt-1 text-sm text-[#64748B]">{profile.email || profile.userId}</p>
                  </div>
                  <span className="text-xs font-bold text-[#64748B]"><DateText value={profile.createdAt} /></span>
                </div>
                <p className="mt-3 text-sm text-[#475569]"><PreviewText value={profile.bio} /></p>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Recent" title="Gig posts">
          <div className="space-y-4">
            {dashboard.recentGigs.map((gig) => (
              <Link key={gig.id} href="/admin/gigs" className="block rounded-2xl border border-[#F1F5F9] p-4 transition-colors hover:border-[#0055FF]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-black text-[#0F172A]">{gig.title}</p>
                    <p className="mt-1 text-sm text-[#64748B]">{gig.creatorEmail || gig.creatorId}</p>
                  </div>
                  <span className="text-xs font-bold text-[#64748B]"><DateText value={gig.createdAt} /></span>
                </div>
                <p className="mt-3 text-sm text-[#475569]"><PreviewText value={gig.description} /></p>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
