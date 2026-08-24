-- ============================================================================
-- Scheduled cleanup of dead lobbies
--
-- Nothing ever removed a room that had run its course. `leave_lobby` only
-- fires when the last participant walks out, and a finished match is
-- deliberately left untouched so the results survive for the people still
-- reading them. Everything else accumulated forever — the oldest row in
-- production had been sitting there since March.
--
-- Two windows, both chosen to be obviously safe rather than tight:
--
--   finished  → 1 day.  Long enough that nobody loses a scoreboard they were
--               looking at, short enough that finished rooms do not pile up.
--   otherwise → 7 days. A waiting or playing room untouched for a week is
--               abandoned, not paused. This catches matches that were closed
--               mid-game and never reached `finished`.
--
-- Recency comes from `game_state.lastActionTime` (a JS millisecond timestamp
-- every game already maintains), falling back to `created_at`. Using
-- created_at alone would be wrong: a long match created yesterday and finished
-- a minute ago would look stale.
-- ============================================================================

begin;

create extension if not exists pg_cron;

create or replace function public.cleanup_stale_lobbies()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  with activity as (
    select
      id,
      status,
      coalesce(
        -- The regex guard matters: a malformed game_state must not abort the
        -- whole cleanup with a cast error.
        case
          when game_state->>'lastActionTime' ~ '^[0-9]+$'
            then to_timestamp((game_state->>'lastActionTime')::bigint / 1000.0)
        end,
        created_at
      ) as last_active
    from public.lobbies
  ),
  dead as (
    select id from activity
    where last_active < now() - case
      when status = 'finished' then interval '1 day'
      else interval '7 days'
    end
  )
  delete from public.lobbies l
   using dead d
   where l.id = d.id;

  get diagnostics v_deleted = row_count;

  if v_deleted > 0 then
    raise notice 'cleanup_stale_lobbies: removed % lobbies', v_deleted;
  end if;

  return v_deleted;
end;
$$;

-- Housekeeping, not an app capability — clients have no business calling it.
revoke all on function public.cleanup_stale_lobbies() from public, anon, authenticated;

-- Daily at 04:00 UTC. Unscheduled first so re-running this file does not
-- stack duplicate jobs.
select cron.unschedule('cleanup-stale-lobbies')
 where exists (select 1 from cron.job where jobname = 'cleanup-stale-lobbies');

select cron.schedule(
  'cleanup-stale-lobbies',
  '0 4 * * *',
  $$select public.cleanup_stale_lobbies()$$
);

commit;
