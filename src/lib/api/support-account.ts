import { randomUUID } from "crypto";

import { MESSAGE_BODY_MAX_LENGTH } from "@/lib/api/messaging";
import type { MessageRecord, MessagingUserSummary } from "@/lib/api/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getMotivoSupportAccountEmail } from "@/lib/support-identity";

const SUPPORT_DISPLAY_NAME = "Motivo";

export type SupportUserSearchResult = {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
};

export type SupportConversationForAdmin = {
  conversationId: string;
  targetUser: SupportUserSearchResult;
  supportUser: MessagingUserSummary;
  messages: MessageRecord[];
};

function normalizeMessageBody(value: FormDataEntryValue | string | null) {
  const body = String(value ?? "").trim();
  if (!body) throw new Error("Add a message.");
  if (body.length > MESSAGE_BODY_MAX_LENGTH) {
    throw new Error(`Keep the message under ${MESSAGE_BODY_MAX_LENGTH} characters.`);
  }
  return body;
}

function toSupportUser(raw: any): MessagingUserSummary {
  return {
    id: raw.id,
    email: raw.email ?? null,
    name: SUPPORT_DISPLAY_NAME,
    image: raw.image ?? null,
    role: raw.role ?? null,
    isSystemAccount: true,
    isAdminSupportAccount: true,
  };
}

function toSearchResult(raw: any): SupportUserSearchResult {
  return {
    id: raw.id,
    email: raw.email ?? null,
    name: raw.name ?? null,
    role: raw.role ?? null,
  };
}

function toMessage(raw: any): MessageRecord {
  return {
    id: raw.id,
    conversationId: raw.conversation_id,
    senderId: raw.sender_id,
    body: raw.body,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    deletedAt: raw.deleted_at,
    sender: raw.sender
      ? {
          id: raw.sender.id,
          email: raw.sender.email ?? null,
          name: raw.sender.is_admin_support_account ? SUPPORT_DISPLAY_NAME : raw.sender.name ?? null,
          image: raw.sender.image ?? null,
          role: raw.sender.role ?? null,
          isSystemAccount: raw.sender.is_system_account ?? false,
          isAdminSupportAccount: raw.sender.is_admin_support_account ?? false,
        }
      : undefined,
  };
}

async function findAuthUserByEmail(email: string) {
  const supabase = createSupabaseAdminClient();
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const found = data.users.find((user) => user.email?.toLowerCase() === email);
    if (found) return found;
    if (data.users.length < 1000) return null;
  }
  return null;
}

export async function getMotivoSupportAccount(): Promise<MessagingUserSummary> {
  const supabase = createSupabaseAdminClient();
  const email = getMotivoSupportAccountEmail();

  const { data: flaggedUser, error: flaggedError } = await supabase
    .from("app_user")
    .select("id, email, name, image, role, is_system_account, is_admin_support_account")
    .eq("is_admin_support_account", true)
    .maybeSingle();

  if (flaggedError && flaggedError.code !== "PGRST116") throw flaggedError;

  if (flaggedUser) {
    if (flaggedUser.email?.toLowerCase() !== email || flaggedUser.name !== SUPPORT_DISPLAY_NAME) {
      const { data: updated, error: updateError } = await supabase
        .from("app_user")
        .update({
          email,
          name: SUPPORT_DISPLAY_NAME,
          is_system_account: true,
          is_admin_support_account: true,
          is_public: false,
          is_verified: true,
        })
        .eq("id", flaggedUser.id)
        .select("id, email, name, image, role, is_system_account, is_admin_support_account")
        .single();

      if (updateError) throw updateError;
      return toSupportUser(updated);
    }

    return toSupportUser(flaggedUser);
  }

  const authUser = await findAuthUserByEmail(email);
  let authUserId = authUser?.id ?? null;

  if (authUserId) {
    const { data: existingAppUser, error: existingAppUserError } = await supabase
      .from("app_user")
      .select("id, is_system_account, is_admin_support_account")
      .eq("id", authUserId)
      .maybeSingle();

    if (existingAppUserError && existingAppUserError.code !== "PGRST116") {
      throw existingAppUserError;
    }

    if (
      existingAppUser &&
      !existingAppUser.is_system_account &&
      !existingAppUser.is_admin_support_account
    ) {
      throw new Error(
        "MOTIVO_SUPPORT_ACCOUNT_EMAIL belongs to an existing normal user. Use a dedicated support email or mark a system account explicitly.",
      );
    }
  } else {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password: `${randomUUID()}${randomUUID()}`,
      user_metadata: { name: SUPPORT_DISPLAY_NAME, full_name: SUPPORT_DISPLAY_NAME },
    });

    if (createError) throw createError;
    authUserId = created.user.id;
  }

  const { data: supportUser, error: upsertError } = await supabase
    .from("app_user")
    .upsert(
      {
        id: authUserId,
        email,
        name: SUPPORT_DISPLAY_NAME,
        role: null,
        is_public: false,
        is_verified: true,
        moderation_status: "active",
        is_system_account: true,
        is_admin_support_account: true,
      },
      { onConflict: "id" },
    )
    .select("id, email, name, image, role, is_system_account, is_admin_support_account")
    .single();

  if (upsertError) throw upsertError;
  return toSupportUser(supportUser);
}

export async function searchUsersForSupport(query: string): Promise<SupportUserSearchResult[]> {
  const supabase = createSupabaseAdminClient();
  const support = await getMotivoSupportAccount();
  const term = query.trim();

  let request = supabase
    .from("app_user")
    .select("id, email, name, role")
    .neq("id", support.id)
    .order("created_at", { ascending: false })
    .limit(25);

  if (term) {
    const escaped = term.replaceAll("%", "\\%").replaceAll("_", "\\_");
    const filters = [`email.ilike.%${escaped}%`, `name.ilike.%${escaped}%`];
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(term)) {
      filters.push(`id.eq.${term}`);
    }
    request = request.or(filters.join(","));
  }

  const { data, error } = await request;
  if (error) throw error;
  return (data ?? []).map(toSearchResult);
}

async function getAppUser(userId: string): Promise<SupportUserSearchResult | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("app_user")
    .select("id, email, name, role")
    .eq("id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return data ? toSearchResult(data) : null;
}

export async function getOrCreateSupportConversationForUser(targetUserId: string) {
  const supabase = createSupabaseAdminClient();
  const support = await getMotivoSupportAccount();
  if (targetUserId === support.id) {
    throw new Error("Choose a user account, not the Motivo support account.");
  }

  const targetUser = await getAppUser(targetUserId);
  if (!targetUser) throw new Error("User not found.");

  const { data: participantRows, error: participantError } = await supabase
    .from("conversation_participants")
    .select("conversation_id, user_id, deleted_at")
    .in("user_id", [support.id, targetUserId]);

  if (participantError) throw participantError;

  const participantsByConversation = new Map<string, Set<string>>();
  for (const row of participantRows ?? []) {
    const set = participantsByConversation.get(row.conversation_id) ?? new Set<string>();
    set.add(row.user_id);
    participantsByConversation.set(row.conversation_id, set);
  }

  const candidateConversationIds = Array.from(participantsByConversation.entries())
    .filter(([, userIds]) => userIds.has(support.id) && userIds.has(targetUserId))
    .map(([conversationId]) => conversationId);

  if (candidateConversationIds.length) {
    const { data: existingConversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id")
      .in("id", candidateConversationIds)
      .eq("type", "direct")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (conversationError && conversationError.code !== "PGRST116") throw conversationError;

    if (existingConversation) {
      const { error: restoreError } = await supabase
        .from("conversation_participants")
        .update({ deleted_at: null })
        .eq("conversation_id", existingConversation.id)
        .in("user_id", [support.id, targetUserId]);

      if (restoreError) throw restoreError;
      return { conversationId: existingConversation.id, support, targetUser };
    }
  }

  const conversationId = randomUUID();
  const now = new Date().toISOString();
  const { error: conversationInsertError } = await supabase
    .from("conversations")
    .insert({
      id: conversationId,
      type: "direct",
      created_by: support.id,
      last_message_at: null,
    });

  if (conversationInsertError) throw conversationInsertError;

  const { error: participantInsertError } = await supabase
    .from("conversation_participants")
    .insert([
      {
        id: randomUUID(),
        conversation_id: conversationId,
        user_id: support.id,
        joined_at: now,
        last_read_at: now,
      },
      {
        id: randomUUID(),
        conversation_id: conversationId,
        user_id: targetUserId,
        joined_at: now,
        last_read_at: now,
      },
    ]);

  if (participantInsertError) throw participantInsertError;
  return { conversationId, support, targetUser };
}

export async function getSupportConversationForAdmin(
  targetUserId: string,
): Promise<SupportConversationForAdmin> {
  const supabase = createSupabaseAdminClient();
  const { conversationId, support, targetUser } =
    await getOrCreateSupportConversationForUser(targetUserId);

  const { data: messages, error } = await supabase
    .from("messages")
    .select(
      "*, sender:app_user!messages_sender_id_fkey(id, email, name, image, role, is_system_account, is_admin_support_account)",
    )
    .eq("conversation_id", conversationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return {
    conversationId,
    supportUser: support,
    targetUser,
    messages: (messages ?? []).map(toMessage),
  };
}

export async function sendSupportMessageAsMotivo({
  adminEmail,
  targetUserId,
  body,
}: {
  adminEmail: string;
  targetUserId: string;
  body: string;
}) {
  const supabase = createSupabaseAdminClient();
  const normalizedBody = normalizeMessageBody(body);
  const { conversationId, support } = await getOrCreateSupportConversationForUser(targetUserId);
  const now = new Date().toISOString();
  const messageId = randomUUID();

  const { data: message, error: messageError } = await supabase
    .from("messages")
    .insert({
      id: messageId,
      conversation_id: conversationId,
      sender_id: support.id,
      body: normalizedBody,
    })
    .select(
      "*, sender:app_user!messages_sender_id_fkey(id, email, name, image, role, is_system_account, is_admin_support_account)",
    )
    .single();

  if (messageError) throw messageError;

  const { error: conversationError } = await supabase
    .from("conversations")
    .update({ last_message_at: now })
    .eq("id", conversationId);

  if (conversationError) throw conversationError;

  const { error: readError } = await supabase
    .from("conversation_participants")
    .update({ last_read_at: now, deleted_at: null })
    .eq("conversation_id", conversationId)
    .eq("user_id", support.id);

  if (readError) throw readError;

  const { error: auditError } = await supabase.from("admin_audit_log").insert({
    admin_user_email: adminEmail,
    action: "send_support_message",
    target_type: "user",
    target_id: targetUserId,
    reason: `conversation:${conversationId}; message:${messageId}`,
  });

  if (auditError) {
    console.error("[admin-support] audit log failed", auditError);
  }

  return toMessage(message);
}
