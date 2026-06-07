-- Structured location fields for Motivo profiles and gigs.
-- Keeps the legacy `location` text column for display fallback/backward compatibility.

alter table musician_profile
  add column if not exists location_display_name text,
  add column if not exists location_place_id text,
  add column if not exists location_lat double precision,
  add column if not exists location_lng double precision,
  add column if not exists location_city text,
  add column if not exists location_state text,
  add column if not exists location_country text,
  add column if not exists location_provider text,
  add column if not exists provider_place_id text,
  add column if not exists location_visibility text not null default 'public_region';

alter table gig
  add column if not exists location_display_name text,
  add column if not exists location_place_id text,
  add column if not exists location_lat double precision,
  add column if not exists location_lng double precision,
  add column if not exists location_city text,
  add column if not exists location_state text,
  add column if not exists location_country text,
  add column if not exists location_provider text,
  add column if not exists provider_place_id text,
  add column if not exists location_visibility text not null default 'public_region';

alter table musician_profile
  drop constraint if exists musician_profile_location_visibility_check,
  add constraint musician_profile_location_visibility_check
    check (location_visibility in ('public_region', 'private'));

alter table musician_profile
  drop constraint if exists musician_profile_location_provider_check,
  add constraint musician_profile_location_provider_check
    check (location_provider is null or location_provider in ('geoapify', 'google', 'manual'));

alter table gig
  drop constraint if exists gig_location_visibility_check,
  add constraint gig_location_visibility_check
    check (location_visibility in ('public_region', 'private'));

alter table gig
  drop constraint if exists gig_location_provider_check,
  add constraint gig_location_provider_check
    check (location_provider is null or location_provider in ('geoapify', 'google', 'manual'));

create index if not exists musician_profile_location_lat_lng_idx
  on musician_profile(location_lat, location_lng)
  where location_lat is not null and location_lng is not null;

create index if not exists gig_location_lat_lng_idx
  on gig(location_lat, location_lng)
  where location_lat is not null and location_lng is not null;
