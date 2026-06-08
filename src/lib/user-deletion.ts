import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const PROFILE_PICTURES_BUCKET = "profile-pictures";

export async function deleteUserCompletely(userId: string) {
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
}
