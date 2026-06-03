"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSignedIn } from "@/lib/auth-guards";
import {
  ADMIN_CREDENTIALS_ERROR,
  DELETE_ACCOUNT_UNAVAILABLE,
} from "@/lib/account-deletion";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProfileByUserId } from "@/lib/api/profiles";
import { fieldError, type ActionState } from "@/lib/form-utils";

const PROFILE_PICTURES_BUCKET = "profile-pictures";
const MAX_PROFILE_PICTURE_BYTES = 2 * 1024 * 1024;
const ALLOWED_PROFILE_PICTURE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

async function ensureProfilePicturesBucket() {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.storage.getBucket(PROFILE_PICTURES_BUCKET);

  if (!error) return admin;

  const { error: createError } = await admin.storage.createBucket(PROFILE_PICTURES_BUCKET, {
    public: true,
    allowedMimeTypes: Array.from(ALLOWED_PROFILE_PICTURE_TYPES.keys()),
    fileSizeLimit: MAX_PROFILE_PICTURE_BYTES,
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw createError;
  }

  return admin;
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}

export async function deleteAccountAction(): Promise<void> {
  const session = await requireSignedIn("/account");
  const supabase = await createSupabaseServerClient();

  const [profileResult, gigResult, appUserResult] = await Promise.all([
    supabase.from("musician_profile").delete().eq("user_id", session.user.id),
    supabase.from("gig").delete().eq("creator_id", session.user.id),
    supabase.from("app_user").delete().eq("id", session.user.id),
  ]);

  const deleteError = profileResult.error ?? gigResult.error ?? appUserResult.error;
  if (deleteError) throw deleteError;

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.auth.admin.deleteUser(session.user.id);
    if (error) throw error;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === ADMIN_CREDENTIALS_ERROR
    ) {
      console.error("[deleteAccount] missing SUPABASE_SERVICE_ROLE_KEY");
      throw new Error(DELETE_ACCOUNT_UNAVAILABLE);
    }
    throw error;
  }

  await supabase.auth.signOut().catch(() => {});
  revalidatePath("/");
  redirect("/signin");
}

export async function updateNameAction(_state: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireSignedIn("/account");
  const name = String(fd.get("name") ?? "").trim();

  if (!name) {
    return { ok: false, fieldErrors: { name: "Add a display name." } };
  }

  if (name.length > 80) {
    return { ok: false, fieldErrors: { name: "Name must be 80 characters or fewer." } };
  }

  const supabase = await createSupabaseServerClient();

  // Update both app_user and auth metadata
  const [appUserError, authError] = await Promise.all([
    supabase
      .from("app_user")
      .update({ name })
      .eq("id", session.user.id)
      .then(r => r.error),
    supabase.auth
      .updateUser({ data: { full_name: name } })
      .then(r => r.error),
  ]);

  if (appUserError || authError) throw appUserError || authError;

  revalidatePath("/account");
  revalidatePath("/");

  return { ok: true, message: "Name updated." };
}

export async function updateProfilePictureAction(
  _state: ActionState,
  fd: FormData,
): Promise<ActionState> {
  const session = await requireSignedIn("/account");
  const fieldErrors: Record<string, string> = {};
  const picture = fd.get("profilePicture");

  if (!(picture instanceof File) || picture.size === 0) {
    fieldError(fieldErrors, "profilePicture", "Choose a profile picture.");
  } else {
    if (!ALLOWED_PROFILE_PICTURE_TYPES.has(picture.type)) {
      fieldError(fieldErrors, "profilePicture", "Use a JPG, PNG, or WebP image.");
    }
    if (picture.size > MAX_PROFILE_PICTURE_BYTES) {
      fieldError(fieldErrors, "profilePicture", "Keep the image under 2 MB.");
    }
  }

  if (Object.keys(fieldErrors).length) {
    return {
      ok: false,
      message: "Choose a profile picture to continue.",
      fieldErrors,
    };
  }

  try {
    const file = picture as File;
    const extension = ALLOWED_PROFILE_PICTURE_TYPES.get(file.type) ?? "jpg";
    const admin = await ensureProfilePicturesBucket();
    const userFolder = session.user.id;
    const path = `${userFolder}/profile.${extension}`;
    const existing = await admin.storage.from(PROFILE_PICTURES_BUCKET).list(userFolder);

    if (existing.data?.length) {
      await admin.storage
        .from(PROFILE_PICTURES_BUCKET)
        .remove(existing.data.map((item) => `${userFolder}/${item.name}`));
    }

    const { error: uploadError } = await admin.storage
      .from(PROFILE_PICTURES_BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = admin.storage
      .from(PROFILE_PICTURES_BUCKET)
      .getPublicUrl(path);
    const imageUrl = `${data.publicUrl}?v=${Date.now()}`;

    const supabase = await createSupabaseServerClient();
    const profile = await getProfileByUserId(session.user.id);
    const [appUserResult, authResult] = await Promise.all([
      supabase
        .from("app_user")
        .update({ image: imageUrl })
        .eq("id", session.user.id),
      supabase.auth.updateUser({
        data: {
          avatar_url: imageUrl,
          picture: imageUrl,
        },
      }),
    ]);

    if (appUserResult.error || authResult.error) {
      throw appUserResult.error || authResult.error;
    }

    revalidatePath("/");
    revalidatePath("/account");
    revalidatePath("/musicians");
    if (profile) revalidatePath(`/musicians/${profile.id}`);

    return {
      ok: true,
      message: "Profile picture updated.",
      values: { imageUrl },
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === ADMIN_CREDENTIALS_ERROR
    ) {
      return {
        ok: false,
        message: "Profile picture updates are unavailable right now.",
      };
    }

    console.error("[updateProfilePicture]", error);
    return {
      ok: false,
      message: "Profile picture could not be updated. Try again.",
    };
  }
}
