-- Issue #59: signed-in users could PATCH privileged columns on their own
-- app_user / gig / musician_profile rows. GRANT ALL plus UPDATE policies with
-- no WITH CHECK let PostgREST accept those writes.
--
-- Authenticated clients may still change the columns the product actually
-- writes (name/image/first role; gig/profile content; gig delete). Privileged
-- moderation and support flags stay service-role only.
--
-- Production: there is no SUPABASE_DB_URL secret. After this file is on main,
-- paste it into the Supabase SQL editor and smoke name change, role picker,
-- gig close, and admin hide/verify.

-- ---------------------------------------------------------------------------
-- app_user
-- ---------------------------------------------------------------------------

REVOKE ALL ON TABLE public.app_user FROM anon, authenticated;

GRANT SELECT ON TABLE public.app_user TO authenticated;

GRANT INSERT (id, email, role, name, image)
  ON TABLE public.app_user TO authenticated;

GRANT UPDATE (name, image, role)
  ON TABLE public.app_user TO authenticated;

DROP POLICY IF EXISTS "users update own row" ON public.app_user;
CREATE POLICY "users update own row"
  ON public.app_user
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- gig
-- ---------------------------------------------------------------------------

REVOKE ALL ON TABLE public.gig FROM anon, authenticated;

GRANT SELECT ON TABLE public.gig TO anon, authenticated;
GRANT DELETE ON TABLE public.gig TO authenticated;

GRANT INSERT (
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
) ON TABLE public.gig TO authenticated;

GRANT UPDATE (
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
) ON TABLE public.gig TO authenticated;

DROP POLICY IF EXISTS "gigs owner update" ON public.gig;
CREATE POLICY "gigs owner update"
  ON public.gig
  FOR UPDATE
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- ---------------------------------------------------------------------------
-- musician_profile
-- ---------------------------------------------------------------------------

REVOKE ALL ON TABLE public.musician_profile FROM anon, authenticated;

GRANT SELECT ON TABLE public.musician_profile TO anon, authenticated;
GRANT DELETE ON TABLE public.musician_profile TO authenticated;

GRANT INSERT (
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
) ON TABLE public.musician_profile TO authenticated;

GRANT UPDATE (
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
) ON TABLE public.musician_profile TO authenticated;

DROP POLICY IF EXISTS "profiles owner update" ON public.musician_profile;
CREATE POLICY "profiles owner update"
  ON public.musician_profile
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
