


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."CompensationType" AS ENUM (
    'PAID',
    'UNPAID',
    'NEGOTIABLE'
);


ALTER TYPE "public"."CompensationType" OWNER TO "postgres";


CREATE TYPE "public"."ProjectType" AS ENUM (
    'FILM',
    'LIVE_EVENT',
    'PODCAST',
    'GAME',
    'YOUTUBE',
    'OTHER'
);


ALTER TYPE "public"."ProjectType" OWNER TO "postgres";


CREATE TYPE "public"."UserRole" AS ENUM (
    'MUSICIAN',
    'CREATOR'
);


ALTER TYPE "public"."UserRole" OWNER TO "postgres";


CREATE TYPE "public"."app_role" AS ENUM (
    'MUSICIAN',
    'CREATOR'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."compensation_type" AS ENUM (
    'PAID',
    'UNPAID',
    'NEGOTIABLE'
);


ALTER TYPE "public"."compensation_type" OWNER TO "postgres";


CREATE TYPE "public"."gig_status" AS ENUM (
    'OPEN',
    'CLOSED'
);


ALTER TYPE "public"."gig_status" OWNER TO "postgres";


CREATE TYPE "public"."project_type" AS ENUM (
    'FILM',
    'LIVE_EVENT',
    'PODCAST',
    'GAME',
    'YOUTUBE',
    'OTHER'
);


ALTER TYPE "public"."project_type" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'MUSICIAN',
    'CREATOR'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."content_reports_touch_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."content_reports_touch_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_auth_user_on_app_user_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM auth.users WHERE id = OLD.supabase_user_id::uuid;
  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."delete_auth_user_on_app_user_delete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.app_user (id, email, name, image)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."messaging_accept_connection_request"("p_request_id" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_actor_id uuid := auth.uid();
  v_request conversation_requests%rowtype;
  v_conversation_id text := gen_random_uuid()::text;
begin
  if v_actor_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_request
  from conversation_requests
  where id = p_request_id
    and recipient_id = v_actor_id
    and status = 'pending'
  for update;

  if not found then
    raise exception 'request not found';
  end if;

  if messaging_is_blocked_between(v_request.requester_id, v_request.recipient_id) then
    raise exception 'request blocked';
  end if;

  if messaging_direct_conversation_exists(v_request.requester_id, v_request.recipient_id) then
    raise exception 'direct conversation already exists';
  end if;

  update conversation_requests
  set status = 'accepted',
      accepted_at = now(),
      rejected_at = null
  where id = p_request_id;

  insert into conversations (id, type, created_by, source_request_id)
  values (v_conversation_id, 'direct', v_actor_id, p_request_id);

  insert into conversation_participants (conversation_id, user_id, joined_at, last_read_at)
  values
    (v_conversation_id, v_request.requester_id, now(), now()),
    (v_conversation_id, v_request.recipient_id, now(), now());

  return v_conversation_id;
end;
$$;


ALTER FUNCTION "public"."messaging_accept_connection_request"("p_request_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."messaging_assert_conversation_update_allowed"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if tg_op = 'UPDATE' then
    if new.id <> old.id
      or new.type <> old.type
      or new.created_at <> old.created_at
      or new.created_by <> old.created_by
      or coalesce(new.source_request_id, '') <> coalesce(old.source_request_id, '') then
      raise exception 'conversation identity fields cannot be changed';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."messaging_assert_conversation_update_allowed"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."messaging_assert_direct_participant_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_type text;
  v_active_count integer;
begin
  if tg_op = 'UPDATE' then
    if new.id <> old.id
      or new.conversation_id <> old.conversation_id
      or new.user_id <> old.user_id
      or new.joined_at <> old.joined_at then
      raise exception 'participant identity fields cannot be changed';
    end if;
  end if;

  if new.deleted_at is not null then
    return new;
  end if;

  select type into v_type
  from conversations
  where id = new.conversation_id;

  if v_type = 'direct' then
    select count(*) into v_active_count
    from conversation_participants
    where conversation_id = new.conversation_id
      and deleted_at is null
      and id <> coalesce(new.id, '');

    if v_active_count >= 2 then
      raise exception 'direct conversations can have at most 2 active participants';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."messaging_assert_direct_participant_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."messaging_assert_message_allowed"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_type text;
  v_other_user_id uuid;
begin
  new.body = btrim(new.body);

  if tg_op = 'UPDATE' then
    if new.id <> old.id
      or new.conversation_id <> old.conversation_id
      or new.sender_id <> old.sender_id
      or new.created_at <> old.created_at then
      raise exception 'message identity fields cannot be changed';
    end if;
  end if;

  if not messaging_is_active_participant(new.conversation_id, new.sender_id) then
    raise exception 'sender is not an active participant';
  end if;

  select type into v_type
  from conversations
  where id = new.conversation_id;

  if v_type = 'direct' then
    select cp.user_id into v_other_user_id
    from conversation_participants cp
    where cp.conversation_id = new.conversation_id
      and cp.user_id <> new.sender_id
      and cp.deleted_at is null
    limit 1;

    if v_other_user_id is not null
      and messaging_is_blocked_between(new.sender_id, v_other_user_id) then
      raise exception 'message blocked';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."messaging_assert_message_allowed"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."messaging_assert_request_allowed"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_actor_id uuid := auth.uid();
begin
  new.intro_message = nullif(btrim(coalesce(new.intro_message, '')), '');

  if tg_op = 'UPDATE' then
    if new.requester_id <> old.requester_id
      or new.recipient_id <> old.recipient_id
      or new.created_at <> old.created_at then
      raise exception 'request identity fields cannot be changed';
    end if;

    if old.status <> new.status then
      if old.status <> 'pending' then
        raise exception 'processed requests cannot change status';
      end if;

      if new.status = 'accepted' and v_actor_id <> old.recipient_id then
        raise exception 'only the recipient can accept a request';
      end if;

      if new.status = 'rejected' and v_actor_id <> old.recipient_id then
        raise exception 'only the recipient can reject a request';
      end if;

      if new.status = 'cancelled' and v_actor_id <> old.requester_id then
        raise exception 'only the requester can cancel a request';
      end if;
    end if;
  end if;

  if new.status = 'pending' then
    if messaging_is_blocked_between(new.requester_id, new.recipient_id) then
      raise exception 'request blocked';
    end if;

    if messaging_direct_conversation_exists(new.requester_id, new.recipient_id) then
      raise exception 'direct conversation already exists';
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."messaging_assert_request_allowed"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."messaging_direct_conversation_exists"("p_user_a" "uuid", "p_user_b" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from conversations c
    join conversation_participants cpa
      on cpa.conversation_id = c.id
     and cpa.user_id = p_user_a
     and cpa.deleted_at is null
    join conversation_participants cpb
      on cpb.conversation_id = c.id
     and cpb.user_id = p_user_b
     and cpb.deleted_at is null
    where c.type = 'direct'
  );
$$;


ALTER FUNCTION "public"."messaging_direct_conversation_exists"("p_user_a" "uuid", "p_user_b" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."messaging_is_active_participant"("p_conversation_id" "text", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from conversation_participants cp
    where cp.conversation_id = p_conversation_id
      and cp.user_id = p_user_id
      and cp.deleted_at is null
  );
$$;


ALTER FUNCTION "public"."messaging_is_active_participant"("p_conversation_id" "text", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."messaging_is_blocked_between"("p_user_a" "uuid", "p_user_b" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from user_blocks ub
    where (ub.blocker_id = p_user_a and ub.blocked_id = p_user_b)
       or (ub.blocker_id = p_user_b and ub.blocked_id = p_user_a)
  );
$$;


ALTER FUNCTION "public"."messaging_is_blocked_between"("p_user_a" "uuid", "p_user_b" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."messaging_is_request_party"("p_request_id" "text", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from conversation_requests cr
    where cr.id = p_request_id
      and p_user_id in (cr.requester_id, cr.recipient_id)
  );
$$;


ALTER FUNCTION "public"."messaging_is_request_party"("p_request_id" "text", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."messaging_touch_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."messaging_touch_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_user_email" "text" NOT NULL,
    "action" "text" NOT NULL,
    "target_type" "text" NOT NULL,
    "target_id" "text" NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "admin_audit_log_target_type_check" CHECK (("target_type" = ANY (ARRAY['user'::"text", 'musician_profile'::"text", 'creator_profile'::"text", 'gig'::"text"])))
);


ALTER TABLE "public"."admin_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_user" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "name" "text",
    "image" "text",
    "role" "public"."app_role",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_public" boolean DEFAULT true NOT NULL,
    "is_verified" boolean DEFAULT false NOT NULL,
    "moderation_status" "text" DEFAULT 'active'::"text" NOT NULL,
    "admin_notes" "text",
    "is_system_account" boolean DEFAULT false NOT NULL,
    "is_admin_support_account" boolean DEFAULT false NOT NULL,
    "support_welcome_sent_at" timestamp with time zone,
    CONSTRAINT "app_user_moderation_status_check" CHECK (("moderation_status" = ANY (ARRAY['active'::"text", 'hidden'::"text", 'needs_review'::"text"])))
);


ALTER TABLE "public"."app_user" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."content_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reporter_id" "uuid" NOT NULL,
    "target_type" "text" NOT NULL,
    "target_id" "uuid" NOT NULL,
    "target_owner_id" "uuid",
    "subject" "text" NOT NULL,
    "description" "text" NOT NULL,
    "evidence" "text",
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "admin_notes" "text",
    "resolved_by" "uuid",
    "resolved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "content_reports_description_length_check" CHECK ((("char_length"("btrim"("description")) >= 10) AND ("char_length"("btrim"("description")) <= 4000))),
    CONSTRAINT "content_reports_evidence_length_check" CHECK ((("evidence" IS NULL) OR ("char_length"("btrim"("evidence")) <= 2000))),
    CONSTRAINT "content_reports_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'reviewing'::"text", 'resolved'::"text", 'dismissed'::"text"]))),
    CONSTRAINT "content_reports_subject_length_check" CHECK ((("char_length"("btrim"("subject")) >= 3) AND ("char_length"("btrim"("subject")) <= 140))),
    CONSTRAINT "content_reports_target_type_check" CHECK (("target_type" = ANY (ARRAY['musician_profile'::"text", 'gig'::"text"])))
);


ALTER TABLE "public"."content_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversation_participants" (
    "id" "text" DEFAULT ("gen_random_uuid"())::"text" NOT NULL,
    "conversation_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_read_at" timestamp with time zone,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."conversation_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversation_requests" (
    "id" "text" DEFAULT ("gen_random_uuid"())::"text" NOT NULL,
    "requester_id" "uuid" NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "intro_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "accepted_at" timestamp with time zone,
    "rejected_at" timestamp with time zone,
    CONSTRAINT "conversation_requests_distinct_users_check" CHECK (("requester_id" <> "recipient_id")),
    CONSTRAINT "conversation_requests_intro_length_check" CHECK ((("intro_message" IS NULL) OR ("char_length"("btrim"("intro_message")) <= 600))),
    CONSTRAINT "conversation_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'accepted'::"text", 'rejected'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."conversation_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "text" DEFAULT ("gen_random_uuid"())::"text" NOT NULL,
    "type" "text" DEFAULT 'direct'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_message_at" timestamp with time zone,
    "created_by" "uuid" NOT NULL,
    "source_request_id" "text",
    CONSTRAINT "conversations_type_check" CHECK (("type" = 'direct'::"text"))
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."genre" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_by" "uuid",
    "is_default" boolean DEFAULT false
);


ALTER TABLE "public"."genre" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gig" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "creator_id" "uuid" NOT NULL,
    "org_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "project_type" "public"."project_type" NOT NULL,
    "location" "text",
    "is_remote" boolean DEFAULT false NOT NULL,
    "compensation_type" "public"."compensation_type" NOT NULL,
    "compensation_details" "text",
    "deadline" "date",
    "status" "public"."gig_status" DEFAULT 'OPEN'::"public"."gig_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "location_display_name" "text",
    "location_place_id" "text",
    "location_lat" double precision,
    "location_lng" double precision,
    "location_city" "text",
    "location_state" "text",
    "location_country" "text",
    "location_provider" "text",
    "provider_place_id" "text",
    "location_visibility" "text" DEFAULT 'public_region'::"text" NOT NULL,
    "is_public" boolean DEFAULT true NOT NULL,
    "is_verified" boolean DEFAULT false NOT NULL,
    "moderation_status" "text" DEFAULT 'active'::"text" NOT NULL,
    "admin_notes" "text",
    CONSTRAINT "gig_location_provider_check" CHECK ((("location_provider" IS NULL) OR ("location_provider" = ANY (ARRAY['geoapify'::"text", 'launch_market'::"text", 'google'::"text", 'manual'::"text"])))),
    CONSTRAINT "gig_location_visibility_check" CHECK (("location_visibility" = ANY (ARRAY['public_region'::"text", 'private'::"text"]))),
    CONSTRAINT "gig_moderation_status_check" CHECK (("moderation_status" = ANY (ARRAY['active'::"text", 'hidden'::"text", 'needs_review'::"text"])))
);


ALTER TABLE "public"."gig" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gig_genre" (
    "gig_id" "uuid" NOT NULL,
    "genre_id" "uuid" NOT NULL
);


ALTER TABLE "public"."gig_genre" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gig_instrument" (
    "gig_id" "uuid" NOT NULL,
    "instrument_id" "uuid" NOT NULL
);


ALTER TABLE "public"."gig_instrument" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."instrument" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_by" "uuid",
    "is_default" boolean DEFAULT false
);


ALTER TABLE "public"."instrument" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "text" DEFAULT ("gen_random_uuid"())::"text" NOT NULL,
    "conversation_id" "text" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "body" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "messages_body_length_check" CHECK (("char_length"("btrim"("body")) <= 2000)),
    CONSTRAINT "messages_body_not_blank_check" CHECK (("char_length"("btrim"("body")) > 0))
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."musician_genre" (
    "musician_profile_id" "uuid" NOT NULL,
    "genre_id" "uuid" NOT NULL
);


ALTER TABLE "public"."musician_genre" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."musician_instrument" (
    "musician_profile_id" "uuid" NOT NULL,
    "instrument_id" "uuid" NOT NULL
);


ALTER TABLE "public"."musician_instrument" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."musician_profile" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "display_name" "text",
    "bio" "text",
    "school" "text",
    "location" "text",
    "is_remote" boolean DEFAULT false NOT NULL,
    "seeking_paid" boolean DEFAULT false NOT NULL,
    "seeking_unpaid" boolean DEFAULT false NOT NULL,
    "years_experience" integer,
    "availability_text" "text",
    "contact_email" "text",
    "instagram_url" "text",
    "youtube_url" "text",
    "spotify_url" "text",
    "soundcloud_url" "text",
    "website_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_verified" boolean DEFAULT false NOT NULL,
    "no_portfolio_attested" boolean DEFAULT false NOT NULL,
    "location_display_name" "text",
    "location_place_id" "text",
    "location_lat" double precision,
    "location_lng" double precision,
    "location_city" "text",
    "location_state" "text",
    "location_country" "text",
    "location_provider" "text",
    "provider_place_id" "text",
    "location_visibility" "text" DEFAULT 'public_region'::"text" NOT NULL,
    "is_public" boolean DEFAULT true NOT NULL,
    "moderation_status" "text" DEFAULT 'active'::"text" NOT NULL,
    "admin_notes" "text",
    CONSTRAINT "musician_profile_location_provider_check" CHECK ((("location_provider" IS NULL) OR ("location_provider" = ANY (ARRAY['geoapify'::"text", 'launch_market'::"text", 'google'::"text", 'manual'::"text"])))),
    CONSTRAINT "musician_profile_location_visibility_check" CHECK (("location_visibility" = ANY (ARRAY['public_region'::"text", 'private'::"text"]))),
    CONSTRAINT "musician_profile_moderation_status_check" CHECK (("moderation_status" = ANY (ARRAY['active'::"text", 'hidden'::"text", 'needs_review'::"text"])))
);


ALTER TABLE "public"."musician_profile" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."org" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."org" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."org_member" (
    "org_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'MEMBER'::"text" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "org_member_role_check" CHECK (("role" = ANY (ARRAY['OWNER'::"text", 'MEMBER'::"text"])))
);


ALTER TABLE "public"."org_member" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_blocks" (
    "id" "text" DEFAULT ("gen_random_uuid"())::"text" NOT NULL,
    "blocker_id" "uuid" NOT NULL,
    "blocked_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_blocks_distinct_users_check" CHECK (("blocker_id" <> "blocked_id"))
);


ALTER TABLE "public"."user_blocks" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_audit_log"
    ADD CONSTRAINT "admin_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_user"
    ADD CONSTRAINT "app_user_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."content_reports"
    ADD CONSTRAINT "content_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_requests"
    ADD CONSTRAINT "conversation_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."genre"
    ADD CONSTRAINT "genre_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."genre"
    ADD CONSTRAINT "genre_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gig_genre"
    ADD CONSTRAINT "gig_genre_pkey" PRIMARY KEY ("gig_id", "genre_id");



ALTER TABLE ONLY "public"."gig_instrument"
    ADD CONSTRAINT "gig_instrument_pkey" PRIMARY KEY ("gig_id", "instrument_id");



ALTER TABLE ONLY "public"."gig"
    ADD CONSTRAINT "gig_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."instrument"
    ADD CONSTRAINT "instrument_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."instrument"
    ADD CONSTRAINT "instrument_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."musician_genre"
    ADD CONSTRAINT "musician_genre_pkey" PRIMARY KEY ("musician_profile_id", "genre_id");



ALTER TABLE ONLY "public"."musician_instrument"
    ADD CONSTRAINT "musician_instrument_pkey" PRIMARY KEY ("musician_profile_id", "instrument_id");



ALTER TABLE ONLY "public"."musician_profile"
    ADD CONSTRAINT "musician_profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."musician_profile"
    ADD CONSTRAINT "musician_profile_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."org_member"
    ADD CONSTRAINT "org_member_pkey" PRIMARY KEY ("org_id", "user_id");



ALTER TABLE ONLY "public"."org"
    ADD CONSTRAINT "org_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_blocks"
    ADD CONSTRAINT "user_blocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_blocks"
    ADD CONSTRAINT "user_blocks_unique_pair" UNIQUE ("blocker_id", "blocked_id");



CREATE INDEX "admin_audit_log_created_at_idx" ON "public"."admin_audit_log" USING "btree" ("created_at" DESC);



CREATE INDEX "admin_audit_log_target_idx" ON "public"."admin_audit_log" USING "btree" ("target_type", "target_id", "created_at" DESC);



CREATE UNIQUE INDEX "app_user_one_admin_support_account_idx" ON "public"."app_user" USING "btree" ("is_admin_support_account") WHERE ("is_admin_support_account" = true);



CREATE INDEX "content_reports_reporter_idx" ON "public"."content_reports" USING "btree" ("reporter_id", "created_at" DESC);



CREATE INDEX "content_reports_status_created_at_idx" ON "public"."content_reports" USING "btree" ("status", "created_at" DESC);



CREATE INDEX "content_reports_target_idx" ON "public"."content_reports" USING "btree" ("target_type", "target_id", "created_at" DESC);



CREATE UNIQUE INDEX "conversation_participants_unique_active_user_idx" ON "public"."conversation_participants" USING "btree" ("conversation_id", "user_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "conversation_participants_user_active_idx" ON "public"."conversation_participants" USING "btree" ("user_id", "deleted_at", "conversation_id");



CREATE UNIQUE INDEX "conversation_requests_one_pending_pair_idx" ON "public"."conversation_requests" USING "btree" (LEAST("requester_id", "recipient_id"), GREATEST("requester_id", "recipient_id")) WHERE ("status" = 'pending'::"text");



CREATE INDEX "conversation_requests_recipient_status_idx" ON "public"."conversation_requests" USING "btree" ("recipient_id", "status", "created_at" DESC);



CREATE INDEX "conversation_requests_requester_status_idx" ON "public"."conversation_requests" USING "btree" ("requester_id", "status", "created_at" DESC);



CREATE INDEX "conversations_last_message_at_idx" ON "public"."conversations" USING "btree" ("last_message_at" DESC NULLS LAST, "updated_at" DESC);



CREATE UNIQUE INDEX "conversations_source_request_unique_idx" ON "public"."conversations" USING "btree" ("source_request_id") WHERE ("source_request_id" IS NOT NULL);



CREATE INDEX "gig_creator_id_idx" ON "public"."gig" USING "btree" ("creator_id");



CREATE INDEX "gig_genre_genre_id_idx" ON "public"."gig_genre" USING "btree" ("genre_id");



CREATE INDEX "gig_instrument_instrument_id_idx" ON "public"."gig_instrument" USING "btree" ("instrument_id");



CREATE INDEX "gig_location_lat_lng_idx" ON "public"."gig" USING "btree" ("location_lat", "location_lng") WHERE (("location_lat" IS NOT NULL) AND ("location_lng" IS NOT NULL));



CREATE INDEX "gig_status_created_at_idx" ON "public"."gig" USING "btree" ("status", "created_at" DESC);



CREATE INDEX "messages_conversation_created_at_idx" ON "public"."messages" USING "btree" ("conversation_id", "created_at");



CREATE INDEX "messages_unread_lookup_idx" ON "public"."messages" USING "btree" ("conversation_id", "created_at", "sender_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "musician_genre_genre_id_idx" ON "public"."musician_genre" USING "btree" ("genre_id");



CREATE INDEX "musician_instrument_instrument_id_idx" ON "public"."musician_instrument" USING "btree" ("instrument_id");



CREATE INDEX "musician_profile_location_lat_lng_idx" ON "public"."musician_profile" USING "btree" ("location_lat", "location_lng") WHERE (("location_lat" IS NOT NULL) AND ("location_lng" IS NOT NULL));



CREATE INDEX "musician_profile_updated_at_idx" ON "public"."musician_profile" USING "btree" ("updated_at" DESC);



CREATE INDEX "musician_profile_user_id_idx" ON "public"."musician_profile" USING "btree" ("user_id");



CREATE INDEX "user_blocks_blocked_lookup_idx" ON "public"."user_blocks" USING "btree" ("blocked_id", "blocker_id");



CREATE OR REPLACE TRIGGER "content_reports_touch_updated_at" BEFORE UPDATE ON "public"."content_reports" FOR EACH ROW EXECUTE FUNCTION "public"."content_reports_touch_updated_at"();



CREATE OR REPLACE TRIGGER "conversation_participants_direct_limit" BEFORE INSERT OR UPDATE ON "public"."conversation_participants" FOR EACH ROW EXECUTE FUNCTION "public"."messaging_assert_direct_participant_limit"();



CREATE OR REPLACE TRIGGER "conversation_requests_assert_allowed" BEFORE INSERT OR UPDATE ON "public"."conversation_requests" FOR EACH ROW EXECUTE FUNCTION "public"."messaging_assert_request_allowed"();



CREATE OR REPLACE TRIGGER "conversation_requests_touch_updated_at" BEFORE UPDATE ON "public"."conversation_requests" FOR EACH ROW EXECUTE FUNCTION "public"."messaging_touch_updated_at"();



CREATE OR REPLACE TRIGGER "conversations_assert_update_allowed" BEFORE UPDATE ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."messaging_assert_conversation_update_allowed"();



CREATE OR REPLACE TRIGGER "conversations_touch_updated_at" BEFORE UPDATE ON "public"."conversations" FOR EACH ROW EXECUTE FUNCTION "public"."messaging_touch_updated_at"();



CREATE OR REPLACE TRIGGER "messages_assert_allowed" BEFORE INSERT OR UPDATE ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."messaging_assert_message_allowed"();



CREATE OR REPLACE TRIGGER "messages_touch_updated_at" BEFORE UPDATE ON "public"."messages" FOR EACH ROW EXECUTE FUNCTION "public"."messaging_touch_updated_at"();



CREATE OR REPLACE TRIGGER "set_app_user_updated_at" BEFORE UPDATE ON "public"."app_user" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_gig_updated_at" BEFORE UPDATE ON "public"."gig" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_musician_profile_updated_at" BEFORE UPDATE ON "public"."musician_profile" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."app_user"
    ADD CONSTRAINT "app_user_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_reports"
    ADD CONSTRAINT "content_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."content_reports"
    ADD CONSTRAINT "content_reports_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."app_user"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."content_reports"
    ADD CONSTRAINT "content_reports_target_owner_id_fkey" FOREIGN KEY ("target_owner_id") REFERENCES "public"."app_user"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_requests"
    ADD CONSTRAINT "conversation_requests_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_requests"
    ADD CONSTRAINT "conversation_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."app_user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_source_request_id_fkey" FOREIGN KEY ("source_request_id") REFERENCES "public"."conversation_requests"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."app_user"
    ADD CONSTRAINT "fk_app_user_auth_users" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."genre"
    ADD CONSTRAINT "genre_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gig"
    ADD CONSTRAINT "gig_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gig_genre"
    ADD CONSTRAINT "gig_genre_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "public"."genre"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gig_genre"
    ADD CONSTRAINT "gig_genre_gig_id_fkey" FOREIGN KEY ("gig_id") REFERENCES "public"."gig"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gig_instrument"
    ADD CONSTRAINT "gig_instrument_gig_id_fkey" FOREIGN KEY ("gig_id") REFERENCES "public"."gig"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gig_instrument"
    ADD CONSTRAINT "gig_instrument_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."instrument"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gig"
    ADD CONSTRAINT "gig_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."org"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."instrument"
    ADD CONSTRAINT "instrument_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."musician_genre"
    ADD CONSTRAINT "musician_genre_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "public"."genre"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."musician_genre"
    ADD CONSTRAINT "musician_genre_musician_profile_id_fkey" FOREIGN KEY ("musician_profile_id") REFERENCES "public"."musician_profile"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."musician_instrument"
    ADD CONSTRAINT "musician_instrument_instrument_id_fkey" FOREIGN KEY ("instrument_id") REFERENCES "public"."instrument"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."musician_instrument"
    ADD CONSTRAINT "musician_instrument_musician_profile_id_fkey" FOREIGN KEY ("musician_profile_id") REFERENCES "public"."musician_profile"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."musician_profile"
    ADD CONSTRAINT "musician_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."org_member"
    ADD CONSTRAINT "org_member_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."org"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."org_member"
    ADD CONSTRAINT "org_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."org"
    ADD CONSTRAINT "org_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_blocks"
    ADD CONSTRAINT "user_blocks_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_blocks"
    ADD CONSTRAINT "user_blocks_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "public"."app_user"("id") ON DELETE CASCADE;



ALTER TABLE "public"."admin_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_user" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "app_user insert own" ON "public"."app_user" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "app_user select own" ON "public"."app_user" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."content_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversation_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversation_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."genre" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "genres auth insert" ON "public"."genre" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "genres public read" ON "public"."genre" FOR SELECT USING (true);



ALTER TABLE "public"."gig" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gig_genre" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "gig_genre owner delete" ON "public"."gig_genre" FOR DELETE USING (("auth"."uid"() = ( SELECT "gig"."creator_id"
   FROM "public"."gig"
  WHERE ("gig"."id" = "gig_genre"."gig_id"))));



CREATE POLICY "gig_genre owner write" ON "public"."gig_genre" FOR INSERT WITH CHECK (("auth"."uid"() = ( SELECT "gig"."creator_id"
   FROM "public"."gig"
  WHERE ("gig"."id" = "gig_genre"."gig_id"))));



CREATE POLICY "gig_genre public read" ON "public"."gig_genre" FOR SELECT USING (true);



ALTER TABLE "public"."gig_instrument" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "gig_instrument owner delete" ON "public"."gig_instrument" FOR DELETE USING (("auth"."uid"() = ( SELECT "gig"."creator_id"
   FROM "public"."gig"
  WHERE ("gig"."id" = "gig_instrument"."gig_id"))));



CREATE POLICY "gig_instrument owner write" ON "public"."gig_instrument" FOR INSERT WITH CHECK (("auth"."uid"() = ( SELECT "gig"."creator_id"
   FROM "public"."gig"
  WHERE ("gig"."id" = "gig_instrument"."gig_id"))));



CREATE POLICY "gig_instrument public read" ON "public"."gig_instrument" FOR SELECT USING (true);



CREATE POLICY "gigs owner delete" ON "public"."gig" FOR DELETE USING (("auth"."uid"() = "creator_id"));



CREATE POLICY "gigs owner insert" ON "public"."gig" FOR INSERT WITH CHECK (("auth"."uid"() = "creator_id"));



CREATE POLICY "gigs owner update" ON "public"."gig" FOR UPDATE USING (("auth"."uid"() = "creator_id"));



CREATE POLICY "gigs public read open" ON "public"."gig" FOR SELECT USING ((("status" = 'OPEN'::"public"."gig_status") OR ("auth"."uid"() = "creator_id")));



ALTER TABLE "public"."instrument" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "instruments auth insert" ON "public"."instrument" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "instruments public read" ON "public"."instrument" FOR SELECT USING (true);



ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."musician_genre" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "musician_genre owner delete" ON "public"."musician_genre" FOR DELETE USING (("auth"."uid"() = ( SELECT "musician_profile"."user_id"
   FROM "public"."musician_profile"
  WHERE ("musician_profile"."id" = "musician_genre"."musician_profile_id"))));



CREATE POLICY "musician_genre owner write" ON "public"."musician_genre" FOR INSERT WITH CHECK (("auth"."uid"() = ( SELECT "musician_profile"."user_id"
   FROM "public"."musician_profile"
  WHERE ("musician_profile"."id" = "musician_genre"."musician_profile_id"))));



CREATE POLICY "musician_genre public read" ON "public"."musician_genre" FOR SELECT USING (true);



ALTER TABLE "public"."musician_instrument" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "musician_instrument owner delete" ON "public"."musician_instrument" FOR DELETE USING (("auth"."uid"() = ( SELECT "musician_profile"."user_id"
   FROM "public"."musician_profile"
  WHERE ("musician_profile"."id" = "musician_instrument"."musician_profile_id"))));



CREATE POLICY "musician_instrument owner write" ON "public"."musician_instrument" FOR INSERT WITH CHECK (("auth"."uid"() = ( SELECT "musician_profile"."user_id"
   FROM "public"."musician_profile"
  WHERE ("musician_profile"."id" = "musician_instrument"."musician_profile_id"))));



CREATE POLICY "musician_instrument public read" ON "public"."musician_instrument" FOR SELECT USING (true);



ALTER TABLE "public"."musician_profile" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."org" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "org no access" ON "public"."org" USING (false);



ALTER TABLE "public"."org_member" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "org_member no access" ON "public"."org_member" USING (false);



CREATE POLICY "participants can select conversations" ON "public"."conversations" FOR SELECT USING ("public"."messaging_is_active_participant"("id", "auth"."uid"()));



CREATE POLICY "participants can select messages" ON "public"."messages" FOR SELECT USING ((("deleted_at" IS NULL) AND "public"."messaging_is_active_participant"("conversation_id", "auth"."uid"())));



CREATE POLICY "participants can select participants" ON "public"."conversation_participants" FOR SELECT USING ("public"."messaging_is_active_participant"("conversation_id", "auth"."uid"()));



CREATE POLICY "participants can send messages" ON "public"."messages" FOR INSERT WITH CHECK ((("sender_id" = "auth"."uid"()) AND "public"."messaging_is_active_participant"("conversation_id", "auth"."uid"())));



CREATE POLICY "participants can update conversations" ON "public"."conversations" FOR UPDATE USING ("public"."messaging_is_active_participant"("id", "auth"."uid"())) WITH CHECK ("public"."messaging_is_active_participant"("id", "auth"."uid"()));



CREATE POLICY "profiles owner delete" ON "public"."musician_profile" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "profiles owner insert" ON "public"."musician_profile" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "profiles owner update" ON "public"."musician_profile" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "profiles public read" ON "public"."musician_profile" FOR SELECT USING (true);



CREATE POLICY "request parties can create participants" ON "public"."conversation_participants" FOR INSERT WITH CHECK (((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."conversations" "c"
  WHERE (("c"."id" = "conversation_participants"."conversation_id") AND ("c"."created_by" = "auth"."uid"()))))) OR (EXISTS ( SELECT 1
   FROM ("public"."conversations" "c"
     JOIN "public"."conversation_requests" "cr" ON (("cr"."id" = "c"."source_request_id")))
  WHERE (("c"."id" = "conversation_participants"."conversation_id") AND (("auth"."uid"() = "cr"."requester_id") OR ("auth"."uid"() = "cr"."recipient_id")) AND (("conversation_participants"."user_id" = "cr"."requester_id") OR ("conversation_participants"."user_id" = "cr"."recipient_id")))))));



CREATE POLICY "request parties can select requests" ON "public"."conversation_requests" FOR SELECT USING ((("auth"."uid"() = "requester_id") OR ("auth"."uid"() = "recipient_id")));



CREATE POLICY "request parties can update requests" ON "public"."conversation_requests" FOR UPDATE USING ((("auth"."uid"() = "requester_id") OR ("auth"."uid"() = "recipient_id"))) WITH CHECK ((("auth"."uid"() = "requester_id") OR ("auth"."uid"() = "recipient_id")));



CREATE POLICY "senders can update own messages" ON "public"."messages" FOR UPDATE USING (("sender_id" = "auth"."uid"())) WITH CHECK (("sender_id" = "auth"."uid"()));



ALTER TABLE "public"."user_blocks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users can create conversations" ON "public"."conversations" FOR INSERT WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "users can create own blocks" ON "public"."user_blocks" FOR INSERT WITH CHECK (("blocker_id" = "auth"."uid"()));



CREATE POLICY "users can create own content reports" ON "public"."content_reports" FOR INSERT WITH CHECK (("reporter_id" = "auth"."uid"()));



CREATE POLICY "users can create own requests" ON "public"."conversation_requests" FOR INSERT WITH CHECK (("requester_id" = "auth"."uid"()));



CREATE POLICY "users can delete own blocks" ON "public"."user_blocks" FOR DELETE USING (("blocker_id" = "auth"."uid"()));



CREATE POLICY "users can select own blocks" ON "public"."user_blocks" FOR SELECT USING (("blocker_id" = "auth"."uid"()));



CREATE POLICY "users can select own content reports" ON "public"."content_reports" FOR SELECT USING (("reporter_id" = "auth"."uid"()));



CREATE POLICY "users can update own participant row" ON "public"."conversation_participants" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "users read own row" ON "public"."app_user" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "users update own row" ON "public"."app_user" FOR UPDATE USING (("auth"."uid"() = "id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."content_reports_touch_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."content_reports_touch_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."content_reports_touch_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_auth_user_on_app_user_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_auth_user_on_app_user_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_auth_user_on_app_user_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."messaging_accept_connection_request"("p_request_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."messaging_accept_connection_request"("p_request_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."messaging_accept_connection_request"("p_request_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."messaging_assert_conversation_update_allowed"() TO "anon";
GRANT ALL ON FUNCTION "public"."messaging_assert_conversation_update_allowed"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."messaging_assert_conversation_update_allowed"() TO "service_role";



GRANT ALL ON FUNCTION "public"."messaging_assert_direct_participant_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."messaging_assert_direct_participant_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."messaging_assert_direct_participant_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."messaging_assert_message_allowed"() TO "anon";
GRANT ALL ON FUNCTION "public"."messaging_assert_message_allowed"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."messaging_assert_message_allowed"() TO "service_role";



GRANT ALL ON FUNCTION "public"."messaging_assert_request_allowed"() TO "anon";
GRANT ALL ON FUNCTION "public"."messaging_assert_request_allowed"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."messaging_assert_request_allowed"() TO "service_role";



GRANT ALL ON FUNCTION "public"."messaging_direct_conversation_exists"("p_user_a" "uuid", "p_user_b" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."messaging_direct_conversation_exists"("p_user_a" "uuid", "p_user_b" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."messaging_direct_conversation_exists"("p_user_a" "uuid", "p_user_b" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."messaging_is_active_participant"("p_conversation_id" "text", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."messaging_is_active_participant"("p_conversation_id" "text", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."messaging_is_active_participant"("p_conversation_id" "text", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."messaging_is_blocked_between"("p_user_a" "uuid", "p_user_b" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."messaging_is_blocked_between"("p_user_a" "uuid", "p_user_b" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."messaging_is_blocked_between"("p_user_a" "uuid", "p_user_b" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."messaging_is_request_party"("p_request_id" "text", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."messaging_is_request_party"("p_request_id" "text", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."messaging_is_request_party"("p_request_id" "text", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."messaging_touch_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."messaging_touch_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."messaging_touch_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."app_user" TO "anon";
GRANT ALL ON TABLE "public"."app_user" TO "authenticated";
GRANT ALL ON TABLE "public"."app_user" TO "service_role";



GRANT ALL ON TABLE "public"."content_reports" TO "anon";
GRANT ALL ON TABLE "public"."content_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."content_reports" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_participants" TO "anon";
GRANT ALL ON TABLE "public"."conversation_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_participants" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_requests" TO "anon";
GRANT ALL ON TABLE "public"."conversation_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_requests" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."genre" TO "anon";
GRANT ALL ON TABLE "public"."genre" TO "authenticated";
GRANT ALL ON TABLE "public"."genre" TO "service_role";



GRANT ALL ON TABLE "public"."gig" TO "anon";
GRANT ALL ON TABLE "public"."gig" TO "authenticated";
GRANT ALL ON TABLE "public"."gig" TO "service_role";



GRANT ALL ON TABLE "public"."gig_genre" TO "anon";
GRANT ALL ON TABLE "public"."gig_genre" TO "authenticated";
GRANT ALL ON TABLE "public"."gig_genre" TO "service_role";



GRANT ALL ON TABLE "public"."gig_instrument" TO "anon";
GRANT ALL ON TABLE "public"."gig_instrument" TO "authenticated";
GRANT ALL ON TABLE "public"."gig_instrument" TO "service_role";



GRANT ALL ON TABLE "public"."instrument" TO "anon";
GRANT ALL ON TABLE "public"."instrument" TO "authenticated";
GRANT ALL ON TABLE "public"."instrument" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."musician_genre" TO "anon";
GRANT ALL ON TABLE "public"."musician_genre" TO "authenticated";
GRANT ALL ON TABLE "public"."musician_genre" TO "service_role";



GRANT ALL ON TABLE "public"."musician_instrument" TO "anon";
GRANT ALL ON TABLE "public"."musician_instrument" TO "authenticated";
GRANT ALL ON TABLE "public"."musician_instrument" TO "service_role";



GRANT ALL ON TABLE "public"."musician_profile" TO "anon";
GRANT ALL ON TABLE "public"."musician_profile" TO "authenticated";
GRANT ALL ON TABLE "public"."musician_profile" TO "service_role";



GRANT ALL ON TABLE "public"."org" TO "anon";
GRANT ALL ON TABLE "public"."org" TO "authenticated";
GRANT ALL ON TABLE "public"."org" TO "service_role";



GRANT ALL ON TABLE "public"."org_member" TO "anon";
GRANT ALL ON TABLE "public"."org_member" TO "authenticated";
GRANT ALL ON TABLE "public"."org_member" TO "service_role";



GRANT ALL ON TABLE "public"."user_blocks" TO "anon";
GRANT ALL ON TABLE "public"."user_blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."user_blocks" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































