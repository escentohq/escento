-- Repair the transactional write contract broken by 20260816120000 (issue #68).
--
-- 20260816120000 replaced table-wide DML with column-level grants so a signed-in
-- client can no longer PATCH moderation, visibility, verification, or identity
-- columns on its own row. That part is correct and stays. What it also did,
-- unintentionally, was break all four profile/gig transactional RPCs:
--
--   1. `INSERT INTO t SELECT (jsonb_populate_record(...)).*` carries no explicit
--      column list, so PostgreSQL takes the target to be EVERY column of the
--      table and checks the caller's INSERT privilege against all of them. The
--      functions are SECURITY INVOKER, so "the caller" is `authenticated`, which
--      deliberately lacks INSERT on is_public/is_verified/moderation_status/
--      admin_notes/created_at/updated_at. Result: 42501 before a row is written.
--
--   2. Both UPDATE bodies set `updated_at = now()`, and `updated_at` is not in
--      the authenticated UPDATE grant either. Edit was broken for the same
--      reason as create; it simply never got reached because create failed first.
--
-- The fix keeps the lockdown intact rather than widening it. Every privileged
-- column already carries a table DEFAULT identical to the value the create
-- functions were forcing (is_public true, is_verified false, moderation_status
-- 'active', admin_notes null, created_at/updated_at now(), gig.status 'OPEN'),
-- so naming only the granted columns produces a byte-identical row while asking
-- for no privilege the product does not need. `updated_at` moves to a BEFORE
-- UPDATE trigger, which is not privilege-checked against the statement's column
-- list — so the column stays unreachable from PostgREST and the timestamp stops
-- being something a client could forge.
--
-- The functions stay SECURITY INVOKER: RLS still backstops the bodies, and the
-- explicit ownership assertions remain the primary check.

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION "public"."set_updated_at"()
RETURNS trigger
LANGUAGE plpgsql
SET "search_path" TO ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

DROP TRIGGER IF EXISTS "set_musician_profile_updated_at" ON "public"."musician_profile";
CREATE TRIGGER "set_musician_profile_updated_at"
  BEFORE UPDATE ON "public"."musician_profile"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."set_updated_at"();

DROP TRIGGER IF EXISTS "set_gig_updated_at" ON "public"."gig";
CREATE TRIGGER "set_gig_updated_at"
  BEFORE UPDATE ON "public"."gig"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."set_updated_at"();

-- ---------------------------------------------------------------------------
-- musician_profile
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION "public"."create_musician_profile_with_tags"(
  "p_profile" "jsonb",
  "p_instrument_ids" "uuid"[],
  "p_genre_ids" "uuid"[]
) RETURNS "public"."musician_profile"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_next public.musician_profile;
  v_row public.musician_profile;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'A signed-in session is required to create a profile'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Column defaults first, then the caller's values. Identity and moderation
  -- state are not merged in at all: `user_id` is taken from the session below,
  -- and the rest are simply absent from the INSERT so their table defaults
  -- apply. A key for one of them in p_profile is therefore inert.
  v_next := jsonb_populate_record(
    NULL::public.musician_profile,
    jsonb_build_object(
      'is_remote', false,
      'seeking_paid', false,
      'seeking_unpaid', false,
      'no_portfolio_attested', false,
      'location_visibility', 'public_region'
    )
    || coalesce(p_profile, '{}'::jsonb)
  );

  INSERT INTO public.musician_profile (
    id,
    user_id,
    display_name,
    bio,
    school,
    location,
    is_remote,
    seeking_paid,
    seeking_unpaid,
    years_experience,
    availability_text,
    contact_email,
    instagram_url,
    youtube_url,
    spotify_url,
    soundcloud_url,
    website_url,
    no_portfolio_attested,
    location_display_name,
    location_place_id,
    location_lat,
    location_lng,
    location_city,
    location_state,
    location_country,
    location_provider,
    provider_place_id,
    location_visibility
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    v_next.display_name,
    v_next.bio,
    v_next.school,
    v_next.location,
    coalesce(v_next.is_remote, false),
    coalesce(v_next.seeking_paid, false),
    coalesce(v_next.seeking_unpaid, false),
    v_next.years_experience,
    v_next.availability_text,
    v_next.contact_email,
    v_next.instagram_url,
    v_next.youtube_url,
    v_next.spotify_url,
    v_next.soundcloud_url,
    v_next.website_url,
    coalesce(v_next.no_portfolio_attested, false),
    v_next.location_display_name,
    v_next.location_place_id,
    v_next.location_lat,
    v_next.location_lng,
    v_next.location_city,
    v_next.location_state,
    v_next.location_country,
    v_next.location_provider,
    v_next.provider_place_id,
    coalesce(v_next.location_visibility, 'public_region')
  )
  RETURNING * INTO v_row;

  INSERT INTO public.musician_instrument (musician_profile_id, instrument_id)
  SELECT v_row.id, tag_id
  FROM unnest(coalesce(p_instrument_ids, ARRAY[]::uuid[])) AS tag_id
  ON CONFLICT DO NOTHING;

  INSERT INTO public.musician_genre (musician_profile_id, genre_id)
  SELECT v_row.id, tag_id
  FROM unnest(coalesce(p_genre_ids, ARRAY[]::uuid[])) AS tag_id
  ON CONFLICT DO NOTHING;

  RETURN v_row;
END;
$$;

ALTER FUNCTION "public"."create_musician_profile_with_tags"("jsonb", "uuid"[], "uuid"[]) OWNER TO "postgres";


-- NULL tag arrays mean "leave this taxonomy alone" (the create wizard saves tags
-- on their own step); an empty array means "replace with nothing".
CREATE OR REPLACE FUNCTION "public"."update_musician_profile_with_tags"(
  "p_id" "uuid",
  "p_profile" "jsonb",
  "p_instrument_ids" "uuid"[],
  "p_genre_ids" "uuid"[]
) RETURNS "public"."musician_profile"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_existing public.musician_profile;
  v_next public.musician_profile;
  v_row public.musician_profile;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'A signed-in session is required to update a profile'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT * INTO v_existing FROM public.musician_profile WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Musician profile % was not found', p_id
      USING ERRCODE = 'no_data_found';
  END IF;

  IF v_existing.user_id <> v_user_id THEN
    RAISE EXCEPTION 'Musician profile % belongs to another account', p_id
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Keys present in p_profile win, including explicit nulls; absent keys keep
  -- the stored value. Moderation and identity columns are simply not in the SET
  -- list below, so they cannot be reached from here at all. `updated_at` is not
  -- here either — the BEFORE UPDATE trigger owns it.
  v_next := jsonb_populate_record(
    NULL::public.musician_profile,
    to_jsonb(v_existing) || coalesce(p_profile, '{}'::jsonb)
  );

  UPDATE public.musician_profile SET
    display_name = v_next.display_name,
    bio = v_next.bio,
    school = v_next.school,
    location = v_next.location,
    location_display_name = v_next.location_display_name,
    location_place_id = v_next.location_place_id,
    location_lat = v_next.location_lat,
    location_lng = v_next.location_lng,
    location_city = v_next.location_city,
    location_state = v_next.location_state,
    location_country = v_next.location_country,
    location_provider = v_next.location_provider,
    location_visibility = v_next.location_visibility,
    provider_place_id = v_next.provider_place_id,
    is_remote = v_next.is_remote,
    seeking_paid = v_next.seeking_paid,
    seeking_unpaid = v_next.seeking_unpaid,
    years_experience = v_next.years_experience,
    availability_text = v_next.availability_text,
    contact_email = v_next.contact_email,
    no_portfolio_attested = v_next.no_portfolio_attested,
    instagram_url = v_next.instagram_url,
    youtube_url = v_next.youtube_url,
    spotify_url = v_next.spotify_url,
    soundcloud_url = v_next.soundcloud_url,
    website_url = v_next.website_url
  WHERE id = p_id
  RETURNING * INTO v_row;

  IF p_instrument_ids IS NOT NULL THEN
    DELETE FROM public.musician_instrument WHERE musician_profile_id = p_id;
    INSERT INTO public.musician_instrument (musician_profile_id, instrument_id)
    SELECT p_id, tag_id FROM unnest(p_instrument_ids) AS tag_id
    ON CONFLICT DO NOTHING;
  END IF;

  IF p_genre_ids IS NOT NULL THEN
    DELETE FROM public.musician_genre WHERE musician_profile_id = p_id;
    INSERT INTO public.musician_genre (musician_profile_id, genre_id)
    SELECT p_id, tag_id FROM unnest(p_genre_ids) AS tag_id
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_row;
END;
$$;

ALTER FUNCTION "public"."update_musician_profile_with_tags"("uuid", "jsonb", "uuid"[], "uuid"[]) OWNER TO "postgres";

-- ---------------------------------------------------------------------------
-- gig
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION "public"."create_gig_with_tags"(
  "p_gig" "jsonb",
  "p_instrument_ids" "uuid"[],
  "p_genre_ids" "uuid"[]
) RETURNS "public"."gig"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_next public.gig;
  v_row public.gig;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'A signed-in session is required to create a gig'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Column defaults, then the caller's values. `creator_id` comes from the
  -- session and `status` is forced OPEN; publication and moderation state are
  -- absent from the INSERT so their table defaults apply.
  v_next := jsonb_populate_record(
    NULL::public.gig,
    jsonb_build_object(
      'is_remote', false,
      'location_visibility', 'public_region'
    )
    || coalesce(p_gig, '{}'::jsonb)
  );

  INSERT INTO public.gig (
    id,
    creator_id,
    org_id,
    title,
    description,
    project_type,
    location,
    is_remote,
    compensation_type,
    compensation_details,
    deadline,
    status,
    location_display_name,
    location_place_id,
    location_lat,
    location_lng,
    location_city,
    location_state,
    location_country,
    location_provider,
    provider_place_id,
    location_visibility
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    v_next.org_id,
    v_next.title,
    v_next.description,
    v_next.project_type,
    v_next.location,
    coalesce(v_next.is_remote, false),
    v_next.compensation_type,
    v_next.compensation_details,
    v_next.deadline,
    'OPEN',
    v_next.location_display_name,
    v_next.location_place_id,
    v_next.location_lat,
    v_next.location_lng,
    v_next.location_city,
    v_next.location_state,
    v_next.location_country,
    v_next.location_provider,
    v_next.provider_place_id,
    coalesce(v_next.location_visibility, 'public_region')
  )
  RETURNING * INTO v_row;

  INSERT INTO public.gig_instrument (gig_id, instrument_id)
  SELECT v_row.id, tag_id
  FROM unnest(coalesce(p_instrument_ids, ARRAY[]::uuid[])) AS tag_id
  ON CONFLICT DO NOTHING;

  INSERT INTO public.gig_genre (gig_id, genre_id)
  SELECT v_row.id, tag_id
  FROM unnest(coalesce(p_genre_ids, ARRAY[]::uuid[])) AS tag_id
  ON CONFLICT DO NOTHING;

  RETURN v_row;
END;
$$;

ALTER FUNCTION "public"."create_gig_with_tags"("jsonb", "uuid"[], "uuid"[]) OWNER TO "postgres";


-- NULL tag arrays mean "leave this taxonomy alone"; an empty array clears it.
CREATE OR REPLACE FUNCTION "public"."update_gig_with_tags"(
  "p_id" "uuid",
  "p_gig" "jsonb",
  "p_instrument_ids" "uuid"[],
  "p_genre_ids" "uuid"[]
) RETURNS "public"."gig"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_existing public.gig;
  v_next public.gig;
  v_row public.gig;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'A signed-in session is required to update a gig'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT * INTO v_existing FROM public.gig WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Gig % was not found', p_id
      USING ERRCODE = 'no_data_found';
  END IF;

  IF v_existing.creator_id <> v_user_id THEN
    RAISE EXCEPTION 'Gig % belongs to another account', p_id
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  v_next := jsonb_populate_record(
    NULL::public.gig,
    to_jsonb(v_existing) || coalesce(p_gig, '{}'::jsonb)
  );

  UPDATE public.gig SET
    title = v_next.title,
    description = v_next.description,
    project_type = v_next.project_type,
    location = v_next.location,
    location_display_name = v_next.location_display_name,
    location_place_id = v_next.location_place_id,
    location_lat = v_next.location_lat,
    location_lng = v_next.location_lng,
    location_city = v_next.location_city,
    location_state = v_next.location_state,
    location_country = v_next.location_country,
    location_provider = v_next.location_provider,
    location_visibility = v_next.location_visibility,
    provider_place_id = v_next.provider_place_id,
    is_remote = v_next.is_remote,
    compensation_type = v_next.compensation_type,
    compensation_details = v_next.compensation_details,
    deadline = v_next.deadline,
    status = v_next.status
  WHERE id = p_id
  RETURNING * INTO v_row;

  IF p_instrument_ids IS NOT NULL THEN
    DELETE FROM public.gig_instrument WHERE gig_id = p_id;
    INSERT INTO public.gig_instrument (gig_id, instrument_id)
    SELECT p_id, tag_id FROM unnest(p_instrument_ids) AS tag_id
    ON CONFLICT DO NOTHING;
  END IF;

  IF p_genre_ids IS NOT NULL THEN
    DELETE FROM public.gig_genre WHERE gig_id = p_id;
    INSERT INTO public.gig_genre (gig_id, genre_id)
    SELECT p_id, tag_id FROM unnest(p_genre_ids) AS tag_id
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN v_row;
END;
$$;

ALTER FUNCTION "public"."update_gig_with_tags"("uuid", "jsonb", "uuid"[], "uuid"[]) OWNER TO "postgres";
