"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth-guards";
import {
  acceptConnectionRequestForUser,
  blockUserForUser,
  cancelConnectionRequestForUser,
  createConnectionRequest,
  createMessageForUser,
  deleteConversationForUser as deleteConversationForUserService,
  getConversationForUser,
  getUnreadConversationSummariesForUser as getUnreadConversationSummaries,
  getUnreadMessageCountForUser as getUnreadMessageCount,
  listBlockedUsersForUser,
  listConversationsForUser,
  listIncomingConnectionRequests,
  listOutgoingConnectionRequests,
  markConversationReadForUser,
  rejectConnectionRequestForUser,
  unblockUserForUser,
} from "@/lib/api/messaging";
import { isEscentoSupportSummary } from "@/lib/support-identity";
import { isEscentoSupportUserId } from "@/lib/api/support-account";
import { ACCOUNT_NAME_PATH, hasPublicName } from "@/lib/public-name";

const MESSAGES_CALLBACK_URL = "/messages";

export async function sendConnectionRequest(
  recipientId: string,
  optionalIntroMessage?: string | null,
) {
  const session = await requireUser(MESSAGES_CALLBACK_URL);
  if (session.user.capabilities.includes("CREATOR") && !hasPublicName(session.user.name)) {
    redirect(ACCOUNT_NAME_PATH);
  }
  const request = await createConnectionRequest(
    session.user.id,
    recipientId,
    optionalIntroMessage,
  );

  revalidatePath("/messages");
  return request;
}

export async function getIncomingConnectionRequests() {
  const session = await requireUser(MESSAGES_CALLBACK_URL);
  return listIncomingConnectionRequests(session.user.id);
}

export async function getOutgoingConnectionRequests() {
  const session = await requireUser(MESSAGES_CALLBACK_URL);
  return listOutgoingConnectionRequests(session.user.id);
}

export async function acceptConnectionRequest(requestId: string) {
  const session = await requireUser(MESSAGES_CALLBACK_URL);
  const conversation = await acceptConnectionRequestForUser(session.user.id, requestId);

  revalidatePath("/messages");
  return conversation;
}

export async function rejectConnectionRequest(requestId: string) {
  const session = await requireUser(MESSAGES_CALLBACK_URL);
  await rejectConnectionRequestForUser(session.user.id, requestId);

  revalidatePath("/messages");
  revalidatePath("/messages/requests");
}

export async function cancelConnectionRequest(requestId: string) {
  const session = await requireUser(MESSAGES_CALLBACK_URL);
  await cancelConnectionRequestForUser(session.user.id, requestId);

  revalidatePath("/messages");
  revalidatePath("/messages/requests");
}

export async function getMyConversations() {
  const session = await requireUser(MESSAGES_CALLBACK_URL);
  return listConversationsForUser(session.user.id);
}

export async function getConversation(conversationId: string) {
  const session = await requireUser(MESSAGES_CALLBACK_URL);
  return getConversationForUser(session.user.id, conversationId);
}

export async function sendMessage(conversationId: string, body: string) {
  const session = await requireUser(MESSAGES_CALLBACK_URL);
  const message = await createMessageForUser(session.user.id, conversationId, body);

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  return message;
}

export async function markConversationAsRead(conversationId: string) {
  const session = await requireUser(MESSAGES_CALLBACK_URL);
  await markConversationReadForUser(session.user.id, conversationId);

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
}

export async function deleteConversationForMe(conversationId: string) {
  const session = await requireUser(MESSAGES_CALLBACK_URL);
  const conversation = await getConversationForUser(session.user.id, conversationId);
  if (isEscentoSupportSummary(conversation?.otherParticipant?.user)) {
    throw new Error("Escento support conversations cannot be hidden.");
  }

  await deleteConversationForUserService(session.user.id, conversationId);

  revalidatePath("/messages");
}

export async function blockUser(userId: string) {
  const session = await requireUser(MESSAGES_CALLBACK_URL);
  if (await isEscentoSupportUserId(userId)) {
    throw new Error("Escento support cannot be blocked.");
  }

  await blockUserForUser(session.user.id, userId);

  revalidatePath("/messages");
}

export async function unblockUser(userId: string) {
  const session = await requireUser(MESSAGES_CALLBACK_URL);
  await unblockUserForUser(session.user.id, userId);

  revalidatePath("/messages");
}

export async function getBlockedUsers() {
  const session = await requireUser(MESSAGES_CALLBACK_URL);
  return listBlockedUsersForUser(session.user.id);
}

export async function getUnreadMessageCountForCurrentUser() {
  const session = await requireUser(MESSAGES_CALLBACK_URL);
  return getUnreadMessageCount(session.user.id);
}

export async function getUnreadConversationSummariesForCurrentUser() {
  const session = await requireUser(MESSAGES_CALLBACK_URL);
  return getUnreadConversationSummaries(session.user.id);
}
