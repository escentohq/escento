-- User-submitted reports for moderation.
-- Additive only: public profile/gig behavior is unchanged.

create extension if not exists pgcrypto;

create table if not exists content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references app_user(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  target_owner_id uuid references app_user(id) on delete set null,
  subject text not null,
  description text not null,
  evidence text,
  status text not null default 'open',
  admin_notes text,
  resolved_by uuid references app_user(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_reports_target_type_check
    check (target_type in ('musician_profile', 'gig')),
  constraint content_reports_status_check
    check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  constraint content_reports_subject_length_check
    check (char_length(btrim(subject)) between 3 and 140),
  constraint content_reports_description_length_check
    check (char_length(btrim(description)) between 10 and 4000),
  constraint content_reports_evidence_length_check
    check (evidence is null or char_length(btrim(evidence)) <= 2000)
);

create index if not exists content_reports_status_created_at_idx
  on content_reports(status, created_at desc);

create index if not exists content_reports_target_idx
  on content_reports(target_type, target_id, created_at desc);

create index if not exists content_reports_reporter_idx
  on content_reports(reporter_id, created_at desc);

create or replace function content_reports_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists content_reports_touch_updated_at on content_reports;
create trigger content_reports_touch_updated_at
before update on content_reports
for each row execute function content_reports_touch_updated_at();

alter table content_reports enable row level security;

drop policy if exists "users can create own content reports" on content_reports;
create policy "users can create own content reports"
on content_reports for insert
with check (reporter_id = auth.uid());

drop policy if exists "users can select own content reports" on content_reports;
create policy "users can select own content reports"
on content_reports for select
using (reporter_id = auth.uid());
