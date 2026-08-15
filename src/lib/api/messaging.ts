import { randomUUID } from "crypto";
import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getEscentoSupportAccountEmail } from "@/lib/support-identity";
import {
  queueConnectionRequestNotification,
  queueMessageNotification,
} from "@/lib/messaging-notifications";
import type {
  BlockedUser,
  ConnectionRequest,
  ConversationDetail,
  ConversationParticipant,
  ConversationSummary,
  MessageRecord,
  MessagingBlockStatus,
  MessagingRelationship,
  MessagingUserSummary,
} from "./types";

export const CONNECTION_REQUEST_INTRO_MAX_LENGTH = 600;
export const MESSAGE_BODY_MAX_LENGTH = 2000;

type MessagingErrorCode =
  | "invalid_input"
  | "not_found"
  | "forbidden"
  | "blocked"
  | "duplicate"
  | "database_error";

export class MessagingError extends Error {
  code: MessagingErrorCode;

  constructor(code: MessagingErrorCode, message: string) {
    super(message);
    this.name = "MessagingError";
    this.code = code;
  }
}

function assertValidId(id: string, label = "id") {
  if (!id || id.length > 128) {
    throw new MessagingError("invalid_input", `Invalid ${label}.`);
  }
}

function normalizeOptionalText(value: string | null | undefined, maxLength: number) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;
  if (trimmed.length > maxLength) {
    throw new MessagingError("invalid_input", `Keep the message under ${maxLength} characters.`);
  }
  return trimmed;
}

function normalizeRequiredText(value: string, maxLength: number) {
  const trimmed = value.trim();
  if (!trimmed) throw new MessagingError("invalid_input", "Add a message.");
  if (trimmed.length > maxLength) {
    throw new MessagingError("invalid_input", `Keep the message under ${maxLength} characters.`);
  }
  return trimmed;
}

function toUserSummary(raw: any): MessagingUserSummary | undefined {
  if (!raw) return undefined;
  return {
    id: raw.id,
    email: raw.email ?? null,
    name: raw.is_admin_support_account ? "Escento" : raw.name ?? null,
    image: raw.image ?? null,
    role: raw.role ?? null,
    isSystemAccount: raw.is_system_account ?? false,
    isAdminSupportAccount: raw.is_admin_support_account ?? false,
  };
}

function toConnectionRequest(raw: any): ConnectionRequest {
  return {
    id: raw.id,
    requesterId: raw.requester_id,
    recipientId: raw.recipient_id,
    status: raw.status,
    introMessage: raw.intro_message,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    acceptedAt: raw.accepted_at,
    rejectedAt: raw.rejected_at,
    requester: toUserSummary(raw.requester),
    recipient: toUserSummary(raw.recipient),
  };
}

function toParticipant(raw: any): ConversationParticipant {
  return {
    id: raw.id,
    conversationId: raw.conversation_id,
    userId: raw.user_id,
    joinedAt: raw.joined_at,
    lastReadAt: raw.last_read_at,
    deletedAt: raw.deleted_at,
    user: toUserSummary(raw.user),
  };
}

/** Columns the normalizers below actually read; `select("*")` pulled the rest for nothing. */
const PARTICIPANT_COLUMNS = "id, conversation_id, user_id, joined_at, last_read_at, deleted_at";
const MESSAGE_COLUMNS = "id, conversation_id, sender_id, body, created_at, updated_at, deleted_at";
const CONVERSATION_COLUMNS = "id, type, created_at, updated_at, last_message_at";

function toMessage(raw: any): MessageRecord {
  return {
    id: raw.id,
    conversationId: raw.conversation_id,
    senderId: raw.sender_id,
    body: raw.body,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    deletedAt: raw.deleted_at,
    sender: toUserSummary(raw.sender),
  };
}

function toBlockedUser(raw: any): BlockedUser {
  return {
    id: raw.id,
    blockerId: raw.blocker_id,
    blockedId: raw.blocked_id,
    createdAt: raw.created_at,
    blockedUser: toUserSummary(raw.blocked_user),
  };
}

async function getUserSummaries(userIds: string[]) {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (!uniqueIds.length) return new Map<string, MessagingUserSummary>();

  const supabase = createSupabaseAdminClient();
  const [{ data: users, error: usersError }, { data: profiles, error: profilesError }] =
    await Promise.all([
      supabase
        .from("app_user")
        .select("id, email, name, image, role")
        .in("id", uniqueIds),
      supabase
        .from("musician_profile")
        .select("user_id, display_name")
        .in("user_id", uniqueIds),
    ]);

  if (usersError) throw usersError;
  if (profilesError) throw profilesError;

  const profileNames = new Map(
    (profiles ?? []).map((profile) => [profile.user_id, profile.display_name ?? null]),
  );

  return new Map(
    (users ?? []).map((user) => {
      const profileName = profileNames.get(user.id) ?? null;
      const isAdminSupportAccount =
        Boolean(user.email) && user.email.toLowerCase() === getEscentoSupportAccountEmail();
      const name = isAdminSupportAccount
        ? "Escento"
        : user.role === "MUSICIAN"
        ? profileName || user.name || null
        : user.name || profileName || null;

      return [
        user.id,
        {
          id: user.id,
          email: user.email ?? null,
          name,
          image: user.image ?? null,
          role: user.role ?? null,
          isAdminSupportAccount,
          isSystemAccount: isAdminSupportAccount,
        },
      ];
    }),
  );
}

async function enrichConnectionRequests(requests: ConnectionRequest[]) {
  const summaries = await getUserSummaries(
    requests.flatMap((request) => [request.requesterId, request.recipientId]),
  );

  return requests.map((request) => ({
    ...request,
    requester: summaries.get(request.requesterId) ?? request.requester,
    recipient: summaries.get(request.recipientId) ?? request.recipient,
  }));
}

async function enrichParticipants(participants: ConversationParticipant[]) {
  const summaries = await getUserSummaries(participants.map((participant) => participant.userId));

  return participants.map((participant) => ({
    ...participant,
    user: summaries.get(participant.userId) ?? participant.user,
  }));
}

async function enrichMessages(messages: MessageRecord[]) {
  const summaries = await getUserSummaries(messages.map((message) => message.senderId));

  return messages.map((message) => ({
    ...message,
    sender: summaries.get(message.senderId) ?? message.sender,
  }));
}

async function enrichBlockedUsers(blockedUsers: BlockedUser[]) {
  const summaries = await getUserSummaries(blockedUsers.map((block) => block.blockedId));

  return blockedUsers.map((block) => ({
    ...block,
    blockedUser: summaries.get(block.blockedId) ?? block.blockedUser,
  }));
}

async function appUserExists(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("app_user")
    .select("id")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return Boolean(data);
}

async function hasBlockBetween(userA: string, userB: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("messaging_is_blocked_between", {
    p_user_a: userA,
    p_user_b: userB,
  });

  if (error) throw error;
  return Boolean(data);
}

export async function getMessagingBlockStatusForUser(
  userId: string,
  otherUserId: string,
): Promise<MessagingBlockStatus> {
  assertValidId(userId, "user id");
  assertValidId(otherUserId, "other user id");

  if (userId === otherUserId) {
    return { blockedByMe: false, blockedMe: false };
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: ownBlock, error: ownBlockError }, { data: blockedBetween, error: blockedError }] = await Promise.all([
    supabase
    .from("user_blocks")
      .select("id")
      .eq("blocker_id", userId)
      .eq("blocked_id", otherUserId)
      .maybeSingle(),
    supabase.rpc("messaging_is_blocked_between", {
      p_user_a: userId,
      p_user_b: otherUserId,
    }),
  ]);

  if (ownBlockError) throw ownBlockError;
  if (blockedError) throw blockedError;

  return {
    blockedByMe: Boolean(ownBlock),
    blockedMe: Boolean(blockedBetween) && !ownBlock,
  };
}

async function hasActiveDirectConversation(userA: string, userB: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("messaging_direct_conversation_exists", {
    p_user_a: userA,
    p_user_b: userB,
  });

  if (error) throw error;
  return Boolean(data);
}

async function getActiveParticipant(userId: string, conversationId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("conversation_participants")
    .select(PARTICIPANT_COLUMNS)
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data ? toParticipant(data) : null;
}

async function getConversationParticipantRows(conversationIds: string[]) {
  if (!conversationIds.length) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("conversation_participants")
    .select(`${PARTICIPANT_COLUMNS}, user:app_user!conversation_participants_user_id_fkey(id, email, name, image, role)`)
    .in("conversation_id", conversationIds)
    .is("deleted_at", null);

  if (error) throw error;
  return enrichParticipants((data ?? []).map(toParticipant));
}

async function getMessageRows(conversationIds: string[], ascending = false) {
  if (!conversationIds.length) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("messages")
    .select(`${MESSAGE_COLUMNS}, sender:app_user!messages_sender_id_fkey(id, email, name, image, role)`)
    .in("conversation_id", conversationIds)
    .is("deleted_at", null)
    .order("created_at", { ascending });

  if (error) throw error;
  return enrichMessages((data ?? []).map(toMessage));
}

function getUnreadCount(
  userId: string,
  participant: ConversationParticipant | undefined,
  messages: MessageRecord[],
) {
  if (!participant) return 0;
  const lastReadTime = participant.lastReadAt
    ? new Date(participant.lastReadAt).getTime()
    : 0;

  return messages.filter((message) => {
    if (message.senderId === userId) return false;
    if (message.deletedAt) return false;
    return new Date(message.createdAt).getTime() > lastReadTime;
  }).length;
}

function buildConversationSummary(
  raw: any,
  userId: string,
  participants: ConversationParticipant[],
  messages: MessageRecord[],
): ConversationSummary {
  const ownParticipant = participants.find((participant) => participant.userId === userId);
  const otherParticipant = participants.find((participant) => participant.userId !== userId) ?? null;
  const sortedMessages = [...messages].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    id: raw.id,
    type: raw.type,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    lastMessageAt: raw.last_message_at,
    createdBy: raw.created_by,
    sourceRequestId: raw.source_request_id,
    participants,
    otherParticipant,
    lastMessage: sortedMessages[0] ?? null,
    unreadCount: getUnreadCount(userId, ownParticipant, messages),
  };
}

async function getConversationRowsForUser(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: ownParticipants, error: participantsError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (participantsError) throw participantsError;

  const conversationIds = Array.from(
    new Set((ownParticipants ?? []).map((participant) => participant.conversation_id)),
  );

  if (!conversationIds.length) return [];

  const { data: conversations, error: conversationsError } = await supabase
    .from("conversations")
    .select(CONVERSATION_COLUMNS)
    .in("id", conversationIds)
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (conversationsError) throw conversationsError;
  return conversations ?? [];
}

export async function createConnectionRequest(
  requesterId: string,
  recipientId: string,
  introMessage?: string | null,
): Promise<ConnectionRequest> {
  assertValidId(requesterId, "requester id");
  assertValidId(recipientId, "recipient id");
  if (requesterId === recipientId) {
    throw new MessagingError("invalid_input", "You cannot message yourself.");
  }

  const normalizedIntro = normalizeOptionalText(
    introMessage,
    CONNECTION_REQUEST_INTRO_MAX_LENGTH,
  );

  const [recipientExists, blocked, directConversationExists] = await Promise.all([
    appUserExists(recipientId),
    hasBlockBetween(requesterId, recipientId),
    hasActiveDirectConversation(requesterId, recipientId),
  ]);

  if (!recipientExists) {
    throw new MessagingError("not_found", "Cannot send this request.");
  }
  if (blocked) {
    throw new MessagingError("blocked", "Cannot send this request.");
  }
  if (directConversationExists) {
    throw new MessagingError("duplicate", "A conversation already exists.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("conversation_requests")
    .insert({
      id: randomUUID(),
      requester_id: requesterId,
      recipient_id: recipientId,
      intro_message: normalizedIntro,
      status: "pending",
    })
    .select(
      "*, requester:app_user!conversation_requests_requester_id_fkey(id, email, name, image, role), recipient:app_user!conversation_requests_recipient_id_fkey(id, email, name, image, role)",
    )
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new MessagingError("duplicate", "A pending request already exists.");
    }
    throw error;
  }

  const [request] = await enrichConnectionRequests([toConnectionRequest(data)]);
  await queueConnectionRequestNotification(request);
  return request;
}

export async function listIncomingConnectionRequests(userId: string): Promise<ConnectionRequest[]> {
  assertValidId(userId, "user id");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("conversation_requests")
    .select(
      "*, requester:app_user!conversation_requests_requester_id_fkey(id, email, name, image, role), recipient:app_user!conversation_requests_recipient_id_fkey(id, email, name, image, role)",
    )
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return enrichConnectionRequests((data ?? []).map(toConnectionRequest));
}

export async function listOutgoingConnectionRequests(userId: string): Promise<ConnectionRequest[]> {
  assertValidId(userId, "user id");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("conversation_requests")
    .select(
      "*, requester:app_user!conversation_requests_requester_id_fkey(id, email, name, image, role), recipient:app_user!conversation_requests_recipient_id_fkey(id, email, name, image, role)",
    )
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return enrichConnectionRequests((data ?? []).map(toConnectionRequest));
}

export async function acceptConnectionRequestForUser(
  userId: string,
  requestId: string,
): Promise<ConversationDetail> {
  assertValidId(userId, "user id");
  assertValidId(requestId, "request id");

  const supabase = await createSupabaseServerClient();
  const { data: conversationId, error } = await supabase.rpc(
    "messaging_accept_connection_request",
    { p_request_id: requestId },
  );

  if (error) throw error;
  if (!conversationId) {
    throw new MessagingError("database_error", "Conversation could not be created.");
  }

  const conversation = await getConversationForUser(userId, String(conversationId));
  if (!conversation) {
    throw new MessagingError("database_error", "Conversation could not be loaded.");
  }

  return conversation;
}

export async function rejectConnectionRequestForUser(
  userId: string,
  requestId: string,
): Promise<void> {
  assertValidId(userId, "user id");
  assertValidId(requestId, "request id");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("conversation_requests")
    .update({ status: "rejected", rejected_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("recipient_id", userId)
    .eq("status", "pending");

  if (error) throw error;
}

export async function cancelConnectionRequestForUser(
  userId: string,
  requestId: string,
): Promise<void> {
  assertValidId(userId, "user id");
  assertValidId(requestId, "request id");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("conversation_requests")
    .update({ status: "cancelled" })
    .eq("id", requestId)
    .eq("requester_id", userId)
    .eq("status", "pending");

  if (error) throw error;
}

export async function listConversationsForUser(userId: string): Promise<ConversationSummary[]> {
  assertValidId(userId, "user id");
  const conversations = await getConversationRowsForUser(userId);
  const conversationIds = conversations.map((conversation) => conversation.id);
  const [participants, messages] = await Promise.all([
    getConversationParticipantRows(conversationIds),
    getMessageRows(conversationIds, false),
  ]);

  return conversations.map((conversation) => {
    const conversationParticipants = participants.filter(
      (participant) => participant.conversationId === conversation.id,
    );
    const conversationMessages = messages.filter(
      (message) => message.conversationId === conversation.id,
    );
    return buildConversationSummary(
      conversation,
      userId,
      conversationParticipants,
      conversationMessages,
    );
  });
}

export async function getConversationForUser(
  userId: string,
  conversationId: string,
): Promise<ConversationDetail | null> {
  assertValidId(userId, "user id");
  assertValidId(conversationId, "conversation id");

  const ownParticipant = await getActiveParticipant(userId, conversationId);
  if (!ownParticipant) return null;

  const supabase = await createSupabaseServerClient();
  const { data: conversation, error } = await supabase
    .from("conversations")
    .select(CONVERSATION_COLUMNS)
    .eq("id", conversationId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  if (!conversation) return null;

  const [participants, messages] = await Promise.all([
    getConversationParticipantRows([conversationId]),
    getMessageRows([conversationId], true),
  ]);

  return {
    ...buildConversationSummary(conversation, userId, participants, messages),
    messages,
  };
}

export async function createMessageForUser(
  userId: string,
  conversationId: string,
  body: string,
): Promise<MessageRecord> {
  assertValidId(userId, "user id");
  assertValidId(conversationId, "conversation id");
  const normalizedBody = normalizeRequiredText(body, MESSAGE_BODY_MAX_LENGTH);

  const supabase = await createSupabaseServerClient();

  // Sending one message used to load the entire thread: getActiveParticipant, then
  // getConversationForUser (which re-reads the participants *and* every message in the
  // conversation). All this needs is the conversation type and the other participant, so
  // read exactly that — the participant rows double as the membership check.
  const [{ data: conversation, error: conversationLookupError }, participants] = await Promise.all([
    supabase.from("conversations").select("id, type").eq("id", conversationId).single(),
    getConversationParticipantRows([conversationId]),
  ]);

  if (conversationLookupError && conversationLookupError.code !== "PGRST116") {
    throw conversationLookupError;
  }

  const participant = participants.find((row) => row.userId === userId);
  if (!participant) {
    throw new MessagingError("forbidden", "You cannot send messages in this conversation.");
  }
  if (!conversation) {
    throw new MessagingError("not_found", "Conversation not found.");
  }

  const otherParticipant = participants.find((row) => row.userId !== userId);

  if (conversation.type === "direct" && otherParticipant) {
    const blocked = await hasBlockBetween(userId, otherParticipant.userId);
    if (blocked) {
      throw new MessagingError("blocked", "You cannot send messages in this conversation.");
    }
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      id: randomUUID(),
      conversation_id: conversationId,
      sender_id: userId,
      body: normalizedBody,
    })
    .select(`${MESSAGE_COLUMNS}, sender:app_user!messages_sender_id_fkey(id, email, name, image, role)`)
    .single();

  if (error) throw error;

  const { error: conversationError } = await supabase
    .from("conversations")
    .update({ last_message_at: now })
    .eq("id", conversationId);

  if (conversationError) throw conversationError;

  const message = toMessage(data);
  await queueMessageNotification({
    message,
    sender: message.sender,
    recipient: otherParticipant?.user,
  });
  return message;
}

export async function markConversationReadForUser(
  userId: string,
  conversationId: string,
): Promise<void> {
  assertValidId(userId, "user id");
  assertValidId(conversationId, "conversation id");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (error) throw error;
}

export async function deleteConversationForUser(
  userId: string,
  conversationId: string,
): Promise<void> {
  assertValidId(userId, "user id");
  assertValidId(conversationId, "conversation id");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("conversation_participants")
    .update({ deleted_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (error) throw error;
}

export async function blockUserForUser(userId: string, blockedUserId: string): Promise<void> {
  assertValidId(userId, "user id");
  assertValidId(blockedUserId, "blocked user id");

  if (userId === blockedUserId) {
    throw new MessagingError("invalid_input", "You cannot block yourself.");
  }

  const blockedUserExists = await appUserExists(blockedUserId);
  if (!blockedUserExists) {
    throw new MessagingError("not_found", "User not found.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("user_blocks")
    .upsert(
      {
        id: randomUUID(),
        blocker_id: userId,
        blocked_id: blockedUserId,
      },
      { onConflict: "blocker_id,blocked_id", ignoreDuplicates: true },
    );

  if (error) throw error;
}

export async function unblockUserForUser(userId: string, blockedUserId: string): Promise<void> {
  assertValidId(userId, "user id");
  assertValidId(blockedUserId, "blocked user id");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("user_blocks")
    .delete()
    .eq("blocker_id", userId)
    .eq("blocked_id", blockedUserId);

  if (error) throw error;
}

export async function listBlockedUsersForUser(userId: string): Promise<BlockedUser[]> {
  assertValidId(userId, "user id");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_blocks")
    .select("*, blocked_user:app_user!user_blocks_blocked_id_fkey(id, email, name, image, role)")
    .eq("blocker_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return enrichBlockedUsers((data ?? []).map(toBlockedUser));
}

export async function getUnreadMessageCountForUser(userId: string): Promise<number> {
  const conversations = await listConversationsForUser(userId);
  return conversations.reduce((total, conversation) => total + conversation.unreadCount, 0);
}

export const getUnreadConversationCountForUser = cache(async (userId: string): Promise<number> => {
  assertValidId(userId, "user id");
  const supabase = await createSupabaseServerClient();
  const { data: participants, error: participantError } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (participantError) throw participantError;
  if (!participants?.length) return 0;

  const { data: messages, error: messageError } = await supabase
    .from("messages")
    .select("conversation_id, created_at")
    .in("conversation_id", participants.map((row) => row.conversation_id))
    .neq("sender_id", userId)
    .is("deleted_at", null);

  if (messageError) throw messageError;
  const lastReadByConversation = new Map(
    participants.map((row) => [row.conversation_id, row.last_read_at ? Date.parse(row.last_read_at) : 0]),
  );
  return new Set(
    (messages ?? [])
      .filter((message) => Date.parse(message.created_at) > (lastReadByConversation.get(message.conversation_id) ?? 0))
      .map((message) => message.conversation_id),
  ).size;
});

export async function getUnreadConversationSummariesForUser(
  userId: string,
): Promise<ConversationSummary[]> {
  const conversations = await listConversationsForUser(userId);
  return conversations.filter((conversation) => conversation.unreadCount > 0);
}

export async function getMessagingRelationshipForUser(
  userId: string,
  otherUserId: string,
): Promise<MessagingRelationship> {
  assertValidId(userId, "user id");
  assertValidId(otherUserId, "other user id");

  if (userId === otherUserId) return { status: "self" };

  const supabase = await createSupabaseServerClient();
  const [{ data: ownRows, error: ownError }, { data: otherRows, error: otherError }] = await Promise.all([
    supabase.from("conversation_participants").select("conversation_id").eq("user_id", userId).is("deleted_at", null),
    supabase.from("conversation_participants").select("conversation_id").eq("user_id", otherUserId).is("deleted_at", null),
  ]);
  if (ownError) throw ownError;
  if (otherError) throw otherError;
  const otherIds = new Set((otherRows ?? []).map((row) => row.conversation_id));
  const sharedIds = (ownRows ?? []).map((row) => row.conversation_id).filter((id) => otherIds.has(id));
  if (sharedIds.length) {
    const { data: direct, error: directError } = await supabase
      .from("conversations")
      .select("id")
      .in("id", sharedIds)
      .eq("type", "direct")
      .limit(1)
      .maybeSingle();
    if (directError) throw directError;
    if (direct) return { status: "connected", conversationId: direct.id };
  }

  const { data, error } = await supabase
    .from("conversation_requests")
    .select(
      "*, requester:app_user!conversation_requests_requester_id_fkey(id, email, name, image, role), recipient:app_user!conversation_requests_recipient_id_fkey(id, email, name, image, role)",
    )
    .eq("status", "pending")
    .or(
      `and(requester_id.eq.${userId},recipient_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},recipient_id.eq.${userId})`,
    )
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  if (data?.[0]) {
    const [request] = await enrichConnectionRequests([toConnectionRequest(data[0])]);
    return {
      status: request.requesterId === userId ? "pending_outgoing" : "pending_incoming",
      request,
    };
  }

  return { status: "none" };
}
