import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function uploadProfileImage(userId: string, file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  const fileSizeKB = file.size / 1024;
  if (fileSizeKB > 5120) {
    throw new Error("Image must be smaller than 5MB");
  }

  const supabase = createSupabaseAdminClient();
  const fileName = `${userId}/profile.${file.type.split("/")[1] || "jpg"}`;

  const { data, error } = await supabase.storage
    .from("musician-media")
    .upload(fileName, file, { upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: publicUrl } = supabase.storage.from("musician-media").getPublicUrl(fileName);

  return publicUrl.publicUrl;
}

export async function uploadResumePdf(userId: string, file: File): Promise<string> {
  if (file.type !== "application/pdf") {
    throw new Error("File must be a PDF");
  }

  const fileSizeKB = file.size / 1024;
  if (fileSizeKB > 10240) {
    throw new Error("PDF must be smaller than 10MB");
  }

  const supabase = createSupabaseAdminClient();
  const fileName = `${userId}/resume.pdf`;

  const { data, error } = await supabase.storage
    .from("musician-media")
    .upload(fileName, file, { upsert: true });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: publicUrl } = supabase.storage.from("musician-media").getPublicUrl(fileName);

  return publicUrl.publicUrl;
}
