-- Idempotent, transactional account data deletion (MVP-04, issue #32).
--
-- `deleteUserCompletely` ran eight or more destructive PostgREST calls in
-- sequence: conversations, then messages and participants, then requests and
-- blocks, then taxonomy, then profiles, gigs and the app_user row, then storage,
-- then Auth. An error partway through committed everything before it while the
-- user was told the deletion had failed, and a retry started from a half-deleted
-- state that no longer matched what the first pass had read.
--
-- All the database work now happens in one function body, so it is one
-- transaction: it either removes everything or leaves the account intact. Every
-- statement is a DELETE with no preconditions, so running it again on an
-- already-deleted account is a no-op rather than an error, which is what makes a
-- retry converge.
--
-- SECURITY DEFINER because it is invoked by the service-role client on behalf of
-- an account that is about to stop existing; EXECUTE is granted to service_role
-- only, never to anon or authenticated.

CREATE OR REPLACE FUNCTION "public"."delete_app_user_data"("p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  -- conversation ids are TEXT in this schema (application-generated), unlike
  -- the uuid account ids.
  v_conversation_ids text[];
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'A user id is required' USING ERRCODE = 'null_value_not_allowed';
  END IF;

  -- Conversations the account created *or* took part in. Both sides go: a
  -- one-to-one thread with a deleted participant has no readable remainder.
  SELECT coalesce(array_agg(DISTINCT c.id), ARRAY[]::text[])
    INTO v_conversation_ids
    FROM public.conversations c
   WHERE c.created_by = p_user_id
      OR EXISTS (
        SELECT 1 FROM public.conversation_participants p
         WHERE p.conversation_id = c.id AND p.user_id = p_user_id
      );

  DELETE FROM public.messages
   WHERE conversation_id = ANY(v_conversation_ids) OR sender_id = p_user_id;

  DELETE FROM public.conversation_participants
   WHERE conversation_id = ANY(v_conversation_ids) OR user_id = p_user_id;

  DELETE FROM public.conversations WHERE id = ANY(v_conversation_ids);

  DELETE FROM public.conversation_requests
   WHERE requester_id = p_user_id OR recipient_id = p_user_id;

  DELETE FROM public.user_blocks
   WHERE blocker_id = p_user_id OR blocked_id = p_user_id;

  -- Junction rows and reports cascade from these (all FKs are ON DELETE
  -- CASCADE), so they no longer need their own round trips.
  DELETE FROM public.musician_profile WHERE user_id = p_user_id;
  DELETE FROM public.gig WHERE creator_id = p_user_id;
  DELETE FROM public.app_user WHERE id = p_user_id;
END;
$$;

ALTER FUNCTION "public"."delete_app_user_data"("uuid") OWNER TO "postgres";

REVOKE ALL ON FUNCTION "public"."delete_app_user_data"("uuid") FROM PUBLIC;
REVOKE ALL ON FUNCTION "public"."delete_app_user_data"("uuid") FROM "anon";
REVOKE ALL ON FUNCTION "public"."delete_app_user_data"("uuid") FROM "authenticated";
GRANT EXECUTE ON FUNCTION "public"."delete_app_user_data"("uuid") TO "service_role";
