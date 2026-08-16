-- Issue #68: the transactional write contract for profiles and gigs.
--
-- moderation_visibility_test.sql only asserts reads, and its own fixtures are
-- inserted as the table owner. That is why 20260816120000 could narrow the
-- authenticated column grants, break all four write RPCs with 42501, and still
-- leave `supabase test db` green. This file closes both halves of that gap: it
-- runs every write as the `authenticated` role with a real `auth.uid()`, and it
-- asserts the negative case issue #59 exists to guarantee.
--
-- Read it as one contract: an owner can create and edit their own profile and
-- gig, and cannot reach identity, moderation, visibility, or verification
-- columns by any route -- not through a direct PostgREST write, and not by
-- smuggling the column into the RPC's jsonb payload.

begin;

create extension if not exists pgtap with schema extensions;
select plan(40);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '50000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'writes-owner@example.test', '', now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '50000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'writes-other@example.test', '', now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
  );

insert into public.app_user (id, email, name, role)
values
  ('50000000-0000-0000-0000-000000000001', 'writes-owner@example.test', 'Write Owner', 'MUSICIAN'),
  ('50000000-0000-0000-0000-000000000002', 'writes-other@example.test', 'Write Other', 'CREATOR')
on conflict (id) do update
set name = excluded.name, role = excluded.role;

insert into public.instrument (id, name)
values ('60000000-0000-0000-0000-000000000001', 'Write Permissions Test Instrument');
insert into public.genre (id, name)
values ('60000000-0000-0000-0000-000000000002', 'Write Permissions Test Genre');

-- A gig owned by the *other* account, so the cross-owner assertions have a real
-- target rather than a missing row.
insert into public.musician_profile (id, user_id, display_name)
values ('70000000-0000-0000-0000-000000000009', '50000000-0000-0000-0000-000000000002', 'Other Profile');
insert into public.gig (id, creator_id, title, project_type, compensation_type)
values ('80000000-0000-0000-0000-000000000009', '50000000-0000-0000-0000-000000000002', 'Other Gig', 'FILM', 'PAID');

-- ---------------------------------------------------------------------------
-- Owner create
-- ---------------------------------------------------------------------------

select set_config(
  'request.jwt.claims',
  '{"role":"authenticated","sub":"50000000-0000-0000-0000-000000000001"}',
  true
);
set local role authenticated;

select lives_ok(
  $$ select public.create_musician_profile_with_tags(
       jsonb_build_object('display_name', 'Write Owner Profile', 'school', 'Test School'),
       array['60000000-0000-0000-0000-000000000001']::uuid[],
       array['60000000-0000-0000-0000-000000000002']::uuid[]
     ) $$,
  'an owner can create a musician profile through the transactional RPC'
);

select lives_ok(
  $$ select public.create_gig_with_tags(
       jsonb_build_object(
         'title', 'Write Owner Gig',
         'project_type', 'FILM',
         'compensation_type', 'PAID'
       ),
       array['60000000-0000-0000-0000-000000000001']::uuid[],
       null::uuid[]
     ) $$,
  'an owner can create a gig through the transactional RPC'
);

reset role;

select is(
  (select is_public from public.musician_profile where display_name = 'Write Owner Profile'),
  true, 'created profile is public by column default'
);
select is(
  (select moderation_status from public.musician_profile where display_name = 'Write Owner Profile'),
  'active'::text, 'created profile is moderation-active by column default'
);
select is(
  (select is_verified from public.musician_profile where display_name = 'Write Owner Profile'),
  false, 'created profile is unverified by column default'
);
select ok(
  (select admin_notes is null from public.musician_profile where display_name = 'Write Owner Profile'),
  'created profile has no admin notes'
);
select is(
  (select user_id from public.musician_profile where display_name = 'Write Owner Profile'),
  '50000000-0000-0000-0000-000000000001'::uuid,
  'created profile is owned by the session user'
);
select is(
  (select count(*) from public.musician_instrument mi
     join public.musician_profile p on p.id = mi.musician_profile_id
    where p.display_name = 'Write Owner Profile'),
  1::bigint, 'profile create wrote its instrument junction row in the same transaction'
);

select is(
  (select status::text from public.gig where title = 'Write Owner Gig'),
  'OPEN'::text, 'created gig opens OPEN'
);
select is(
  (select is_public from public.gig where title = 'Write Owner Gig'),
  true, 'created gig is public by column default'
);
select is(
  (select moderation_status from public.gig where title = 'Write Owner Gig'),
  'active'::text, 'created gig is moderation-active by column default'
);
select is(
  (select creator_id from public.gig where title = 'Write Owner Gig'),
  '50000000-0000-0000-0000-000000000001'::uuid,
  'created gig is owned by the session user'
);

-- ---------------------------------------------------------------------------
-- Owner edit, and the updated_at trigger
-- ---------------------------------------------------------------------------

-- now() is transaction-stable, so back-date the rows first. A bump after the
-- RPC then proves the BEFORE UPDATE trigger fired without `updated_at` ever
-- being in the authenticated grant.
update public.musician_profile set updated_at = timestamptz '2001-01-01'
 where display_name = 'Write Owner Profile';
update public.gig set updated_at = timestamptz '2001-01-01'
 where title = 'Write Owner Gig';

select set_config(
  'request.jwt.claims',
  '{"role":"authenticated","sub":"50000000-0000-0000-0000-000000000001"}',
  true
);
set local role authenticated;

select lives_ok(
  $$ select public.update_musician_profile_with_tags(
       (select id from public.musician_profile where display_name = 'Write Owner Profile'),
       jsonb_build_object('bio', 'Edited bio'),
       null::uuid[],
       null::uuid[]
     ) $$,
  'an owner can edit their musician profile through the transactional RPC'
);

select lives_ok(
  $$ select public.update_gig_with_tags(
       (select id from public.gig where title = 'Write Owner Gig'),
       jsonb_build_object('description', 'Edited description'),
       null::uuid[],
       null::uuid[]
     ) $$,
  'an owner can edit their gig through the transactional RPC'
);

-- Cross-owner edits stay refused.
select throws_ok(
  $$ select public.update_musician_profile_with_tags(
       '70000000-0000-0000-0000-000000000009'::uuid,
       jsonb_build_object('bio', 'hijacked'),
       null::uuid[], null::uuid[]
     ) $$,
  '42501', null::text, 'editing another account''s profile through the RPC is refused'
);
select throws_ok(
  $$ select public.update_gig_with_tags(
       '80000000-0000-0000-0000-000000000009'::uuid,
       jsonb_build_object('title', 'hijacked'),
       null::uuid[], null::uuid[]
     ) $$,
  '42501', null::text, 'editing another account''s gig through the RPC is refused'
);

-- ---------------------------------------------------------------------------
-- Privileged columns stay out of reach (issue #59)
-- ---------------------------------------------------------------------------

select throws_ok(
  $$ update public.musician_profile set is_public = false
      where user_id = '50000000-0000-0000-0000-000000000001' $$,
  '42501', null::text, 'direct write to musician_profile.is_public is refused'
);
select throws_ok(
  $$ update public.musician_profile set is_verified = true
      where user_id = '50000000-0000-0000-0000-000000000001' $$,
  '42501', null::text, 'direct write to musician_profile.is_verified is refused'
);
select throws_ok(
  $$ update public.musician_profile set moderation_status = 'hidden'
      where user_id = '50000000-0000-0000-0000-000000000001' $$,
  '42501', null::text, 'direct write to musician_profile.moderation_status is refused'
);
select throws_ok(
  $$ update public.musician_profile set admin_notes = 'mine now'
      where user_id = '50000000-0000-0000-0000-000000000001' $$,
  '42501', null::text, 'direct write to musician_profile.admin_notes is refused'
);
select throws_ok(
  $$ update public.gig set is_public = false
      where creator_id = '50000000-0000-0000-0000-000000000001' $$,
  '42501', null::text, 'direct write to gig.is_public is refused'
);
select throws_ok(
  $$ update public.gig set is_verified = true
      where creator_id = '50000000-0000-0000-0000-000000000001' $$,
  '42501', null::text, 'direct write to gig.is_verified is refused'
);
select throws_ok(
  $$ update public.gig set moderation_status = 'hidden'
      where creator_id = '50000000-0000-0000-0000-000000000001' $$,
  '42501', null::text, 'direct write to gig.moderation_status is refused'
);
select throws_ok(
  $$ update public.gig set admin_notes = 'mine now'
      where creator_id = '50000000-0000-0000-0000-000000000001' $$,
  '42501', null::text, 'direct write to gig.admin_notes is refused'
);
select throws_ok(
  $$ update public.app_user set is_admin_support_account = true
      where id = '50000000-0000-0000-0000-000000000001' $$,
  '42501', null::text, 'direct write to app_user.is_admin_support_account is refused'
);
select throws_ok(
  $$ update public.app_user set moderation_status = 'active'
      where id = '50000000-0000-0000-0000-000000000001' $$,
  '42501', null::text, 'direct write to app_user.moderation_status is refused'
);
select throws_ok(
  $$ update public.app_user set is_public = false
      where id = '50000000-0000-0000-0000-000000000001' $$,
  '42501', null::text, 'direct write to app_user.is_public is refused'
);
select lives_ok(
  $$ update public.app_user set name = 'Renamed'
      where id = '50000000-0000-0000-0000-000000000001' $$,
  'an owner can still rename their own account'
);

-- ---------------------------------------------------------------------------
-- The RPC payload is not a side door into those same columns
-- ---------------------------------------------------------------------------

select lives_ok(
  $$ select public.create_musician_profile_with_tags(
       jsonb_build_object(
         'display_name', 'Smuggler Profile',
         'is_public', false,
         'is_verified', true,
         'moderation_status', 'hidden',
         'admin_notes', 'smuggled',
         'user_id', '50000000-0000-0000-0000-000000000002'
       ),
       null::uuid[], null::uuid[]
     ) $$,
  'privileged keys in the create payload do not fail the call'
);

select lives_ok(
  $$ select public.create_gig_with_tags(
       jsonb_build_object(
         'title', 'Smuggler Gig',
         'project_type', 'FILM',
         'compensation_type', 'PAID',
         'status', 'CLOSED',
         'is_public', false,
         'moderation_status', 'hidden',
         'creator_id', '50000000-0000-0000-0000-000000000002'
       ),
       null::uuid[], null::uuid[]
     ) $$,
  'privileged keys in the gig create payload do not fail the call'
);

select lives_ok(
  $$ select public.update_musician_profile_with_tags(
       (select id from public.musician_profile where display_name = 'Write Owner Profile'),
       jsonb_build_object('moderation_status', 'hidden', 'is_verified', true),
       null::uuid[], null::uuid[]
     ) $$,
  'privileged keys in the update payload do not fail the call'
);

reset role;

select ok(
  (select updated_at from public.musician_profile where display_name = 'Write Owner Profile')
    > timestamptz '2001-01-02',
  'the trigger bumped musician_profile.updated_at without an updated_at grant'
);
select ok(
  (select updated_at from public.gig where title = 'Write Owner Gig') > timestamptz '2001-01-02',
  'the trigger bumped gig.updated_at without an updated_at grant'
);
select is(
  (select bio from public.musician_profile where display_name = 'Write Owner Profile'),
  'Edited bio'::text, 'the profile edit was actually written'
);
select is(
  (select description from public.gig where title = 'Write Owner Gig'),
  'Edited description'::text, 'the gig edit was actually written'
);
select is(
  (select bio from public.musician_profile where id = '70000000-0000-0000-0000-000000000009'),
  null::text, 'the refused cross-owner edit left the other account''s profile untouched'
);

select is(
  (select user_id from public.musician_profile where display_name = 'Smuggler Profile'),
  '50000000-0000-0000-0000-000000000001'::uuid,
  'a smuggled user_id is ignored in favour of the session user'
);
select is(
  (select is_public::text || '/' || moderation_status || '/' || is_verified::text
     from public.musician_profile where display_name = 'Smuggler Profile'),
  'true/active/false'::text,
  'smuggled visibility, moderation, and verification values are ignored on profile create'
);
select is(
  (select status::text || '/' || is_public::text || '/' || moderation_status
     from public.gig where title = 'Smuggler Gig'),
  'OPEN/true/active'::text,
  'smuggled status, visibility, and moderation values are ignored on gig create'
);
select is(
  (select moderation_status || '/' || is_verified::text
     from public.musician_profile where display_name = 'Write Owner Profile'),
  'active/false'::text,
  'smuggled moderation and verification values are ignored on profile update'
);

select * from finish();
rollback;
