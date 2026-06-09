import Link from "next/link";

import { adminUpdateReportStatusAction } from "@/app/admin/actions";
import { AdminNav, AdminSetupRequired, AdminUnavailable, DateValue } from "@/components/admin/admin-display";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/empty-state";
import { PageShell } from "@/components/ui/page-shell";
import { getAdminAccess } from "@/lib/admin-auth";
import { listAdminReports, type AdminReportRow, type ReportStatus } from "@/lib/api/reports";

function statusTone(status: ReportStatus) {
  if (status === "open") return "pink";
  if (status === "reviewing") return "gold";
  if (status === "resolved") return "blue";
  return "neutral";
}

function targetTypeLabel(type: AdminReportRow["targetType"]) {
  return type === "gig" ? "Gig" : "Musician profile";
}

function ReportStatusForm({
  reportId,
  status,
  label,
}: {
  reportId: string;
  status: ReportStatus;
  label: string;
}) {
  return (
    <form action={adminUpdateReportStatusAction} className="flex min-w-45 flex-1 gap-2">
      <input type="hidden" name="reportId" value={reportId} />
      <input type="hidden" name="status" value={status} />
      <label htmlFor={`${reportId}-${status}-note`} className="sr-only">
        Admin note
      </label>
      <input
        id={`${reportId}-${status}-note`}
        name="note"
        placeholder="Optional note"
        className="min-h-10 min-w-0 flex-1 rounded-full border border-[#E2E8F0] bg-white px-3 text-xs font-medium text-[#0F172A] shadow-sm focus:border-[#0055FF] focus:outline-none focus:ring-2 focus:ring-[#0055FF]/20"
      />
      <button
        type="submit"
        className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-[#E2E8F0] px-3 text-xs font-black text-[#0F172A] transition-colors hover:border-[#0055FF] hover:text-[#0055FF] focus-visible:outline-2 focus-visible:outline-[#0055FF] focus-visible:outline-offset-2"
      >
        {label}
      </button>
    </form>
  );
}

export default async function AdminReportsPage() {
  const access = await getAdminAccess();
  if (!access.ok) return <AdminUnavailable reason={access.reason} />;

  let reports: AdminReportRow[] = [];
  try {
    reports = await listAdminReports();
  } catch (error) {
    console.error("[admin] reports data failed", error);
    return <AdminSetupRequired />;
  }

  const activeCount = reports.filter((report) =>
    report.status === "open" || report.status === "reviewing"
  ).length;

  return (
    <PageShell
      eyebrow="Admin"
      title="Reports"
      body="Review reports submitted from musician profiles and gig pages."
    >
      <AdminNav />

      <div className="mb-6 rounded-3xl border border-[#F1F5F9] bg-white p-5 shadow-sm">
        <p className="text-sm font-bold text-[#0F172A]">
          {activeCount} report{activeCount === 1 ? "" : "s"} need review.
        </p>
        <p className="mt-1 text-sm font-medium text-[#64748B]">
          Reports are private to admins. Reported users do not see who submitted them.
        </p>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          eyebrow="Clear"
          title="No reports yet."
          body="New user reports will appear here and send an email notification."
        />
      ) : (
        <div className="space-y-5">
          {reports.map((report) => (
            <article
              key={report.id}
              className={`rounded-3xl border bg-white p-5 shadow-sm ${
                report.status === "open" || report.status === "reviewing"
                  ? "border-[#FF3366]/30"
                  : "border-[#F1F5F9]"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip tone={statusTone(report.status)}>{report.status}</Chip>
                    <Chip tone="neutral">{targetTypeLabel(report.targetType)}</Chip>
                  </div>
                  <h2 className="mt-3 text-xl font-black text-[#0F172A]">{report.subject}</h2>
                  <p className="mt-2 text-sm font-medium text-[#64748B]">
                    Reported{" "}
                    <Link
                      href={report.targetHref}
                      className="font-bold text-[#0055FF] hover:underline"
                    >
                      {report.targetLabel}
                    </Link>
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#94A3B8]">
                    Submitted <DateValue value={report.createdAt} />
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F8FAFC] p-4 text-sm">
                  <p className="font-black text-[#0F172A]">Reporter</p>
                  <p className="mt-1 font-medium text-[#475569]">
                    {report.reporterName || "Unnamed"}
                  </p>
                  <p className="mt-1 font-mono text-xs text-[#64748B]">
                    {report.reporterEmail || report.reporterId}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-[#F1F5F9] p-4">
                  <h3 className="text-sm font-black text-[#0F172A]">Explanation</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-relaxed text-[#475569]">
                    {report.description}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#F1F5F9] p-4">
                  <h3 className="text-sm font-black text-[#0F172A]">Evidence</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-relaxed text-[#475569]">
                    {report.evidence || "No evidence provided."}
                  </p>
                </div>
              </div>

              {report.adminNotes ? (
                <div className="mt-4 rounded-2xl bg-[#0055FF]/5 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0055FF]">
                    Admin note
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#475569]">{report.adminNotes}</p>
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                <ReportStatusForm reportId={report.id} status="reviewing" label="Reviewing" />
                <ReportStatusForm reportId={report.id} status="resolved" label="Resolve" />
                <ReportStatusForm reportId={report.id} status="dismissed" label="Dismiss" />
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
