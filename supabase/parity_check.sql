-- Hosted schema parity check (issue #69). READ ONLY -- writes nothing, locks
-- nothing, and is safe to run against production at any time.
--
-- Paste the whole file into the Supabase SQL editor. Every row comes back with
-- a `status` of PASS or FAIL. Any FAIL means the hosted database has drifted
-- from `supabase/migrations/` and the release is not safe to hand to users.
--
-- Why this file exists rather than a workflow: `.github/workflows/schema-drift.yml`
-- is the automated version of the same question, and it cannot run without a
-- `SUPABASE_DB_URL` repository secret, which does not exist. Until it does, this
-- is the gate. See docs/DEPLOYMENT.md for when running it is mandatory.
--
-- Keep the expected migration list below in step with `supabase/migrations/`.
-- `tests/unit/hosted-parity-check.test.ts` fails the fast CI lane if they drift
-- apart, so this file cannot quietly go stale.

with expected_migrations(version, name) as (
  values
    ('00000000000000','baseline'),
    ('20260815000000','enforce_public_moderation_visibility'),
    ('20260815210000','gig_visibility_excludes_lifecycle_status'),
    ('20260816000000','lock_first_role_assignment'),
    ('20260816010000','atomic_profile_writes'),
    ('20260816020000','atomic_gig_writes'),
    ('20260816030000','idempotent_account_deletion'),
    ('20260816040000','profile_launch_readiness'),
    ('20260816050000','auth_user_profile_trigger'),
    ('20260816050845','revert_dual_role_capabilities'),
    ('20260816120000','lock_app_user_self_update'),
    ('20260816130000','fix_transactional_write_grants')
),

-- 1. Migration history matches the repository, in both directions.
history as (
  select
    'migration history' as check_name,
    case
      when (select count(*) from expected_migrations e
             where not exists (select 1 from supabase_migrations.schema_migrations m
                               where m.version = e.version)) > 0
        then 'FAIL'
      when (select count(*) from supabase_migrations.schema_migrations m
             where not exists (select 1 from expected_migrations e
                               where e.version = m.version)) > 0
        then 'FAIL'
      else 'PASS'
    end as status,
    coalesce(
      nullif((select string_agg(e.version || ' ' || e.name, ', ' order by e.version)
                from expected_migrations e
               where not exists (select 1 from supabase_migrations.schema_migrations m
                                 where m.version = e.version)), '')
        || ' missing from hosted',
      nullif((select string_agg(m.version || ' ' || coalesce(m.name,'?'), ', ' order by m.version)
                from supabase_migrations.schema_migrations m
               where not exists (select 1 from expected_migrations e
                                 where e.version = m.version)), '')
        || ' present on hosted but not in the repository',
      'all ' || (select count(*)::text from expected_migrations) || ' migrations recorded'
    ) as detail
),

-- 2. Issue #59: privileged columns are unreachable for a signed-in client.
privileged as (
  select
    'privileged columns locked (#59)' as check_name,
    case when count(*) filter (where reachable) = 0 then 'PASS' else 'FAIL' end as status,
    coalesce(
      nullif(string_agg(target, ', ') filter (where reachable), ''),
      'no privileged column is writable by authenticated'
    ) as detail
  from (
    select
      t.tbl || '.' || c.col || ' (' || p.priv || ')' as target,
      has_column_privilege('authenticated', t.tbl, c.col, p.priv) as reachable
    from (values ('public.musician_profile'), ('public.gig')) as t(tbl)
    cross join (values ('is_public'), ('is_verified'), ('moderation_status'), ('admin_notes')) as c(col)
    cross join (values ('INSERT'), ('UPDATE')) as p(priv)
    union all
    select
      'public.app_user.' || c.col || ' (UPDATE)',
      has_column_privilege('authenticated', 'public.app_user', c.col, 'UPDATE')
    from (values ('is_admin_support_account'), ('is_public'), ('moderation_status'),
                 ('is_verified'), ('admin_notes')) as c(col)
  ) probes
),

-- 3. Issue #68: the columns the write RPCs actually need are granted, and
--    updated_at is not (the BEFORE UPDATE trigger owns it).
writable as (
  select
    'write path grants (#68)' as check_name,
    case
      when not has_column_privilege('authenticated','public.musician_profile','display_name','INSERT') then 'FAIL'
      when not has_column_privilege('authenticated','public.musician_profile','display_name','UPDATE') then 'FAIL'
      when not has_column_privilege('authenticated','public.gig','title','INSERT') then 'FAIL'
      when not has_column_privilege('authenticated','public.gig','title','UPDATE') then 'FAIL'
      when has_column_privilege('authenticated','public.musician_profile','updated_at','UPDATE') then 'FAIL'
      when has_column_privilege('authenticated','public.gig','updated_at','UPDATE') then 'FAIL'
      else 'PASS'
    end as status,
    'content columns granted, updated_at withheld' as detail
),

-- 4. The objects each migration is supposed to have created are present.
objects as (
  select check_name, case when present then 'PASS' else 'FAIL' end as status, detail
  from (
    values
      ('set_updated_at trigger on musician_profile',
       exists (select 1 from pg_trigger t join pg_class c on c.oid=t.tgrelid
               join pg_namespace n on n.oid=c.relnamespace
               where n.nspname='public' and c.relname='musician_profile'
                 and t.tgname='set_musician_profile_updated_at'),
       'from 20260816130000'),
      ('set_updated_at trigger on gig',
       exists (select 1 from pg_trigger t join pg_class c on c.oid=t.tgrelid
               join pg_namespace n on n.oid=c.relnamespace
               where n.nspname='public' and c.relname='gig'
                 and t.tgname='set_gig_updated_at'),
       'from 20260816130000'),
      ('musician_profile_is_launch_ready exists',
       exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
               where n.nspname='public' and p.proname='musician_profile_is_launch_ready'),
       'from 20260816040000'),
      ('public profile predicate applies launch readiness',
       (select pg_get_functiondef(p.oid) like '%musician_profile_is_launch_ready%'
          from pg_proc p join pg_namespace n on n.oid=p.pronamespace
         where n.nspname='public' and p.proname='marketplace_profile_is_public'),
       'from 20260816040000'),
      ('handle_new_user trigger on auth.users',
       exists (select 1 from pg_trigger t join pg_class c on c.oid=t.tgrelid
               join pg_namespace n on n.oid=c.relnamespace
               where n.nspname='auth' and c.relname='users'
                 and t.tgname='on_auth_user_created'),
       'from 20260816050000'),
      ('immutable role trigger on app_user',
       exists (select 1 from pg_trigger t join pg_class c on c.oid=t.tgrelid
               join pg_namespace n on n.oid=c.relnamespace
               where n.nspname='public' and c.relname='app_user' and not t.tgisinternal
                 and t.tgname like '%role%'),
       'from 20260816000000'),
      ('write RPCs are SECURITY INVOKER',
       not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                   where n.nspname='public' and p.prosecdef
                     and p.proname in ('create_musician_profile_with_tags','update_musician_profile_with_tags',
                                       'create_gig_with_tags','update_gig_with_tags')),
       'from 20260816130000'),
      ('no bare-INSERT write RPC remains',
       not exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
                   where n.nspname='public'
                     and p.proname in ('create_musician_profile_with_tags','create_gig_with_tags')
                     and pg_get_functiondef(p.oid) ~* 'INSERT INTO public\.(musician_profile|gig)\s+SELECT'),
       'guards the #68 regression')
  ) as t(check_name, present, detail)
),

-- 5. RLS is still on for every table that carries user content.
rls as (
  select
    'row level security enabled' as check_name,
    case when count(*) filter (where not c.relrowsecurity) = 0 then 'PASS' else 'FAIL' end as status,
    coalesce(nullif(string_agg(c.relname, ', ') filter (where not c.relrowsecurity), ''),
             'enabled on all ' || count(*)::text || ' checked tables') as detail
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in ('app_user','gig','musician_profile','gig_instrument','gig_genre',
                      'musician_instrument','musician_genre')
)

select check_name, status, detail from history
union all select check_name, status, detail from privileged
union all select check_name, status, detail from writable
union all select check_name, status, detail from objects
union all select check_name, status, detail from rls
order by status desc, check_name;
