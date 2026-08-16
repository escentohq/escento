"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth-guards";
import {
  createContentReport,
  type ReportTargetType,
} from "@/lib/api/reports";
import { strOrEmpty } from "@/lib/form-utils";

export type ReportFormState = {
  ok: boolean;
  message?: string;
};

export async function submitContentReport(
  _state: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const session = await requireUser("/");
  const targetType = strOrEmpty(formData.get("targetType")) as ReportTargetType;
  const targetId = strOrEmpty(formData.get("targetId"));
  const subject = strOrEmpty(formData.get("subject"));
  const description = strOrEmpty(formData.get("description"));
  const evidence = strOrEmpty(formData.get("evidence"));

  try {
    if (!targetId) throw new Error("Missing report target.");

    await createContentReport({
      reporterId: session.user.id,
      reporterCapabilities: session.user.capabilities,
      targetType,
      targetId,
      subject,
      description,
      evidence,
    });

    revalidatePath("/admin/reports");
    return {
      ok: true,
      message: "Report sent. Our team will review it.",
    };
  } catch (error) {
    console.error("[reports] submit failed", error);
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Report could not be sent.",
    };
  }
}
