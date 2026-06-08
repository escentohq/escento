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
  const userId = session.user.id;

  try {
    const admin = createSupabaseAdminClient();
    const [profiles, gigs, participantConversations, createdConversations] = await Promise.all([
      admin.from("musician_profile").select("id").eq("user_id", userId),
      admin.from("gig").select("id").eq("creator_id", userId),
      admin.from("conversation_participants").select("conversation_id").eq("user_id", userId),
      admin.from("conversations").select("id").eq("created_by", userId),
    ]);

    if (
      profiles.error ||
      gigs.error ||
      participantConversations.error ||
      createdConversations.error
    ) {
      throw profiles.error ||
        gigs.error ||
        participantConversations.error ||
        createdConversations.error;
    }

    const profileIds = (profiles.data ?? []).map((profile) => profile.id);
    const gigIds = (gigs.data ?? []).map((gig) => gig.id);
    const conversationIds = Array.from(
      new Set([
        ...(participantConversations.data ?? []).map((row) => row.conversation_id),
        ...(createdConversations.data ?? []).map((row) => row.id),
      ]),
    );

    if (conversationIds.length) {
      const [messageDelete, participantDelete, conversationDelete] = await Promise.all([
        admin.from("messages").delete().in("conversation_id", conversationIds),
        admin.from("conversation_participants").delete().in("conversation_id", conversationIds),
        admin.from("conversations").delete().in("id", conversationIds),
      ]);

      if (messageDelete.error || participantDelete.error || conversationDelete.error) {
        throw messageDelete.error || participantDelete.error || conversationDelete.error;
      }
    }

    const [
      sentMessageDelete,
      participantDelete,
      requestDelete,
      blockDelete,
    ] = await Promise.all([
      admin.from("messages").delete().eq("sender_id", userId),
      admin.from("conversation_participants").delete().eq("user_id", userId),
      admin.from("conversation_requests").delete().or(`requester_id.eq.${userId},recipient_id.eq.${userId}`),
      admin.from("user_blocks").delete().or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`),
    ]);

    if (
      sentMessageDelete.error ||
      participantDelete.error ||
      requestDelete.error ||
      blockDelete.error
    ) {
      throw sentMessageDelete.error ||
        participantDelete.error ||
        requestDelete.error ||
        blockDelete.error;
    }

    if (profileIds.length) {
      const [instrumentDelete, genreDelete] = await Promise.all([
        admin.from("musician_instrument").delete().in("musician_profile_id", profileIds),
        admin.from("musician_genre").delete().in("musician_profile_id", profileIds),
      ]);
      if (instrumentDelete.error || genreDelete.error) {
        throw instrumentDelete.error || genreDelete.error;
      }
    }

    if (gigIds.length) {
      const [instrumentDelete, genreDelete] = await Promise.all([
        admin.from("gig_instrument").delete().in("gig_id", gigIds),
        admin.from("gig_genre").delete().in("gig_id", gigIds),
      ]);
      if (instrumentDelete.error || genreDelete.error) {
        throw instrumentDelete.error || genreDelete.error;
      }
    }

    const [profileDelete, gigDelete, appUserDelete] = await Promise.all([
      admin.from("musician_profile").delete().eq("user_id", userId),
      admin.from("gig").delete().eq("creator_id", userId),
      admin.from("app_user").delete().eq("id", userId),
    ]);

    const deleteError = profileDelete.error ?? gigDelete.error ?? appUserDelete.error;
    if (deleteError) throw deleteError;

    const existing = await admin.storage.from(PROFILE_PICTURES_BUCKET).list(userId);
    if (existing.data?.length) {
      await admin.storage
        .from(PROFILE_PICTURES_BUCKET)
        .remove(existing.data.map((item) => `${userId}/${item.name}`));
    }

    const { error } = await admin.auth.admin.deleteUser(userId);
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
