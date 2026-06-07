-- Provider metadata for structured locations.
-- Existing Google/legacy coordinates stay valid because radius search only uses lat/lng.

alter table musician_profile
  add column if not exists location_provider text,
  add column if not exists provider_place_id text;

alter table gig
  add column if not exists location_provider text,
  add column if not exists provider_place_id text;

alter table musician_profile
  drop constraint if exists musician_profile_location_provider_check,
  add constraint musician_profile_location_provider_check
    check (location_provider is null or location_provider in ('geoapify', 'google', 'manual'));

alter table gig
  drop constraint if exists gig_location_provider_check,
  add constraint gig_location_provider_check
    check (location_provider is null or location_provider in ('geoapify', 'google', 'manual'));
