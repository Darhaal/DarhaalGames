-- ============================================================================
-- Darhaal Games v2.0 — Security migration (STAGES 1-3)
-- ✅ APPLIED to production (amemndrojsaccfhtbsxc) on 2026-07-09 via Management API.
--
-- Contents:
--   1. profiles.username column + fixed signup trigger + data backfill
--      (audit finding: the trigger wrote full_name only while the app stores
--       the nickname under the 'username' metadata key — username login and
--       profile renames never worked; most users had no profiles or
--       player_stats rows at all)
--   2. Unique index on lobbies.code
--   3. RPCs: join_lobby_check, update_game_state (CAS), get_login_email
--   4. RLS: enabled on profiles (was fully open!), player_stats SELECT
--      tightened to owner-only. lobbies policies kept as-is (already sane).
--
-- The final lockdown (hiding the password/email columns) is a separate file:
--   20260709000001_v2_lockdown.sql — apply ONLY after the v2.0 frontend
--   is deployed (the legacy frontend still selects those columns).
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. profiles.username + trigger fix + backfill
-- ----------------------------------------------------------------------------
alter table public.profiles add column if not exists username text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Player'),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'username', 'Player'),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Backfill profiles for existing email users lacking a row
insert into public.profiles (id, username, full_name, email, avatar_url)
select u.id,
  coalesce(u.raw_user_meta_data->>'username', u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email,'@',1)),
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'username', split_part(u.email,'@',1)),
  u.email,
  u.raw_user_meta_data->>'avatar_url'
from auth.users u
where u.email is not null
  and not exists (select 1 from public.profiles p where p.id = u.id);

-- Sync username/email in existing profile rows
update public.profiles p
set username = coalesce(u.raw_user_meta_data->>'username', p.username, p.full_name),
    email = coalesce(p.email, u.email),
    avatar_url = coalesce(u.raw_user_meta_data->>'avatar_url', p.avatar_url)
from auth.users u
where u.id = p.id;

-- Backfill player_stats (updatePlayerStats silently skips users without a row)
insert into public.player_stats (user_id)
select u.id from auth.users u
where not exists (select 1 from public.player_stats s where s.user_id = u.id);

-- ----------------------------------------------------------------------------
-- 2. Unique room codes
-- ----------------------------------------------------------------------------
create unique index if not exists lobbies_code_key on public.lobbies (code);

-- ----------------------------------------------------------------------------
-- 3. RPCs
-- ----------------------------------------------------------------------------

-- Server-side private-lobby password check (the password never leaves the DB)
create or replace function public.join_lobby_check(p_lobby_id uuid, p_password text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.lobbies
    where id = p_lobby_id
      and (is_private = false or password = p_password)
  );
$$;

revoke all on function public.join_lobby_check(uuid, text) from public;
grant execute on function public.join_lobby_check(uuid, text) to anon, authenticated;

-- Optimistic-locking (compare-and-swap) game_state update.
-- Returns true when the write happened; false when the expected version
-- did not match (someone else wrote first — the client should re-sync).
create or replace function public.update_game_state(
  p_lobby_id uuid,
  p_expected_version int,
  p_new_state jsonb,
  p_status text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated int;
begin
  update public.lobbies
     set game_state = p_new_state,
         status = p_status
   where id = p_lobby_id
     and coalesce((game_state->>'version')::int, 0) = p_expected_version
     and coalesce((game_state->>'version')::int, 0) < coalesce((p_new_state->>'version')::int, 0);

  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;

revoke all on function public.update_game_state(uuid, int, jsonb, text) from public;
grant execute on function public.update_game_state(uuid, int, jsonb, text) to anon, authenticated;

-- Username -> email resolution for sign-in (the email column stays server-side)
create or replace function public.get_login_email(p_username text)
returns text
language sql
security definer
set search_path = public
as $$
  select email from public.profiles
  where username = p_username or (username is null and full_name = p_username)
  limit 1;
$$;

revoke all on function public.get_login_email(text) from public;
grant execute on function public.get_login_email(text) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. RLS
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (true);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);

-- player_stats: SELECT owner-only (was: any authenticated user)
drop policy if exists "Stats are viewable by authenticated users" on public.player_stats;
drop policy if exists player_stats_select_own on public.player_stats;
create policy player_stats_select_own on public.player_stats
  for select using (auth.uid() = user_id);

-- lobbies: existing policies kept ("Enable read for anon" SELECT,
-- "Enable all access for authenticated users" ALL)

commit;
