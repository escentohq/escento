-- `marketplace_gig_is_public` gated anonymous reads on `status = 'OPEN'`, which
-- mixed two separate ideas: moderation (is this row allowed to be seen) and
-- lifecycle (is this call still taking applicants).
--
-- The side effect was that closing a gig made its detail page a 404 for
-- everyone. The app reads public rows through the anon client, so even the
-- creator following a direct link got "Lost in the mix." — while
-- `/gigs/[id]/page.tsx` still renders a "Call filled" state that had become
-- unreachable.
--
-- Directory listings already filter `status = 'OPEN'` in SQL
-- (`listOpenGigs`), so a filled gig stays out of the marketplace without the
-- policy having to hide the row. Moderation keeps doing the hiding: is_public,
-- moderation_status, and the creator's account state are all unchanged below.

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
      and listing.is_public = true
      and listing.moderation_status = 'active'
      and public.marketplace_user_is_public(listing.creator_id)
  );
$$;
