-- ============================================================================
-- ⚠️ SUPERSEDED / DOES NOT WORK — kept for history only.
--
-- These column-level revokes are a NO-OP while the table-level GRANT SELECT
-- stands: in PostgreSQL a table privilege covers every column. Running this
-- file changes nothing (verified against production on 2026-08-20 — the
-- columns stayed readable by the anon key afterwards).
--
-- Use 20260820000000_v2_1_hardening.sql instead, which revokes SELECT on the
-- table and re-grants the safe columns explicitly.
-- ============================================================================

-- ============================================================================
-- Darhaal Games v2.0 — Final lockdown (STAGE 4)
-- ⚠️ NOT YET APPLIED. Apply ONLY after the v2.0 frontend is live.
--
-- The legacy (v1.x) frontend selects lobbies.* (incl. password) and reads
-- profiles.email directly — these revokes would break it. The v2.0 frontend
-- selects explicit columns and uses the RPCs, so it is unaffected.
-- ============================================================================

-- Hide lobby passwords from clients entirely
revoke select (password) on table public.lobbies from anon, authenticated;

-- Hide emails from clients entirely (login resolution goes through get_login_email)
revoke select (email) on table public.profiles from anon, authenticated;
