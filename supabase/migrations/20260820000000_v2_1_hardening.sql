-- ============================================================================
-- Darhaal Games v2.1 — Security hardening
-- Applied to production (amemndrojsaccfhtbsxc) on 2026-08-20.
--
-- Supersedes 20260709000001_v2_lockdown.sql, which was a NO-OP: it issued
-- `revoke select (password) ...` while the table-level `GRANT SELECT` was
-- still in place. In PostgreSQL a table-level privilege covers every column,
-- so revoking a single column's privilege changes nothing. The correct
-- sequence is to revoke SELECT on the table and re-grant it per column.
--
-- Findings addressed, most severe first:
--   1. TRUNCATE was granted to anon on every public table. TRUNCATE is NOT
--      subject to row-level security, so anyone holding the public anon key
--      could wipe lobbies, profiles and player_stats regardless of policies.
--   2. lobbies.password and profiles.email were readable by anon (the failed
--      lockdown above).
--   3. Any authenticated user — including anonymous guests — could UPDATE any
--      lobby row directly, bypassing the compare-and-swap RPC: arbitrary
--      game_state tampering and password rewrites on rooms they do not own.
--   4. Four tables from an unrelated project (events, groups, group_members,
--      personal_schedule) had RLS disabled and full DML granted to anon.
--   5. Clients held INSERT/DELETE on profiles and player_stats, which only the
--      signup trigger should ever write.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. TRUNCATE must never be held by a client role (it bypasses RLS entirely)
-- ----------------------------------------------------------------------------
revoke truncate on all tables in schema public from anon, authenticated;

-- ----------------------------------------------------------------------------
-- 2. lobbies — hide the password, keep the browsable columns
-- ----------------------------------------------------------------------------
revoke select on table public.lobbies from anon, authenticated;
grant select (id, created_at, name, code, is_private, status, host_id, game_state)
  on table public.lobbies to anon, authenticated;

-- anon browses the lobby list and nothing else; joining requires signing in
-- (guests included, which is the `authenticated` role in Supabase).
revoke insert, update, delete on table public.lobbies from anon;

-- game_state may only change through update_game_state (SECURITY DEFINER, so
-- it is unaffected by these grants). host_id stays directly writable because
-- host transfer is a plain lightweight update in gameStateSync.ts.
revoke update on table public.lobbies from authenticated;
grant update (host_id) on table public.lobbies to authenticated;

-- ----------------------------------------------------------------------------
-- 3. profiles — hide the email; login resolution goes through get_login_email
-- ----------------------------------------------------------------------------
revoke select on table public.profiles from anon, authenticated;
grant select (id, full_name, avatar_url, created_at, username)
  on table public.profiles to anon, authenticated;

-- Rows are created by the handle_new_user trigger and never by a client.
revoke insert, delete on table public.profiles from anon, authenticated;
revoke update on table public.profiles from anon;

-- ----------------------------------------------------------------------------
-- 4. player_stats — rows are created by the signup trigger only
-- ----------------------------------------------------------------------------
revoke insert, delete on table public.player_stats from anon, authenticated;
revoke update on table public.player_stats from anon;

-- ----------------------------------------------------------------------------
-- 5. Tables belonging to an unrelated project — no client access at all.
--    All four are empty; RLS is enabled with no policies, which denies
--    everything, and the grants are withdrawn. Drop them once their owner
--    confirms they are dead.
-- ----------------------------------------------------------------------------
revoke all on table
  public.events, public.groups, public.group_members, public.personal_schedule
  from anon, authenticated;

alter table public.events            enable row level security;
alter table public.groups            enable row level security;
alter table public.group_members     enable row level security;
alter table public.personal_schedule enable row level security;

-- ----------------------------------------------------------------------------
-- 6. Pin search_path on the one SECURITY DEFINER function that was missed.
--    Without it the function can be made to resolve an unqualified name against
--    an attacker-controlled schema and run their code with definer privileges.
-- ----------------------------------------------------------------------------
alter function public.handle_new_user_stats() set search_path = public;

commit;

-- ============================================================================
-- NOT fixed here — needs application changes, see docs/security.md:
--
--   * lobbies still allows any authenticated user to INSERT any row and to
--     DELETE any lobby. DELETE is load-bearing: the last player to leave
--     removes the room (useLobbySync.deleteLobby, UniversalLobby), so it
--     cannot simply be restricted to the host. The fix is a SECURITY DEFINER
--     `leave_lobby(p_lobby_id)` RPC that deletes only when the caller is the
--     last participant, mirroring update_game_state.
--   * game_state remains client-authoritative: update_game_state validates the
--     version, not the move. Cheating is still possible by design.
-- ============================================================================
