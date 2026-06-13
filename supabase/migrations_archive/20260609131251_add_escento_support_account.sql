-- Official Escento support account metadata.
-- Additive only: public routes do not depend on these fields.

alter table app_user
  add column if not exists is_system_account boolean not null default false,
  add column if not exists is_admin_support_account boolean not null default false,
  add column if not exists support_welcome_sent_at timestamptz;

create unique index if not exists app_user_one_admin_support_account_idx
  on app_user(is_admin_support_account)
  where is_admin_support_account = true;
