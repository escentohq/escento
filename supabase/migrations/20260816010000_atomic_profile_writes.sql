-- Atomic musician profile + taxonomy writes (MVP-03, issue #30).
--
-- Profile create used to insert the root row and then insert junction rows in
-- separate PostgREST calls; update deleted both junction tables before writing
-- anything back. A failure between those calls left a public profile with no
-- tags, or stripped a musician's instruments and genres while the UI reported
-- the save had failed. A function body is one transaction, so routing both the
-- root row and its taxonomy replacement through these keeps them all-or-nothing.
--
-- Both are SECURITY INVOKER (the default): RLS still applies to the caller, and
-- ownership is additionally asserted here so the failure is a clear error rather
-- than a silently skipped row.

CREATE OR REPLACE FUNCTION "public"."create_musician_profile_with_tags"(
  "p_profile" "jsonb",
  "p_instrument_ids" "uuid"[],
  "p_genre_ids" "uuid"[]
) RETURNS "public"."musician_profile"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_seed jsonb;
  v_row public.musician_profile;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'A signed-in session is required to create a profile'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Column defaults first, then the caller's values, then the columns the
  -- caller is never allowed to choose (identity and moderation state).
  v_seed :=
    jsonb_build_object(
      'is_remote', false,
      'seeking_paid', false,
      'seeking_unpaid', false,
      'no_portfolio_attested', false,
      'location_visibility', 'public_region'
    )
    || coalesce(p_profile, '{}'::jsonb)
    || jsonb_build_object(
      'id', gen_random_uuid(),
      'user_id', v_user_id,
      'created_at', now(),
      'updated_at', now(),
      'is_public', true,
      'is_verified', false,
      'moderation_status', 'active',
      'admin_notes', null
    );

  INSERT INTO public.musician_profile
  SELECT (jsonb_populate_record(NULL::public.musician_profile, v_seed)).*
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
  -- list below, so they cannot be reached from here at all.
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
    provider_place_id = v_next.provider_place_id,
    location_visibility = v_next.location_visibility,
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
    website_url = v_next.website_url,
    updated_at = now()
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

GRANT ALL ON FUNCTION "public"."create_musician_profile_with_tags"("jsonb", "uuid"[], "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_musician_profile_with_tags"("jsonb", "uuid"[], "uuid"[]) TO "service_role";
GRANT ALL ON FUNCTION "public"."update_musician_profile_with_tags"("uuid", "jsonb", "uuid"[], "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_musician_profile_with_tags"("uuid", "jsonb", "uuid"[], "uuid"[]) TO "service_role";
