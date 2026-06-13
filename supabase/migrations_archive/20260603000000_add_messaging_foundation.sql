-- Messaging foundation for Escento.
-- Apply in Supabase SQL editor or through Supabase CLI.

create extension if not exists pgcrypto;

create table if not exists conversation_requests (
  id text primary key default gen_random_uuid()::text,
  requester_id uuid not null,
  recipient_id uuid not null,
  status text not null default 'pending',
  intro_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  accepted_at timestamptz,
  rejected_at timestamptz,
  constraint conversation_requests_requester_id_fkey
    foreign key (requester_id) references app_user(id) on delete cascade,
  constraint conversation_requests_recipient_id_fkey
    foreign key (recipient_id) references app_user(id) on delete cascade,
  constraint conversation_requests_status_check
    check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  constraint conversation_requests_distinct_users_check
    check (requester_id <> recipient_id),
  constraint conversation_requests_intro_length_check
    check (intro_message is null or char_length(btrim(intro_message)) <= 600)
);

create table if not exists conversations (
  id text primary key default gen_random_uuid()::text,
  type text not null default 'direct',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz,
  created_by uuid not null,
  source_request_id text,
  constraint conversations_created_by_fkey
    foreign key (created_by) references app_user(id) on delete cascade,
  constraint conversations_source_request_id_fkey
    foreign key (source_request_id) references conversation_requests(id) on delete set null,
  constraint conversations_type_check
    check (type in ('direct'))
);

create table if not exists conversation_participants (
  id text primary key default gen_random_uuid()::text,
  conversation_id text not null,
  user_id uuid not null,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  deleted_at timestamptz,
  constraint conversation_participants_conversation_id_fkey
    foreign key (conversation_id) references conversations(id) on delete cascade,
  constraint conversation_participants_user_id_fkey
    foreign key (user_id) references app_user(id) on delete cascade
);

create table if not exists messages (
  id text primary key default gen_random_uuid()::text,
  conversation_id text not null,
  sender_id uuid not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint messages_conversation_id_fkey
    foreign key (conversation_id) references conversations(id) on delete cascade,
  constraint messages_sender_id_fkey
    foreign key (sender_id) references app_user(id) on delete cascade,
  constraint messages_body_not_blank_check
    check (char_length(btrim(body)) > 0),
  constraint messages_body_length_check
    check (char_length(btrim(body)) <= 2000)
);

create table if not exists user_blocks (
  id text primary key default gen_random_uuid()::text,
  blocker_id uuid not null,
  blocked_id uuid not null,
  created_at timestamptz not null default now(),
  constraint user_blocks_blocker_id_fkey
    foreign key (blocker_id) references app_user(id) on delete cascade,
  constraint user_blocks_blocked_id_fkey
    foreign key (blocked_id) references app_user(id) on delete cascade,
  constraint user_blocks_distinct_users_check
    check (blocker_id <> blocked_id),
  constraint user_blocks_unique_pair unique (blocker_id, blocked_id)
);

create unique index if not exists conversation_requests_one_pending_pair_idx
  on conversation_requests (
    least(requester_id, recipient_id),
    greatest(requester_id, recipient_id)
  )
  where status = 'pending';

create unique index if not exists conversations_source_request_unique_idx
  on conversations(source_request_id)
  where source_request_id is not null;

create unique index if not exists conversation_participants_unique_active_user_idx
  on conversation_participants(conversation_id, user_id)
  where deleted_at is null;

create index if not exists conversation_requests_recipient_status_idx
  on conversation_requests(recipient_id, status, created_at desc);

create index if not exists conversation_requests_requester_status_idx
  on conversation_requests(requester_id, status, created_at desc);

create index if not exists conversations_last_message_at_idx
  on conversations(last_message_at desc nulls last, updated_at desc);

create index if not exists conversation_participants_user_active_idx
  on conversation_participants(user_id, deleted_at, conversation_id);

create index if not exists messages_conversation_created_at_idx
  on messages(conversation_id, created_at asc);

create index if not exists messages_unread_lookup_idx
  on messages(conversation_id, created_at, sender_id)
  where deleted_at is null;

create index if not exists user_blocks_blocked_lookup_idx
  on user_blocks(blocked_id, blocker_id);

create or replace function messaging_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists conversation_requests_touch_updated_at on conversation_requests;
create trigger conversation_requests_touch_updated_at
before update on conversation_requests
for each row execute function messaging_touch_updated_at();

drop trigger if exists conversations_touch_updated_at on conversations;
create trigger conversations_touch_updated_at
before update on conversations
for each row execute function messaging_touch_updated_at();

drop trigger if exists messages_touch_updated_at on messages;
create trigger messages_touch_updated_at
before update on messages
for each row execute function messaging_touch_updated_at();

create or replace function messaging_is_active_participant(
  p_conversation_id text,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from conversation_participants cp
    where cp.conversation_id = p_conversation_id
      and cp.user_id = p_user_id
      and cp.deleted_at is null
  );
$$;

create or replace function messaging_is_request_party(
  p_request_id text,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from conversation_requests cr
    where cr.id = p_request_id
      and p_user_id in (cr.requester_id, cr.recipient_id)
  );
$$;

create or replace function messaging_is_blocked_between(
  p_user_a uuid,
  p_user_b uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from user_blocks ub
    where (ub.blocker_id = p_user_a and ub.blocked_id = p_user_b)
       or (ub.blocker_id = p_user_b and ub.blocked_id = p_user_a)
  );
$$;

create or replace function messaging_direct_conversation_exists(
  p_user_a uuid,
  p_user_b uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from conversations c
    join conversation_participants cpa
      on cpa.conversation_id = c.id
     and cpa.user_id = p_user_a
     and cpa.deleted_at is null
    join conversation_participants cpb
      on cpb.conversation_id = c.id
     and cpb.user_id = p_user_b
     and cpb.deleted_at is null
    where c.type = 'direct'
  );
$$;

create or replace function messaging_assert_request_allowed()
returns trigger
language plpgsql
as $$
declare
  v_actor_id uuid := auth.uid();
begin
  new.intro_message = nullif(btrim(coalesce(new.intro_message, '')), '');

  if tg_op = 'UPDATE' then
    if new.requester_id <> old.requester_id
      or new.recipient_id <> old.recipient_id
      or new.created_at <> old.created_at then
      raise exception 'request identity fields cannot be changed';
    end if;

    if old.status <> new.status then
      if old.status <> 'pending' then
        raise exception 'processed requests cannot change status';
      end if;

      if new.status = 'accepted' and v_actor_id <> old.recipient_id then
        raise exception 'only the recipient can accept a request';
      end if;

      if new.status = 'rejected' and v_actor_id <> old.recipient_id then
        raise exception 'only the recipient can reject a request';
      end if;

      if new.status = 'cancelled' and v_actor_id <> old.requester_id then
        raise exception 'only the requester can cancel a request';
      end if;
    end if;
  end if;

  if new.status = 'pending' then
    if messaging_is_blocked_between(new.requester_id, new.recipient_id) then
      raise exception 'request blocked';
    end if;

    if messaging_direct_conversation_exists(new.requester_id, new.recipient_id) then
      raise exception 'direct conversation already exists';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists conversation_requests_assert_allowed on conversation_requests;
create trigger conversation_requests_assert_allowed
before insert or update on conversation_requests
for each row execute function messaging_assert_request_allowed();

create or replace function messaging_assert_conversation_update_allowed()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    if new.id <> old.id
      or new.type <> old.type
      or new.created_at <> old.created_at
      or new.created_by <> old.created_by
      or coalesce(new.source_request_id, '') <> coalesce(old.source_request_id, '') then
      raise exception 'conversation identity fields cannot be changed';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists conversations_assert_update_allowed on conversations;
create trigger conversations_assert_update_allowed
before update on conversations
for each row execute function messaging_assert_conversation_update_allowed();

create or replace function messaging_assert_direct_participant_limit()
returns trigger
language plpgsql
as $$
declare
  v_type text;
  v_active_count integer;
begin
  if tg_op = 'UPDATE' then
    if new.id <> old.id
      or new.conversation_id <> old.conversation_id
      or new.user_id <> old.user_id
      or new.joined_at <> old.joined_at then
      raise exception 'participant identity fields cannot be changed';
    end if;
  end if;

  if new.deleted_at is not null then
    return new;
  end if;

  select type into v_type
  from conversations
  where id = new.conversation_id;

  if v_type = 'direct' then
    select count(*) into v_active_count
    from conversation_participants
    where conversation_id = new.conversation_id
      and deleted_at is null
      and id <> coalesce(new.id, '');

    if v_active_count >= 2 then
      raise exception 'direct conversations can have at most 2 active participants';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists conversation_participants_direct_limit on conversation_participants;
create trigger conversation_participants_direct_limit
before insert or update on conversation_participants
for each row execute function messaging_assert_direct_participant_limit();

create or replace function messaging_assert_message_allowed()
returns trigger
language plpgsql
as $$
declare
  v_type text;
  v_other_user_id uuid;
begin
  new.body = btrim(new.body);

  if tg_op = 'UPDATE' then
    if new.id <> old.id
      or new.conversation_id <> old.conversation_id
      or new.sender_id <> old.sender_id
      or new.created_at <> old.created_at then
      raise exception 'message identity fields cannot be changed';
    end if;
  end if;

  if not messaging_is_active_participant(new.conversation_id, new.sender_id) then
    raise exception 'sender is not an active participant';
  end if;

  select type into v_type
  from conversations
  where id = new.conversation_id;

  if v_type = 'direct' then
    select cp.user_id into v_other_user_id
    from conversation_participants cp
    where cp.conversation_id = new.conversation_id
      and cp.user_id <> new.sender_id
      and cp.deleted_at is null
    limit 1;

    if v_other_user_id is not null
      and messaging_is_blocked_between(new.sender_id, v_other_user_id) then
      raise exception 'message blocked';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists messages_assert_allowed on messages;
create trigger messages_assert_allowed
before insert or update on messages
for each row execute function messaging_assert_message_allowed();

create or replace function messaging_accept_connection_request(p_request_id text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_request conversation_requests%rowtype;
  v_conversation_id text := gen_random_uuid()::text;
begin
  if v_actor_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_request
  from conversation_requests
  where id = p_request_id
    and recipient_id = v_actor_id
    and status = 'pending'
  for update;

  if not found then
    raise exception 'request not found';
  end if;

  if messaging_is_blocked_between(v_request.requester_id, v_request.recipient_id) then
    raise exception 'request blocked';
  end if;

  if messaging_direct_conversation_exists(v_request.requester_id, v_request.recipient_id) then
    raise exception 'direct conversation already exists';
  end if;

  update conversation_requests
  set status = 'accepted',
      accepted_at = now(),
      rejected_at = null
  where id = p_request_id;

  insert into conversations (id, type, created_by, source_request_id)
  values (v_conversation_id, 'direct', v_actor_id, p_request_id);

  insert into conversation_participants (conversation_id, user_id, joined_at, last_read_at)
  values
    (v_conversation_id, v_request.requester_id, now(), now()),
    (v_conversation_id, v_request.recipient_id, now(), now());

  return v_conversation_id;
end;
$$;

grant execute on function messaging_accept_connection_request(text) to authenticated;

alter table conversation_requests enable row level security;
alter table conversations enable row level security;
alter table conversation_participants enable row level security;
alter table messages enable row level security;
alter table user_blocks enable row level security;

drop policy if exists "request parties can select requests" on conversation_requests;
create policy "request parties can select requests"
on conversation_requests for select
using (auth.uid() in (requester_id, recipient_id));

drop policy if exists "users can create own requests" on conversation_requests;
create policy "users can create own requests"
on conversation_requests for insert
with check (requester_id = auth.uid());

drop policy if exists "request parties can update requests" on conversation_requests;
create policy "request parties can update requests"
on conversation_requests for update
using (auth.uid() in (requester_id, recipient_id))
with check (auth.uid() in (requester_id, recipient_id));

drop policy if exists "participants can select conversations" on conversations;
create policy "participants can select conversations"
on conversations for select
using (messaging_is_active_participant(id, auth.uid()));

drop policy if exists "users can create conversations" on conversations;
create policy "users can create conversations"
on conversations for insert
with check (created_by = auth.uid());

drop policy if exists "participants can update conversations" on conversations;
create policy "participants can update conversations"
on conversations for update
using (messaging_is_active_participant(id, auth.uid()))
with check (messaging_is_active_participant(id, auth.uid()));

drop policy if exists "participants can select participants" on conversation_participants;
create policy "participants can select participants"
on conversation_participants for select
using (messaging_is_active_participant(conversation_id, auth.uid()));

drop policy if exists "request parties can create participants" on conversation_participants;
create policy "request parties can create participants"
on conversation_participants for insert
with check (
  (
    user_id = auth.uid()
    and exists (
      select 1
      from conversations c
      where c.id = conversation_id
        and c.created_by = auth.uid()
    )
  )
  or exists (
    select 1
    from conversations c
    join conversation_requests cr on cr.id = c.source_request_id
    where c.id = conversation_id
      and auth.uid() in (cr.requester_id, cr.recipient_id)
      and user_id in (cr.requester_id, cr.recipient_id)
  )
);

drop policy if exists "users can update own participant row" on conversation_participants;
create policy "users can update own participant row"
on conversation_participants for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "participants can select messages" on messages;
create policy "participants can select messages"
on messages for select
using (
  deleted_at is null
  and messaging_is_active_participant(conversation_id, auth.uid())
);

drop policy if exists "participants can send messages" on messages;
create policy "participants can send messages"
on messages for insert
with check (
  sender_id = auth.uid()
  and messaging_is_active_participant(conversation_id, auth.uid())
);

drop policy if exists "senders can update own messages" on messages;
create policy "senders can update own messages"
on messages for update
using (sender_id = auth.uid())
with check (sender_id = auth.uid());

drop policy if exists "users can select own blocks" on user_blocks;
create policy "users can select own blocks"
on user_blocks for select
using (blocker_id = auth.uid());

drop policy if exists "users can create own blocks" on user_blocks;
create policy "users can create own blocks"
on user_blocks for insert
with check (blocker_id = auth.uid());

drop policy if exists "users can delete own blocks" on user_blocks;
create policy "users can delete own blocks"
on user_blocks for delete
using (blocker_id = auth.uid());
