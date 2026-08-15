import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendResendEmail } from "@/lib/resend-email";

type ReportEmailPayload = {
  reportId: string;
  reporterId: string;
  reporterEmail: string | null;
  reporterName: string | null;
  targetType: "musician_profile" | "gig";
  targetId: string;
  targetLabel: string;
  subject: string;
  description: string;
  evidence: string | null;
  submittedAt: string;
};

type ReportEmailResult =
  | { ok: true }
  | { ok: false; reason: "missing_destination" | "delivery_not_configured" | "delivery_failed" };

const DEFAULT_FROM = "Escento Reports <onboarding@resend.dev>";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatReportText(payload: ReportEmailPayload) {
  return [
    "A new Escento report was submitted.",
    "",
    `Report ID: ${payload.reportId}`,
    `Target: ${payload.targetType} ${payload.targetId}`,
    `Target label: ${payload.targetLabel}`,
    `Reporter: ${payload.reporterName || "Unnamed"} <${payload.reporterEmail || "No email"}>`,
    `Reporter ID: ${payload.reporterId}`,
    `Submitted at: ${payload.submittedAt}`,
    "",
    "Subject:",
    payload.subject,
    "",
    "Description:",
    payload.description,
    "",
    "Evidence:",
    payload.evidence || "None provided",
  ].join("\n");
}

function formatReportHtml(payload: ReportEmailPayload) {
  return [
    "<p>A new Escento report was submitted.</p>",
    `<p><strong>Report ID:</strong> ${escapeHtml(payload.reportId)}</p>`,
    `<p><strong>Target:</strong> ${escapeHtml(payload.targetType)} ${escapeHtml(payload.targetId)}</p>`,
    `<p><strong>Target label:</strong> ${escapeHtml(payload.targetLabel)}</p>`,
    `<p><strong>Reporter:</strong> ${escapeHtml(payload.reporterName || "Unnamed")} &lt;${escapeHtml(payload.reporterEmail || "No email")}&gt;</p>`,
    `<p><strong>Reporter ID:</strong> ${escapeHtml(payload.reporterId)}</p>`,
    `<p><strong>Submitted at:</strong> ${escapeHtml(payload.submittedAt)}</p>`,
    "<hr />",
    `<p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>`,
    "<p><strong>Description:</strong></p>",
    `<p style="white-space:pre-wrap">${escapeHtml(payload.description)}</p>`,
    "<p><strong>Evidence:</strong></p>",
    `<p style="white-space:pre-wrap">${escapeHtml(payload.evidence || "None provided")}</p>`,
  ].join("\n");
}

export async function sendReportEmail(payload: ReportEmailPayload): Promise<ReportEmailResult> {
  const destination = process.env.SUPPORT_EMAIL;
  if (!destination) {
    console.error("[report-email] SUPPORT_EMAIL is not configured.");
    return { ok: false, reason: "missing_destination" };
  }

  const result = await sendResendEmail({
    from: process.env.SUPPORT_FROM_EMAIL || DEFAULT_FROM,
    to: destination,
    replyTo: payload.reporterEmail || destination,
    subject: `[Escento Report] ${payload.subject}`,
    text: formatReportText(payload),
    html: formatReportHtml(payload),
  });

  if (!result.ok) {
    console.error("[report-email] delivery failed:", result.reason);
  }

  return result;
}

export async function queueReportEmail(reportId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: report, error } = await supabase
    .from("content_reports")
    .select(
      "id, reporter_id, target_type, target_id, subject, description, evidence, created_at, reporter:app_user!content_reports_reporter_id_fkey(email, name)",
    )
    .eq("id", reportId)
    .single();

  if (error) {
    console.error("[report-email] report lookup failed", error);
    return;
  }
  const reporter = Array.isArray(report.reporter) ? report.reporter[0] : report.reporter;

  let targetLabel = "Unknown target";
  if (report.target_type === "musician_profile") {
    const { data } = await supabase
      .from("musician_profile")
      .select("display_name")
      .eq("id", report.target_id)
      .maybeSingle();
    targetLabel = data?.display_name ?? targetLabel;
  } else {
    const { data } = await supabase
      .from("gig")
      .select("title")
      .eq("id", report.target_id)
      .maybeSingle();
    targetLabel = data?.title ?? targetLabel;
  }

  const result = await sendReportEmail({
    reportId: report.id,
    reporterId: report.reporter_id,
    reporterEmail: reporter?.email ?? null,
    reporterName: reporter?.name ?? null,
    targetType: report.target_type,
    targetId: report.target_id,
    targetLabel,
    subject: report.subject,
    description: report.description,
    evidence: report.evidence ?? null,
    submittedAt: report.created_at,
  });

  if (!result.ok) {
    console.error("[report-email] report notification failed", result.reason);
  }
}
