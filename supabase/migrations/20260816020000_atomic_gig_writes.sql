-- Atomic gig + taxonomy writes (MVP-03, issue #31).
--
-- Gig create committed an OPEN root row and then inserted each junction row in
-- its own PostgREST call, so a failure in between published a discoverable gig
-- with none of the instruments or genres it was posted for. Update deleted both
-- junction tables first, so the same failure stripped an existing gig's tags
-- while the UI reported the save had failed.
--
-- These mirror the musician-profile functions from 20260816010000: one function
-- body is one transaction, SECURITY INVOKER so RLS still applies, and ownership
-- is asserted here rather than left to the caller (`updateGig` never checked).

CREATE OR REPLACE FUNCTION "public"."create_gig_with_tags"(
  "p_gig" "jsonb",
  "p_instrument_ids" "uuid"[],
  "p_genre_ids" "uuid"[]
) RETURNS "public"."gig"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_seed jsonb;
  v_row public.gig;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'A signed-in session is required to create a gig'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- Column defaults, then the caller's values, then the columns a creator never
  -- chooses (identity, publication state, moderation state).
  v_seed :=
    jsonb_build_object(
      'is_remote', false,
      'location_visibility', 'public_region'
    )
    || coalesce(p_gig, '{}'::jsonb)
    || jsonb_build_object(
      'id', gen_random_uuid(),
      'creator_id', v_user_id,
      'created_at', now(),
      'updated_at', now(),
      'status', 'OPEN',
      'is_public', true,
      'is_verified', false,
      'moderation_status', 'active',
      'admin_notes', null
    );

  INSERT INTO public.gig
  SELECT (jsonb_populate_record(NULL::public.gig, v_seed)).*
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
    provider_place_id = v_next.provider_place_id,
    location_visibility = v_next.location_visibility,
    is_remote = v_next.is_remote,
    compensation_type = v_next.compensation_type,
    compensation_details = v_next.compensation_details,
    deadline = v_next.deadline,
    status = v_next.status,
    updated_at = now()
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

GRANT ALL ON FUNCTION "public"."create_gig_with_tags"("jsonb", "uuid"[], "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_gig_with_tags"("jsonb", "uuid"[], "uuid"[]) TO "service_role";
GRANT ALL ON FUNCTION "public"."update_gig_with_tags"("uuid", "jsonb", "uuid"[], "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_gig_with_tags"("uuid", "jsonb", "uuid"[], "uuid"[]) TO "service_role";
