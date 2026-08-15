begin;

create extension if not exists pgtap with schema extensions;
select plan(20);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated', 'authenticated', 'moderation-musician@example.test', '', now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000002',
    'authenticated', 'authenticated', 'moderation-creator@example.test', '', now(),
    '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''
  );

insert into public.app_user (id, email, name, role)
values
  ('10000000-0000-0000-0000-000000000001', 'moderation-musician@example.test', 'Visible Musician', 'MUSICIAN'),
  ('10000000-0000-0000-0000-000000000002', 'moderation-creator@example.test', 'Visible Creator', 'CREATOR')
on conflict (id) do update
set is_public = true, moderation_status = 'active';

insert into public.musician_profile (id, user_id, display_name)
values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Visible Musician');

insert into public.gig (
  id, creator_id, title, project_type, compensation_type, status
)
values (
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  'Visible Gig', 'FILM', 'PAID', 'OPEN'
);

insert into public.instrument (id, name)
values ('40000000-0000-0000-0000-000000000001', 'Visibility Test Instrument');
insert into public.musician_instrument (musician_profile_id, instrument_id)
values ('20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001');
insert into public.gig_instrument (gig_id, instrument_id)
values ('30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001');

select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
select is((select count(*) from public.musician_profile where id = '20000000-0000-0000-0000-000000000001'), 1::bigint, 'anon can read an active public profile');
select is((select count(*) from public.gig where id = '30000000-0000-0000-0000-000000000001'), 1::bigint, 'anon can read an active public open gig');
reset role;

update public.musician_profile
set is_public = false, moderation_status = 'hidden'
where id = '20000000-0000-0000-0000-000000000001';

select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
select is((select count(*) from public.musician_profile where id = '20000000-0000-0000-0000-000000000001'), 0::bigint, 'anon cannot read a hidden profile');
select is((select count(*) from public.musician_instrument where musician_profile_id = '20000000-0000-0000-0000-000000000001'), 0::bigint, 'anon cannot read hidden profile taxonomy');
reset role;

select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
set local role authenticated;
select is((select count(*) from public.musician_profile where id = '20000000-0000-0000-0000-000000000001'), 1::bigint, 'owner retains access to a hidden profile');
select is((select count(*) from public.musician_instrument where musician_profile_id = '20000000-0000-0000-0000-000000000001'), 1::bigint, 'owner retains access to hidden profile taxonomy');
reset role;

set local role service_role;
select is((select count(*) from public.musician_profile where id = '20000000-0000-0000-0000-000000000001'), 1::bigint, 'service-role admin retains access to a hidden profile');
reset role;

update public.musician_profile
set is_public = true, moderation_status = 'active'
where id = '20000000-0000-0000-0000-000000000001';
update public.gig
set is_public = false, moderation_status = 'hidden'
where id = '30000000-0000-0000-0000-000000000001';

select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
select is((select count(*) from public.gig where id = '30000000-0000-0000-0000-000000000001'), 0::bigint, 'anon cannot read a hidden gig');
select is((select count(*) from public.gig_instrument where gig_id = '30000000-0000-0000-0000-000000000001'), 0::bigint, 'anon cannot read hidden gig taxonomy');
reset role;

select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
set local role authenticated;
select is((select count(*) from public.gig where id = '30000000-0000-0000-0000-000000000001'), 1::bigint, 'owner retains access to a hidden gig');
select is((select count(*) from public.gig_instrument where gig_id = '30000000-0000-0000-0000-000000000001'), 1::bigint, 'owner retains access to hidden gig taxonomy');
reset role;

set local role service_role;
select is((select count(*) from public.gig where id = '30000000-0000-0000-0000-000000000001'), 1::bigint, 'service-role admin retains access to a hidden gig');
reset role;

update public.gig
set is_public = true, moderation_status = 'active'
where id = '30000000-0000-0000-0000-000000000001';
update public.app_user
set is_public = false, moderation_status = 'hidden'
where id in (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002'
);

select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
select is((select count(*) from public.musician_profile where id = '20000000-0000-0000-0000-000000000001'), 0::bigint, 'a hidden account suppresses its otherwise-public profile');
select is((select count(*) from public.gig where id = '30000000-0000-0000-0000-000000000001'), 0::bigint, 'a hidden account suppresses its otherwise-public gig');
reset role;

select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);
set local role authenticated;
select is((select count(*) from public.musician_profile where id = '20000000-0000-0000-0000-000000000001'), 1::bigint, 'hidden musician account still owns and reads its profile');
reset role;

select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}', true);
set local role authenticated;
select is((select count(*) from public.gig where id = '30000000-0000-0000-0000-000000000001'), 1::bigint, 'hidden creator account still owns and reads its gig');
reset role;

update public.app_user
set is_public = true, moderation_status = 'active'
where id in (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002'
);

select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
select is((select count(*) from public.musician_profile where id = '20000000-0000-0000-0000-000000000001'), 1::bigint, 'restoring the account republishes its active profile');
select is((select count(*) from public.gig where id = '30000000-0000-0000-0000-000000000001'), 1::bigint, 'restoring the account republishes its active open gig');
reset role;

update public.musician_profile
set moderation_status = 'needs_review'
where id = '20000000-0000-0000-0000-000000000001';
update public.gig
set moderation_status = 'needs_review'
where id = '30000000-0000-0000-0000-000000000001';

select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
select is((select count(*) from public.musician_profile where id = '20000000-0000-0000-0000-000000000001'), 0::bigint, 'needs-review profiles are not public');
select is((select count(*) from public.gig where id = '30000000-0000-0000-0000-000000000001'), 0::bigint, 'needs-review gigs are not public');
reset role;

select * from finish();
rollback;
