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

/**
 * Reads the participant rows for a conversation. The `user:app_user!…` embed these selects
 * used to carry always resolved to null — `app_user` RLS is select-own — so the identity
 * still has to come from the service-role pass in `enrichParticipants`.
 */
async function getConversationParticipantRows(conversationIds: string[]) {
  if (!conversationIds.length) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("conversation_participants")
    .select(PARTICIPANT_COLUMNS)
    .in("conversation_id", conversationIds)
    .is("deleted_at", null);

  if (error) throw error;
  return enrichParticipants((data ?? []).map(toParticipant));
}

/**
 * One row per conversation out of `messaging_list_conversation_summaries()`, which resolves
 * the other party, the last message and the unread count in the database. Rebuilding these
 * in TypeScript meant transferring every message of every conversation to render a preview
 * line; see the migration header for the shape.
 */
type ConversationSummaryRow = {
  conversation_id: string;
  conversation_type: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  created_by: string;
  source_request_id: string | null;
  own_participant_id: string;
  own_joined_at: string;
  own_last_read_at: string | null;
  other_participant_id: string | null;
  other_joined_at: string | null;
  other_last_read_at: string | null;
  other_user_id: string | null;
  other_email: string | null;
  other_name: string | null;
  other_image: string | null;
  other_role: "MUSICIAN" | "CREATOR" | null;
  other_is_system_account: boolean | null;
  other_is_admin_support_account: boolean | null;
  last_message_id: string | null;
  last_message_body: string | null;
  last_message_sender_id: string | null;
  last_message_created_at: string | null;
  last_message_updated_at: string | null;
  unread_count: number;
};

function toSummaryFromRow(row: ConversationSummaryRow, userId: string): ConversationSummary {
  const ownParticipant: ConversationParticipant = {
    id: row.own_participant_id,
    conversationId: row.conversation_id,
    userId,
    joinedAt: row.own_joined_at,
    lastReadAt: row.own_last_read_at,
    deletedAt: null,
  };

  const otherParticipant: ConversationParticipant | null =
    row.other_participant_id && row.other_user_id
      ? {
          id: row.other_participant_id,
          conversationId: row.conversation_id,
          userId: row.other_user_id,
          joinedAt: row.other_joined_at ?? row.created_at,
          lastReadAt: row.other_last_read_at,
          deletedAt: null,
          user: {
            id: row.other_user_id,
            email: row.other_email,
            name: row.other_name,
            image: row.other_image,
            role: row.other_role,
            isSystemAccount: row.other_is_system_account ?? false,
            isAdminSupportAccount: row.other_is_admin_support_account ?? false,
          },
        }
      : null;

  const lastMessage: MessageRecord | null = row.last_message_id
    ? {
        id: row.last_message_id,
        conversationId: row.conversation_id,
        senderId: row.last_message_sender_id ?? "",
        body: row.last_message_body ?? "",
        createdAt: row.last_message_created_at ?? row.created_at,
        updatedAt: row.last_message_updated_at ?? row.created_at,
        deletedAt: null,
      }
    : null;

  return {
    id: row.conversation_id,
    type: row.conversation_type as ConversationSummary["type"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastMessageAt: row.last_message_at,
    createdBy: row.created_by,
    sourceRequestId: row.source_request_id,
    participants: otherParticipant ? [ownParticipant, otherParticipant] : [ownParticipant],
    otherParticipant,
    lastMessage,
    unreadCount: row.unread_count ?? 0,
  };
}

type ConnectionRequestRow = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: ConnectionRequest["status"];
  intro_message: string | null;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  rejected_at: string | null;
  requester: any;
  recipient: any;
};

function toUserSummaryFromJson(raw: any): MessagingUserSummary | undefined {
  if (!raw) return undefined;
  return {
    id: raw.id,
    email: raw.email ?? null,
    name: raw.name ?? null,
    image: raw.image ?? null,
    role: raw.role ?? null,
    isSystemAccount: raw.is_system_account ?? false,
    isAdminSupportAccount: raw.is_admin_support_account ?? false,
  };
}

async function listConnectionRequests(
  direction: "incoming" | "outgoing",
): Promise<ConnectionRequest[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("messaging_list_connection_requests", {
    p_direction: direction,
  });

  if (error) throw error;

  return ((data ?? []) as ConnectionRequestRow[]).map((row) => ({
    id: row.id,
    requesterId: row.requester_id,
    recipientId: row.recipient_id,
    status: row.status,
    introMessage: row.intro_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    acceptedAt: row.accepted_at,
    rejectedAt: row.rejected_at,
    requester: toUserSummaryFromJson(row.requester),
    recipient: toUserSummaryFromJson(row.recipient),
  }));
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
  return listConnectionRequests("incoming");
}

export async function listOutgoingConnectionRequests(userId: string): Promise<ConnectionRequest[]> {
  assertValidId(userId, "user id");
  return listConnectionRequests("outgoing");
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

/** One round trip. The RPC only ever reports on `auth.uid()`, so `userId` is the caller's own. */
export const listConversationsForUser = cache(async (userId: string): Promise<ConversationSummary[]> => {
  assertValidId(userId, "user id");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("messaging_list_conversation_summaries");

  if (error) throw error;
  return ((data ?? []) as ConversationSummaryRow[]).map((row) => toSummaryFromRow(row, userId));
});

export async function getConversationForUser(
  userId: string,
  conversationId: string,
): Promise<ConversationDetail | null> {
  assertValidId(userId, "user id");
  assertValidId(conversationId, "conversation id");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("messaging_get_conversation_detail", {
    p_conversation_id: conversationId,
  });

  if (error) throw error;
  // Null means the caller is not an active participant, or the conversation is gone. The
  // RPC does the membership check itself, so there is no separate probe to run first.
  if (!data) return null;

  const detail = data as {
    conversation: any;
    own_participant: any;
    other_participant: any;
    messages: any[];
    unread_count: number;
  };

  const summary = toSummaryFromRow(
    {
      conversation_id: detail.conversation.id,
      conversation_type: detail.conversation.type,
      created_at: detail.conversation.created_at,
      updated_at: detail.conversation.updated_at,
      last_message_at: detail.conversation.last_message_at,
      created_by: detail.conversation.created_by,
      source_request_id: detail.conversation.source_request_id,
      own_participant_id: detail.own_participant.id,
      own_joined_at: detail.own_participant.joined_at,
      own_last_read_at: detail.own_participant.last_read_at,
      other_participant_id: detail.other_participant?.id ?? null,
      other_joined_at: detail.other_participant?.joined_at ?? null,
      other_last_read_at: detail.other_participant?.last_read_at ?? null,
      other_user_id: detail.other_participant?.user_id ?? null,
      other_email: detail.other_participant?.user?.email ?? null,
      other_name: detail.other_participant?.user?.name ?? null,
      other_image: detail.other_participant?.user?.image ?? null,
      other_role: detail.other_participant?.user?.role ?? null,
      other_is_system_account: detail.other_participant?.user?.is_system_account ?? null,
      other_is_admin_support_account:
        detail.other_participant?.user?.is_admin_support_account ?? null,
      last_message_id: null,
      last_message_body: null,
      last_message_sender_id: null,
      last_message_created_at: null,
      last_message_updated_at: null,
      unread_count: detail.unread_count,
    },
    userId,
  );

  const messages = (detail.messages ?? []).map(toMessage);

  return {
    ...summary,
    lastMessage: messages.length ? messages[messages.length - 1] : null,
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

/**
 * The nav badge asks for this on every authenticated page render. It used to fetch every
 * message row the user could see and count them in JS; it is now one aggregate served off
 * `messages_unread_lookup_idx`.
 */
export const getUnreadConversationCountForUser = cache(async (userId: string): Promise<number> => {
  assertValidId(userId, "user id");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("messaging_unread_conversation_count");

  if (error) throw error;
  return Number(data ?? 0);
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
