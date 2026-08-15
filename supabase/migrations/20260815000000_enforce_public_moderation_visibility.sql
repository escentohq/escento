-- Public marketplace visibility is the intersection of resource moderation and
-- account moderation. Only active, explicitly public rows are anonymous-readable.
-- Owners retain authenticated access to their own hidden rows; service-role admin
-- reads continue to bypass RLS.

create or replace function public.marketplace_user_is_public(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.app_user as account
    where account.id = target_user_id
      and account.is_public = true
      and account.moderation_status = 'active'
  );
$$;

create or replace function public.marketplace_profile_is_public(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.musician_profile as profile
    where profile.id = target_profile_id
      and profile.is_public = true
      and profile.moderation_status = 'active'
      and public.marketplace_user_is_public(profile.user_id)
  );
$$;

create or replace function public.marketplace_gig_is_public(target_gig_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.gig as listing
    where listing.id = target_gig_id
      and listing.status = 'OPEN'::public.gig_status
      and listing.is_public = true
      and listing.moderation_status = 'active'
      and public.marketplace_user_is_public(listing.creator_id)
  );
$$;

revoke all on function public.marketplace_user_is_public(uuid) from public;
revoke all on function public.marketplace_profile_is_public(uuid) from public;
revoke all on function public.marketplace_gig_is_public(uuid) from public;
grant execute on function public.marketplace_user_is_public(uuid) to anon, authenticated, service_role;
grant execute on function public.marketplace_profile_is_public(uuid) to anon, authenticated, service_role;
grant execute on function public.marketplace_gig_is_public(uuid) to anon, authenticated, service_role;

drop policy if exists "profiles public read" on public.musician_profile;
create policy "profiles visible or owner read"
on public.musician_profile
for select
using (
  auth.uid() = user_id
  or public.marketplace_profile_is_public(id)
);

drop policy if exists "gigs public read open" on public.gig;
create policy "gigs visible open or owner read"
on public.gig
for select
using (
  auth.uid() = creator_id
  or public.marketplace_gig_is_public(id)
);

-- Do not leak taxonomy relationships for a hidden parent through direct anon
-- junction-table reads. The owner branches preserve hidden-resource editing.
drop policy if exists "musician_instrument public read" on public.musician_instrument;
create policy "musician_instrument visible or owner read"
on public.musician_instrument
for select
using (
  public.marketplace_profile_is_public(musician_profile_id)
  or auth.uid() = (
    select profile.user_id
    from public.musician_profile as profile
    where profile.id = musician_profile_id
  )
);

drop policy if exists "musician_genre public read" on public.musician_genre;
create policy "musician_genre visible or owner read"
on public.musician_genre
for select
using (
  public.marketplace_profile_is_public(musician_profile_id)
  or auth.uid() = (
    select profile.user_id
    from public.musician_profile as profile
    where profile.id = musician_profile_id
  )
);

drop policy if exists "gig_instrument public read" on public.gig_instrument;
create policy "gig_instrument visible or owner read"
on public.gig_instrument
for select
using (
  public.marketplace_gig_is_public(gig_id)
  or auth.uid() = (
    select listing.creator_id
    from public.gig as listing
    where listing.id = gig_id
  )
);

drop policy if exists "gig_genre public read" on public.gig_genre;
create policy "gig_genre visible or owner read"
on public.gig_genre
for select
using (
  public.marketplace_gig_is_public(gig_id)
  or auth.uid() = (
    select listing.creator_id
    from public.gig as listing
    where listing.id = gig_id
  )
);
