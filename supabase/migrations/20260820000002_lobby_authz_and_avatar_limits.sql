-- ============================================================================
-- Lobby authorization + avatar upload limits
-- Closes finding 3 (INSERT/DELETE) and finding 9 from docs/security.md.
--
-- Before this migration a single blanket policy — ALL / using(true) /
-- with check(true) for `authenticated` — let anyone who clicked "Гость"
-- insert, rewrite or delete any lobby row in the database.
--
-- UPDATE was already narrowed to the host_id column by the previous migration
-- (game_state changes only through the update_game_state CAS RPC). What
-- remained was INSERT, which never checked ownership, and DELETE, which any
-- authenticated user could issue against any room.
--
-- DELETE is load-bearing: the last player to leave removes the room, and that
-- player is not necessarily the host. So it cannot simply be restricted to the
-- owner — it moves behind a SECURITY DEFINER function that re-derives the
-- right to delete from the lobby's own state.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. leave_lobby — the only path that may delete a room
--
-- Allowed when the caller is the host (closing their own room), or when the
-- caller is the last remaining participant. Anyone else gets false and the
-- row is untouched.
--
-- `players` is an array in Coup/Flager/Spyfall and an object keyed by user id
-- in Battleship/Minesweeper, so both shapes are handled explicitly.
-- ----------------------------------------------------------------------------
create or replace function public.leave_lobby(p_lobby_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_host      uuid;
  v_players   jsonb;
  v_count     int;
  v_is_member boolean;
begin
  if v_uid is null then
    return false;
  end if;

  select host_id, game_state->'players'
    into v_host, v_players
  from public.lobbies
  where id = p_lobby_id;

  -- No such lobby (already gone) — nothing to do, and not an error.
  if not found then
    return false;
  end if;

  -- The host may always close their own room.
  if v_host = v_uid then
    delete from public.lobbies where id = p_lobby_id;
    return true;
  end if;

  case jsonb_typeof(v_players)
    when 'array' then
      v_count := jsonb_array_length(v_players);
      v_is_member := exists (
        select 1 from jsonb_array_elements(v_players) e
        where e->>'id' = v_uid::text
      );
    when 'object' then
      select count(*) into v_count from jsonb_object_keys(v_players);
      v_is_member := v_players ? v_uid::text;
    else
      return false;
  end case;

  -- Last participant standing: leaving empties the room, so remove it.
  if v_is_member and v_count <= 1 then
    delete from public.lobbies where id = p_lobby_id;
    return true;
  end if;

  return false;
end;
$$;

revoke all on function public.leave_lobby(uuid) from public;
grant execute on function public.leave_lobby(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 2. Replace the blanket policy with per-command policies
-- ----------------------------------------------------------------------------
drop policy if exists "Enable all access for authenticated users" on public.lobbies;
drop policy if exists "Enable read for anon" on public.lobbies;

-- Browsing the room list stays open — it is how players find a game.
create policy lobbies_select on public.lobbies
  for select to anon, authenticated
  using (true);

-- A room may only be created in your own name.
create policy lobbies_insert on public.lobbies
  for insert to authenticated
  with check (host_id = auth.uid());

-- Column privileges already restrict this to host_id; the row is left open
-- because host transfer is performed by whichever player writes the state
-- after the host leaves, not by the host themselves.
create policy lobbies_update on public.lobbies
  for update to authenticated
  using (true)
  with check (true);

-- No DELETE policy on purpose: deletion happens only through leave_lobby(),
-- which is SECURITY DEFINER and therefore bypasses RLS.
revoke delete on table public.lobbies from anon, authenticated;

-- ----------------------------------------------------------------------------
-- 3. Avatar uploads — enforce server-side what the client already checks
--
-- Settings.tsx rejects files over 2 MiB and accepts image/*, but that check
-- lives in the browser and is trivially bypassed. The bucket now enforces the
-- same limit, so an authenticated user cannot upload arbitrary large files.
-- ----------------------------------------------------------------------------
update storage.buckets
   set file_size_limit  = 2097152, -- 2 MiB, matching the client-side check
       allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
 where id = 'avatars';

commit;
