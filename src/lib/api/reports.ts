import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { queueReportEmail } from "@/lib/report-email";

export type ReportTargetType = "musician_profile" | "gig";
export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";

export type AdminReportRow = {
  id: string;
  reporterId: string;
  reporterEmail: string | null;
  reporterName: string | null;
  targetType: ReportTargetType;
  targetId: string;
  targetOwnerId: string | null;
  targetLabel: string;
  targetHref: string;
  subject: string;
  description: string;
  evidence: string | null;
  status: ReportStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

const SUBJECT_MAX_LENGTH = 140;
const DESCRIPTION_MAX_LENGTH = 4000;
const EVIDENCE_MAX_LENGTH = 2000;

function normalizeRequired(value: string, label: string, min: number, max: number) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length < min) {
    throw new Error(`${label} is too short.`);
  }
  if (normalized.length > max) {
    throw new Error(`${label} is too long.`);
  }
  return normalized;
}

function normalizeLongText(value: string, label: string, min: number, max: number) {
  const normalized = value.trim();
  if (normalized.length < min) {
    throw new Error(`${label} is too short.`);
  }
  if (normalized.length > max) {
    throw new Error(`${label} is too long.`);
  }
  return normalized;
}

function normalizeOptional(value: string, max: number) {
  const normalized = value.trim();
  if (!normalized) return null;
  if (normalized.length > max) {
    throw new Error("Evidence is too long.");
  }
  return normalized;
}

async function getReportTarget(targetType: ReportTargetType, targetId: string) {
  const supabase = createSupabaseAdminClient();

  if (targetType === "musician_profile") {
    const { data, error } = await supabase
      .from("musician_profile")
      .select("id, user_id, display_name")
      .eq("id", targetId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Profile not found.");

    return {
      id: data.id,
      ownerId: data.user_id,
      label: data.display_name,
      href: `/musicians/${data.id}`,
    };
  }

  const { data, error } = await supabase
    .from("gig")
    .select("id, creator_id, title")
    .eq("id", targetId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Gig not found.");

  return {
    id: data.id,
    ownerId: data.creator_id,
    label: data.title,
    href: `/gigs/${data.id}`,
  };
}

export async function createContentReport({
  reporterId,
  reporterRole,
  targetType,
  targetId,
  subject,
  description,
  evidence,
}: {
  reporterId: string;
  reporterRole: string | null | undefined;
  targetType: ReportTargetType;
  targetId: string;
  subject: string;
  description: string;
  evidence: string;
}) {
  if (targetType !== "musician_profile" && targetType !== "gig") {
    throw new Error("Invalid report target.");
  }

  if (targetType === "gig" && reporterRole !== "MUSICIAN") {
    throw new Error("Only musician accounts can report gigs.");
  }

  if (targetType === "musician_profile" && reporterRole !== "CREATOR") {
    throw new Error("Only creator accounts can report musician profiles.");
  }

  const target = await getReportTarget(targetType, targetId);
  if (target.ownerId === reporterId) {
    throw new Error("You cannot report your own content.");
  }

  const normalizedSubject = normalizeRequired(subject, "Subject", 3, SUBJECT_MAX_LENGTH);
  const normalizedDescription = normalizeLongText(
    description,
    "Explanation",
    10,
    DESCRIPTION_MAX_LENGTH,
  );
  const normalizedEvidence = normalizeOptional(evidence, EVIDENCE_MAX_LENGTH);

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("content_reports")
    .insert({
      reporter_id: reporterId,
      target_type: targetType,
      target_id: target.id,
      target_owner_id: target.ownerId,
      subject: normalizedSubject,
      description: normalizedDescription,
      evidence: normalizedEvidence,
      status: "open",
    })
    .select("id")
    .single();

  if (error) throw error;

  await queueReportEmail(data.id);
  return data.id as string;
}

function reportRow(raw: any, targetLabels: Map<string, string>): AdminReportRow {
  const targetLabel = targetLabels.get(`${raw.target_type}:${raw.target_id}`) ?? "Unknown target";
  const reporter = Array.isArray(raw.reporter) ? raw.reporter[0] : raw.reporter;
  return {
    id: raw.id,
    reporterId: raw.reporter_id,
    reporterEmail: reporter?.email ?? null,
    reporterName: reporter?.name ?? null,
    targetType: raw.target_type,
    targetId: raw.target_id,
    targetOwnerId: raw.target_owner_id ?? null,
    targetLabel,
    targetHref: raw.target_type === "musician_profile"
      ? `/musicians/${raw.target_id}`
      : `/gigs/${raw.target_id}`,
    subject: raw.subject,
    description: raw.description,
    evidence: raw.evidence ?? null,
    status: raw.status,
    adminNotes: raw.admin_notes ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    resolvedAt: raw.resolved_at ?? null,
  };
}

async function getTargetLabels(reports: any[]) {
  const supabase = createSupabaseAdminClient();
  const musicianIds = reports
    .filter((report) => report.target_type === "musician_profile")
    .map((report) => report.target_id);
  const gigIds = reports
    .filter((report) => report.target_type === "gig")
    .map((report) => report.target_id);

  const labels = new Map<string, string>();
  const [musicians, gigs] = await Promise.all([
    musicianIds.length
      ? supabase.from("musician_profile").select("id, display_name").in("id", musicianIds)
      : Promise.resolve({ data: [], error: null }),
    gigIds.length
      ? supabase.from("gig").select("id, title").in("id", gigIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (musicians.error) throw musicians.error;
  if (gigs.error) throw gigs.error;

  for (const profile of musicians.data ?? []) {
    labels.set(`musician_profile:${profile.id}`, profile.display_name);
  }
  for (const gig of gigs.data ?? []) {
    labels.set(`gig:${gig.id}`, gig.title);
  }

  return labels;
}

export async function listAdminReports(): Promise<AdminReportRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("content_reports")
    .select(
      "id, reporter_id, target_type, target_id, target_owner_id, subject, description, evidence, status, admin_notes, created_at, updated_at, resolved_at, reporter:app_user!content_reports_reporter_id_fkey(email, name)",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  const reports = data ?? [];
  const labels = await getTargetLabels(reports);
  return reports.map((report) => reportRow(report, labels));
}

export async function getOpenReportCount() {
  const supabase = createSupabaseAdminClient();
  const { count, error } = await supabase
    .from("content_reports")
    .select("id", { count: "exact", head: true })
    .in("status", ["open", "reviewing"]);

  if (error) throw error;
  return count ?? 0;
}

export async function updateReportStatus({
  adminUserId,
  adminEmail,
  reportId,
  status,
  note,
}: {
  adminUserId: string | null;
  adminEmail: string;
  reportId: string;
  status: ReportStatus;
  note: string | null;
}) {
  if (!["open", "reviewing", "resolved", "dismissed"].includes(status)) {
    throw new Error("Invalid report status.");
  }

  const supabase = createSupabaseAdminClient();
  const terminal = status === "resolved" || status === "dismissed";
  const { error } = await supabase
    .from("content_reports")
    .update({
      status,
      admin_notes: note,
      resolved_by: terminal ? adminUserId : null,
      resolved_at: terminal ? new Date().toISOString() : null,
    })
    .eq("id", reportId);

  if (error) throw error;

  const { error: auditError } = await supabase.from("admin_audit_log").insert({
    admin_user_email: adminEmail,
    action: `report_${status}`,
    target_type: "user",
    target_id: reportId,
    reason: note,
  });

  if (auditError) {
    console.error("[reports] audit log failed", auditError);
  }
}
