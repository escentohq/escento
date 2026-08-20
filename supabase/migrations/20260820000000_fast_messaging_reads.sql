-- Messaging read path: collapse the per-page fan-out into single round trips.
--
-- The inbox used to cost five sequential PostgREST round trips and ten queries, and
-- getMessageRows() transferred *every* message of *every* conversation just to derive a
-- one-line preview and an unread count. The embedded `user:app_user!...` joins in those
-- selects always resolved to NULL (app_user RLS is select-own), so a second pass over the
-- service-role client re-read the same identities. Everything below moves that work into
-- the database, where the indexes already are.
--
-- All four functions derive the caller from auth.uid() rather than taking a user id, so a
-- SECURITY DEFINER body cannot be pointed at somebody else's inbox. A NULL auth.uid()
-- matches no participant row and yields the empty result.

-- ---------------------------------------------------------------------------
-- Inbox list: one row per conversation, with the other party, last message and
-- unread count already resolved.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."messaging_list_conversation_summaries"()
RETURNS TABLE (
  "conversation_id" "text",
  "conversation_type" "text",
  "created_at" timestamp with time zone,
  "updated_at" timestamp with time zone,
  "last_message_at" timestamp with time zone,
  "created_by" "uuid",
  "source_request_id" "text",
  "own_participant_id" "text",
  "own_joined_at" timestamp with time zone,
  "own_last_read_at" timestamp with time zone,
  "other_participant_id" "text",
  "other_joined_at" timestamp with time zone,
  "other_last_read_at" timestamp with time zone,
  "other_user_id" "uuid",
  "other_email" "text",
  "other_name" "text",
  "other_image" "text",
  "other_role" "text",
  "other_is_system_account" boolean,
  "other_is_admin_support_account" boolean,
  "last_message_id" "text",
  "last_message_body" "text",
  "last_message_sender_id" "uuid",
  "last_message_created_at" timestamp with time zone,
  "last_message_updated_at" timestamp with time zone,
  "unread_count" integer
)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  with own as (
    select cp.id, cp.conversation_id, cp.user_id, cp.joined_at, cp.last_read_at
    from conversation_participants cp
    where cp.user_id = (select auth.uid())
      and cp.deleted_at is null
  )
  select
    c.id,
    c.type,
    c.created_at,
    c.updated_at,
    c.last_message_at,
    c.created_by,
    c.source_request_id,
    own.id,
    own.joined_at,
    own.last_read_at,
    other.id,
    other.joined_at,
    other.last_read_at,
    other.user_id,
    ou.email,
    case
      when ou.is_admin_support_account then 'Escento'
      when ou.role = 'MUSICIAN' then coalesce(nullif(mp.display_name, ''), nullif(ou.name, ''))
      else coalesce(nullif(ou.name, ''), nullif(mp.display_name, ''))
    end,
    ou.image,
    ou.role::text,
    ou.is_system_account,
    ou.is_admin_support_account,
    lm.id,
    lm.body,
    lm.sender_id,
    lm.created_at,
    lm.updated_at,
    coalesce(unread.unread_count, 0)::int
  from own
  join conversations c on c.id = own.conversation_id
  left join lateral (
    select cp2.id, cp2.user_id, cp2.joined_at, cp2.last_read_at
    from conversation_participants cp2
    where cp2.conversation_id = own.conversation_id
      and cp2.user_id <> own.user_id
      and cp2.deleted_at is null
    order by cp2.joined_at
    limit 1
  ) other on true
  left join app_user ou on ou.id = other.user_id
  left join musician_profile mp on mp.user_id = other.user_id
  left join lateral (
    select m.id, m.body, m.sender_id, m.created_at, m.updated_at
    from messages m
    where m.conversation_id = own.conversation_id
      and m.deleted_at is null
    order by m.created_at desc
    limit 1
  ) lm on true
  left join lateral (
    select count(*) as unread_count
    from messages m2
    where m2.conversation_id = own.conversation_id
      and m2.deleted_at is null
      and m2.sender_id <> own.user_id
      and m2.created_at > coalesce(own.last_read_at, '-infinity'::timestamptz)
  ) unread on true
  order by c.last_message_at desc nulls last, c.updated_at desc;
$$;

ALTER FUNCTION "public"."messaging_list_conversation_summaries"() OWNER TO "postgres";

REVOKE ALL ON FUNCTION "public"."messaging_list_conversation_summaries"() FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."messaging_list_conversation_summaries"() FROM "anon";
GRANT EXECUTE ON FUNCTION "public"."messaging_list_conversation_summaries"() TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."messaging_list_conversation_summaries"() TO "service_role";


-- ---------------------------------------------------------------------------
-- Thread view: conversation, both participants and the full message list in one row.
-- Returns NULL when the caller is not an active participant, which the caller maps to
-- notFound() exactly as the old membership probe did.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."messaging_get_conversation_detail"("p_conversation_id" "text")
RETURNS "jsonb"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  with own as (
    select cp.id, cp.conversation_id, cp.user_id, cp.joined_at, cp.last_read_at
    from conversation_participants cp
    where cp.conversation_id = p_conversation_id
      and cp.user_id = (select auth.uid())
      and cp.deleted_at is null
  )
  select jsonb_build_object(
    'conversation', jsonb_build_object(
      'id', c.id,
      'type', c.type,
      'created_at', c.created_at,
      'updated_at', c.updated_at,
      'last_message_at', c.last_message_at,
      'created_by', c.created_by,
      'source_request_id', c.source_request_id
    ),
    'own_participant', jsonb_build_object(
      'id', own.id,
      'conversation_id', own.conversation_id,
      'user_id', own.user_id,
      'joined_at', own.joined_at,
      'last_read_at', own.last_read_at
    ),
    'other_participant', case when other.id is null then null else jsonb_build_object(
      'id', other.id,
      'conversation_id', own.conversation_id,
      'user_id', other.user_id,
      'joined_at', other.joined_at,
      'last_read_at', other.last_read_at,
      'user', jsonb_build_object(
        'id', ou.id,
        'email', ou.email,
        'name', case
          when ou.is_admin_support_account then 'Escento'
          when ou.role = 'MUSICIAN' then coalesce(nullif(mp.display_name, ''), nullif(ou.name, ''))
          else coalesce(nullif(ou.name, ''), nullif(mp.display_name, ''))
        end,
        'image', ou.image,
        'role', ou.role::text,
        'is_system_account', ou.is_system_account,
        'is_admin_support_account', ou.is_admin_support_account
      )
    ) end,
    'messages', coalesce(thread.messages, '[]'::jsonb),
    'unread_count', coalesce(unread.unread_count, 0)
  )
  from own
  join conversations c on c.id = own.conversation_id
  left join lateral (
    select cp2.id, cp2.user_id, cp2.joined_at, cp2.last_read_at
    from conversation_participants cp2
    where cp2.conversation_id = own.conversation_id
      and cp2.user_id <> own.user_id
      and cp2.deleted_at is null
    order by cp2.joined_at
    limit 1
  ) other on true
  left join app_user ou on ou.id = other.user_id
  left join musician_profile mp on mp.user_id = other.user_id
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'id', m.id,
        'conversation_id', m.conversation_id,
        'sender_id', m.sender_id,
        'body', m.body,
        'created_at', m.created_at,
        'updated_at', m.updated_at,
        'deleted_at', m.deleted_at
      )
      order by m.created_at
    ) as messages
    from messages m
    where m.conversation_id = own.conversation_id
      and m.deleted_at is null
  ) thread on true
  left join lateral (
    select count(*) as unread_count
    from messages m2
    where m2.conversation_id = own.conversation_id
      and m2.deleted_at is null
      and m2.sender_id <> own.user_id
      and m2.created_at > coalesce(own.last_read_at, '-infinity'::timestamptz)
  ) unread on true;
$$;

ALTER FUNCTION "public"."messaging_get_conversation_detail"("p_conversation_id" "text") OWNER TO "postgres";

REVOKE ALL ON FUNCTION "public"."messaging_get_conversation_detail"("p_conversation_id" "text") FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."messaging_get_conversation_detail"("p_conversation_id" "text") FROM "anon";
GRANT EXECUTE ON FUNCTION "public"."messaging_get_conversation_detail"("p_conversation_id" "text") TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."messaging_get_conversation_detail"("p_conversation_id" "text") TO "service_role";


-- ---------------------------------------------------------------------------
-- Nav badge: this fires on every authenticated page render, and used to pull every
-- message row the user could see. One aggregate now.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "public"."messaging_unread_conversation_count"()
RETURNS integer
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select coalesce(count(*), 0)::int
  from conversation_participants cp
  where cp.user_id = (select auth.uid())
    and cp.deleted_at is null
    and exists (
      select 1
      from messages m
      where m.conversation_id = cp.conversation_id
        and m.deleted_at is null
        and m.sender_id <> cp.user_id
        and m.created_at > coalesce(cp.last_read_at, '-infinity'::timestamptz)
    );
$$;

ALTER FUNCTION "public"."messaging_unread_conversation_count"() OWNER TO "postgres";

REVOKE ALL ON FUNCTION "public"."messaging_unread_conversation_count"() FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."messaging_unread_conversation_count"() FROM "anon";
GRANT EXECUTE ON FUNCTION "public"."messaging_unread_conversation_count"() TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."messaging_unread_conversation_count"() TO "service_role";


-- ---------------------------------------------------------------------------
-- Connection requests, with both parties' display identity resolved. Replaces a select
-- plus a second service-role pass over app_user and musician_profile.
-- ---------------------------------------------------------------------------
-- Shared identity resolver: same precedence the TypeScript normalizer used.
CREATE OR REPLACE FUNCTION "public"."messaging_user_summary_json"("p_user_id" "uuid")
RETURNS "jsonb"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select jsonb_build_object(
    'id', u.id,
    'email', u.email,
    'name', case
      when u.is_admin_support_account then 'Escento'
      when u.role = 'MUSICIAN' then coalesce(nullif(mp.display_name, ''), nullif(u.name, ''))
      else coalesce(nullif(u.name, ''), nullif(mp.display_name, ''))
    end,
    'image', u.image,
    'role', u.role::text,
    'is_system_account', u.is_system_account,
    'is_admin_support_account', u.is_admin_support_account
  )
  from app_user u
  left join musician_profile mp on mp.user_id = u.id
  where u.id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION "public"."messaging_list_connection_requests"("p_direction" "text")
RETURNS "jsonb"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', cr.id,
        'requester_id', cr.requester_id,
        'recipient_id', cr.recipient_id,
        'status', cr.status,
        'intro_message', cr.intro_message,
        'created_at', cr.created_at,
        'updated_at', cr.updated_at,
        'accepted_at', cr.accepted_at,
        'rejected_at', cr.rejected_at,
        'requester', messaging_user_summary_json(cr.requester_id),
        'recipient', messaging_user_summary_json(cr.recipient_id)
      )
      order by cr.created_at desc
    ),
    '[]'::jsonb
  )
  from conversation_requests cr
  where (select auth.uid()) is not null
    and (
      (p_direction = 'incoming' and cr.recipient_id = (select auth.uid()))
      or (p_direction = 'outgoing' and cr.requester_id = (select auth.uid()))
    );
$$;

ALTER FUNCTION "public"."messaging_user_summary_json"("p_user_id" "uuid") OWNER TO "postgres";
ALTER FUNCTION "public"."messaging_list_connection_requests"("p_direction" "text") OWNER TO "postgres";

REVOKE ALL ON FUNCTION "public"."messaging_user_summary_json"("p_user_id" "uuid") FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."messaging_user_summary_json"("p_user_id" "uuid") FROM "anon";
REVOKE ALL ON FUNCTION "public"."messaging_user_summary_json"("p_user_id" "uuid") FROM "authenticated";
GRANT EXECUTE ON FUNCTION "public"."messaging_user_summary_json"("p_user_id" "uuid") TO "service_role";

REVOKE ALL ON FUNCTION "public"."messaging_list_connection_requests"("p_direction" "text") FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."messaging_list_connection_requests"("p_direction" "text") FROM "anon";
GRANT EXECUTE ON FUNCTION "public"."messaging_list_connection_requests"("p_direction" "text") TO "authenticated";
GRANT EXECUTE ON FUNCTION "public"."messaging_list_connection_requests"("p_direction" "text") TO "service_role";


-- ---------------------------------------------------------------------------
-- RLS: evaluate auth.uid() once per statement instead of once per row.
--
-- Unwrapped, `auth.uid()` is re-read and messaging_is_active_participant() re-invoked for
-- every candidate row, so a thread scan paid one SECURITY DEFINER call per message.
-- Wrapping the call in a scalar subquery lets the planner hoist it into an InitPlan. The
-- predicates are otherwise unchanged.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "participants can select conversations" ON "public"."conversations";
CREATE POLICY "participants can select conversations" ON "public"."conversations"
  FOR SELECT USING ("public"."messaging_is_active_participant"("id", (select "auth"."uid"())));

DROP POLICY IF EXISTS "participants can update conversations" ON "public"."conversations";
CREATE POLICY "participants can update conversations" ON "public"."conversations"
  FOR UPDATE USING ("public"."messaging_is_active_participant"("id", (select "auth"."uid"())))
  WITH CHECK ("public"."messaging_is_active_participant"("id", (select "auth"."uid"())));

DROP POLICY IF EXISTS "participants can select messages" ON "public"."messages";
CREATE POLICY "participants can select messages" ON "public"."messages"
  FOR SELECT USING (
    ("deleted_at" IS NULL)
    AND "public"."messaging_is_active_participant"("conversation_id", (select "auth"."uid"()))
  );

DROP POLICY IF EXISTS "participants can send messages" ON "public"."messages";
CREATE POLICY "participants can send messages" ON "public"."messages"
  FOR INSERT WITH CHECK (
    ("sender_id" = (select "auth"."uid"()))
    AND "public"."messaging_is_active_participant"("conversation_id", (select "auth"."uid"()))
  );

DROP POLICY IF EXISTS "participants can select participants" ON "public"."conversation_participants";
CREATE POLICY "participants can select participants" ON "public"."conversation_participants"
  FOR SELECT USING ("public"."messaging_is_active_participant"("conversation_id", (select "auth"."uid"())));

DROP POLICY IF EXISTS "users can update own participant row" ON "public"."conversation_participants";
CREATE POLICY "users can update own participant row" ON "public"."conversation_participants"
  FOR UPDATE USING (("user_id" = (select "auth"."uid"())))
  WITH CHECK (("user_id" = (select "auth"."uid"())));

DROP POLICY IF EXISTS "users can create conversations" ON "public"."conversations";
CREATE POLICY "users can create conversations" ON "public"."conversations"
  FOR INSERT WITH CHECK (("created_by" = (select "auth"."uid"())));

DROP POLICY IF EXISTS "senders can update own messages" ON "public"."messages";
CREATE POLICY "senders can update own messages" ON "public"."messages"
  FOR UPDATE USING (("sender_id" = (select "auth"."uid"())))
  WITH CHECK (("sender_id" = (select "auth"."uid"())));

DROP POLICY IF EXISTS "request parties can create participants" ON "public"."conversation_participants";
CREATE POLICY "request parties can create participants" ON "public"."conversation_participants"
  FOR INSERT WITH CHECK (
    (
      ("user_id" = (select "auth"."uid"()))
      AND (EXISTS (
        SELECT 1 FROM "public"."conversations" c
        WHERE c."id" = "conversation_participants"."conversation_id"
          AND c."created_by" = (select "auth"."uid"())
      ))
    )
    OR (EXISTS (
      SELECT 1
      FROM "public"."conversations" c
      JOIN "public"."conversation_requests" cr ON cr."id" = c."source_request_id"
      WHERE c."id" = "conversation_participants"."conversation_id"
        AND ((select "auth"."uid"()) = cr."requester_id" OR (select "auth"."uid"()) = cr."recipient_id")
        AND ("conversation_participants"."user_id" = cr."requester_id"
             OR "conversation_participants"."user_id" = cr."recipient_id")
    ))
  );
