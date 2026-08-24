-- ============================================================================
-- player_stats → auth.users cascade + guest account cleanup
-- Applied to production (amemndrojsaccfhtbsxc) on 2026-08-20.
--
-- Context: profiles.id already cascaded on user deletion, but
-- player_stats.user_id had no delete action, so removing an account aborted
-- with a foreign-key violation instead of cleaning up after itself.
--
-- lobbies.host_id is deliberately left without a delete action: cascading it
-- would mean deleting an account silently destroys rooms other people may be
-- playing in. The trade-off is that an account hosting a lobby cannot be
-- deleted until that lobby is gone.
-- ============================================================================

alter table public.player_stats drop constraint player_stats_user_id_fkey;

alter table public.player_stats
  add constraint player_stats_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

-- ============================================================================
-- Guest cleanup executed the same day (recorded here, not re-runnable as-is).
--
-- Removed anonymous accounts with no activity in the last 7 days: 79 auth
-- users, 27 profiles, 79 player_stats rows. Kept the 5 real accounts and 1
-- recently active guest. Verified 0 orphans afterwards (6 / 6 / 6).
--
-- Deletion order matters — see the cascade note above — and any user hosting
-- a lobby must be excluded, since lobbies.host_id would block the delete:
--
--   begin;
--   create temp table victims as
--     select id from auth.users
--     where is_anonymous
--       and coalesce(last_sign_in_at, created_at) <= now() - interval '7 days';
--
--   -- guard: this must return 0 before proceeding
--   -- select count(*) from public.lobbies where host_id in (select id from victims);
--
--   delete from public.player_stats where user_id in (select id from victims);
--   delete from public.profiles     where id      in (select id from victims);
--   delete from auth.users          where id      in (select id from victims);
--   commit;
--
-- With the cascade above now in place, the two DELETEs on player_stats and
-- profiles are redundant for future runs — deleting the auth user is enough.
-- ============================================================================
