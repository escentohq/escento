-- Incomplete musician drafts are not public inventory (MVP-08, issue #28).
--
-- Step one of the create wizard asks for a display name and nothing else, and
-- committing it made the row anonymously discoverable immediately. A directory
-- entry with a name and no instruments, no context, and no availability cannot
-- be evaluated by a creator, and the musician has no idea they are listed that
-- way.
--
-- Readiness is added to the existing anonymous-visibility predicate rather than
-- stored as a column: it is derived entirely from fields that are already on the
-- row (plus the taxonomy junctions), so a stored flag would need triggers on
-- three tables and could drift. Evaluating it at read time means a profile
-- becomes discoverable the moment it qualifies, with no publish step and nothing
-- to backfill — existing incomplete rows simply stop being listed.
--
-- The owner branch of the RLS policy is untouched, so a draft stays fully
-- readable and resumable by the musician who owns it, and admin/service-role
-- reads still bypass RLS.
--
-- The threshold, deliberately small:
--   1. a display name,
--   2. at least one instrument or genre,
--   3. at least one piece of context: bio, school, a location, remote
--      availability, or an availability note.

CREATE OR REPLACE FUNCTION "public"."musician_profile_is_launch_ready"("target_profile_id" "uuid")
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET "search_path" TO ''
AS $$
  select exists (
    select 1
    from public.musician_profile as profile
    where profile.id = target_profile_id
      and coalesce(btrim(profile.display_name), '') <> ''
      and (
        exists (select 1 from public.musician_instrument as mi where mi.musician_profile_id = profile.id)
        or exists (select 1 from public.musician_genre as mg where mg.musician_profile_id = profile.id)
      )
      and (
        coalesce(btrim(profile.bio), '') <> ''
        or coalesce(btrim(profile.school), '') <> ''
        or coalesce(btrim(profile.location), '') <> ''
        or coalesce(btrim(profile.location_display_name), '') <> ''
        or coalesce(btrim(profile.location_city), '') <> ''
        or profile.is_remote = true
        or coalesce(btrim(profile.availability_text), '') <> ''
      )
  );
$$;

ALTER FUNCTION "public"."musician_profile_is_launch_ready"("uuid") OWNER TO "postgres";

REVOKE ALL ON FUNCTION "public"."musician_profile_is_launch_ready"("uuid") FROM PUBLIC;
GRANT EXECUTE ON FUNCTION "public"."musician_profile_is_launch_ready"("uuid") TO "anon", "authenticated", "service_role";

-- Anonymous visibility is now moderation AND readiness. Everything else about
-- this predicate is unchanged.
CREATE OR REPLACE FUNCTION "public"."marketplace_profile_is_public"("target_profile_id" "uuid")
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET "search_path" TO ''
AS $$
  select exists (
    select 1
    from public.musician_profile as profile
    where profile.id = target_profile_id
      and profile.is_public = true
      and profile.moderation_status = 'active'
      and public.marketplace_user_is_public(profile.user_id)
      and public.musician_profile_is_launch_ready(profile.id)
  );
$$;
