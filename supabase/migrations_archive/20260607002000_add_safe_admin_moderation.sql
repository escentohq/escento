-- Safe, additive admin moderation metadata.
-- These fields are intentionally not wired into public queries by this migration.

create extension if not exists pgcrypto;

alter table app_user
  add column if not exists is_public boolean not null default true,
  add column if not exists is_verified boolean not null default false,
  add column if not exists moderation_status text not null default 'active',
  add column if not exists admin_notes text;

alter table musician_profile
  add column if not exists is_public boolean not null default true,
  add column if not exists is_verified boolean not null default false,
  add column if not exists moderation_status text not null default 'active',
  add column if not exists admin_notes text;

alter table gig
  add column if not exists is_public boolean not null default true,
  add column if not exists is_verified boolean not null default false,
  add column if not exists moderation_status text not null default 'active',
  add column if not exists admin_notes text;

alter table app_user
  drop constraint if exists app_user_moderation_status_check,
  add constraint app_user_moderation_status_check
    check (moderation_status in ('active', 'hidden', 'needs_review'));

alter table musician_profile
  drop constraint if exists musician_profile_moderation_status_check,
  add constraint musician_profile_moderation_status_check
    check (moderation_status in ('active', 'hidden', 'needs_review'));

alter table gig
  drop constraint if exists gig_moderation_status_check,
  add constraint gig_moderation_status_check
    check (moderation_status in ('active', 'hidden', 'needs_review'));

create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_email text not null,
  action text not null,
  target_type text not null,
  target_id text not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint admin_audit_log_target_type_check
    check (target_type in ('user', 'musician_profile', 'creator_profile', 'gig'))
);

create index if not exists admin_audit_log_created_at_idx
  on admin_audit_log(created_at desc);

create index if not exists admin_audit_log_target_idx
  on admin_audit_log(target_type, target_id, created_at desc);

alter table admin_audit_log enable row level security;
