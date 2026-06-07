-- Admin moderation foundation for Motivo.
-- Additive only: existing users, profiles, and gigs remain public/verified by default.

alter table app_user
  add column if not exists is_admin boolean not null default false,
  add column if not exists is_public boolean not null default true,
  add column if not exists is_verified boolean not null default true,
  add column if not exists suspended_at timestamptz,
  add column if not exists suspension_reason text;

alter table musician_profile
  add column if not exists is_public boolean not null default true,
  add column if not exists is_verified boolean not null default true,
  add column if not exists moderation_reason text,
  add column if not exists deleted_at timestamptz;

alter table gig
  add column if not exists is_public boolean not null default true,
  add column if not exists is_verified boolean not null default true,
  add column if not exists moderation_reason text,
  add column if not exists deleted_at timestamptz;

create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references app_user(id) on delete cascade,
  action text not null,
  target_type text not null,
  target_id text not null,
  target_user_id uuid references app_user(id) on delete set null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint admin_audit_log_target_type_check
    check (target_type in ('user', 'musician_profile', 'creator_profile', 'gig'))
);

create index if not exists admin_audit_log_created_at_idx
  on admin_audit_log(created_at desc);

create index if not exists admin_audit_log_target_idx
  on admin_audit_log(target_type, target_id, created_at desc);

create index if not exists app_user_admin_idx
  on app_user(is_admin)
  where is_admin = true;

create index if not exists musician_profile_public_verified_idx
  on musician_profile(is_public, is_verified, updated_at desc)
  where deleted_at is null;

create index if not exists gig_public_verified_status_idx
  on gig(is_public, is_verified, status, created_at desc)
  where deleted_at is null;
