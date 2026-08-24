# 🔍 Audit Report — v1.5.4 (2026-07-09)

> **Historical.** This is the audit that preceded the 2.0 release, kept for the
> record of what the codebase looked like then and what was done about it.
> Everything listed as open here has since been either fixed or consciously
> accepted — for the current state of the system read
> [Security Analysis](security.md) instead.

Full source audit of the public `DarhaalGames` repository: all 53 source files
(~9 800 LOC) read and analyzed; build, lint and dependency audit executed.

## Scope & verification

| Check | Result |
|-------|--------|
| `npm run build` (Next.js 16, Turbopack) | ✅ Passes, 13 routes, TypeScript OK |
| `npm run lint` (ESLint 9) | ⚠️ 195 problems (82 errors / 113 warnings) — non-blocking |
| `npm audit` | ⚠️ 10 vulnerabilities (5 high / 4 moderate / 1 low), all in dev/transitive deps + 1 Next.js advisory |
| Dev server smoke test | ✅ Starts, serves HTTP 200 |
| Hardcoded secrets scan | ✅ Fixed — supabase anon fallback removed from source |

---

## 🐛 Bugs found & FIXED in this audit

| # | Severity | File | Bug | Fix |
|---|----------|------|-----|-----|
| 1 | **High** | `components/AuthForm.tsx` | Login by **email was broken**: the check `!email.includes('@')` used the `email` state, which is always empty in login mode (the input binds to `username`). Any email login fell into the username lookup and failed with "Not found". | Check `username.includes('@')` and use the input value as the email. |
| 2 | Medium | `components/AuthForm.tsx` | OAuth/signup redirect hardcoded `http://localhost:3000` and the old vercel domain — broke on other ports/domains. | Use `window.location.origin`. |
| 3 | **High** | `hooks/useBattleshipGame.ts` | Leaving the **waiting lobby** ended the game: the condition `status === 'playing' \|\| phase === 'setup'` was true pre-start (`phase` is `'setup'` while waiting), so the remaining player "won" a game that never started and the lobby died. | Condition narrowed to `status === 'playing'`. |
| 4 | **High** | `hooks/useMinesweeperGame.ts` | **Dead loss branch**: `isAlreadyEnded` was computed *after* callers set `status='lost'`, so the loss path never ran — loss stats were never recorded and the game never became `finished` when everyone died. | Removed the broken guard (callers already guarantee the player was `playing` before the action). |
| 5 | **High** | `hooks/useCoupGame.ts` | `leaveGame` mid-match didn't adjust `turnIndex` after filtering the players array — turn order shifted to the wrong player or pointed out of range; a leaver involved in a pending action left the game stuck in that phase. | Index re-based like `skipTurn` does; if the leaver was involved in the current action, the phase resets to a fresh turn. |
| 6 | Medium | `app/create/page.tsx` | Flager lobby was created with `players` as an **object**, but `FlagerState.players` is an **array**. Defensive code in the hook silently discarded the host entry and re-added it — worked by accident. | Create as `[initialHost]`. |
| 7 | Medium | `app/create/page.tsx` | Spyfall default pack id `'standard'` doesn't exist (packs are `general1`…): no pack appeared selected, no location preview; the hook silently fell back to pack #1. | Default to `SPYFALL_PACKS[0].id`. |
| 8 | Medium | `app/create/page.tsx` | Room code via `Math.random().toString(36).substring(2, 8)` can yield **fewer than 6 chars**; the Join button requires exactly 6 — such rooms were unjoinable by code. | Explicit 6-char generator over A–Z0–9. |
| 9 | Low | `components/FlagerGame.tsx` | Crash for late visitors: `calculateAccuracy(me)` with `me === undefined` (user opened a playing game via URL) threw on `p.history.forEach`. | Null guard. |
| 10 | Low | `components/UniversalLobby.tsx` | Room-code copy used only the deprecated `document.execCommand('copy')`. | `navigator.clipboard` with legacy fallback. |
| — | **Critical** | `lib/supabase.ts` (fixed earlier) | Real Supabase URL + anon key hardcoded as fallback in a public repo; the fallback URL was also wrong (`.supabase.com` instead of `.co`). | Env-only with a descriptive startup error; `.env.example` documented. |

## 🔓 Security findings (OPEN — require Supabase-side work)

These cannot be fully fixed client-side; they are also listed in [TODO.md](../TODO.md).

1. **Lobby passwords are plaintext and shipped to every client.**
   `/play` does `select('*')` on `lobbies` — the `password` column arrives in the
   browser for every row, and the check `lobby.password !== pass` runs client-side.
   Anyone can read all room passwords from the network tab.
   *Fix direction:* column-level security / a `join_lobby` RPC with
   `SECURITY DEFINER`, or at minimum select only needed columns + hash passwords.
2. **`profiles.email` readable via anon key.** Username → email login resolution
   reads emails client-side; enables email harvesting/enumeration by username.
   *Fix direction:* RPC that performs the resolution server-side, or sign-in via
   a Supabase edge function.
3. **Client-authoritative game state.** Any player can write arbitrary
   `game_state` (cheating: seeing battleship ships is already possible since the
   full state syncs to both clients; spyfall roles/location are visible to the spy
   client too). Acceptable for a friendly platform; a server-authoritative
   refactor (edge functions / DB functions) is the long-term fix.
4. **No optimistic locking on writes.** `UPDATE lobbies SET game_state = …` has no
   `WHERE version = n` guard → concurrent actions (two reactions in Coup, two
   joins, host kick vs self-leave) can overwrite each other. *Fix direction:*
   compare-and-swap via RPC (`UPDATE … WHERE game_state->>'version' = $n`).
5. **RLS posture unknown/unverifiable from the repo.** The anon key is public by
   design; document and test RLS policies for all three tables + storage.

## ⚠️ Logic & quality issues (OPEN — see TODO)

- **Spyfall stats are never recorded** (`GameType` lacks `spyfall`; no
  `updatePlayerStats` call in the hook) while the achievements page already
  renders a Spyfall card (permanently zero).
- **Flager stats** are recorded without `mode` (single/multi) and without
  `extraCount` (flags guessed), unlike Minesweeper — achievements show the flat
  legacy shape only.
- **Coup/Battleship durations are hardcoded** (900s / 600s) instead of measured.
- **Multi-client timer races**: in Coup every non-passed client fires
  `skipTurn()` at deadline; in Spyfall every client fires `endGame('spy','time')`
  — duplicate writes are mostly idempotent but can produce double logs/lost votes.
- **Spyfall round timer keeps running during voting** — a vote can be aborted by
  the timer expiring mid-vote.
- **Coup join-by-URL doesn't work** (only `/play` adds Coup players; the Coup page
  has no `initGame` self-join like the other four games — a direct link makes you
  a spectator).
- **Spyfall `GuideModal` is dead code** and references a non-existent `t.guide`
  key (would crash if ever rendered).
- **Winner identified by display name** in Coup/Minesweeper (`winner: name`) —
  ambiguous with duplicate nicknames; Battleship correctly uses the id.
- **`leaveGame(); window.location.href=…`** in Battleship/Minesweeper end screens
  doesn't await the async DB write — the leave may not persist before unload.
- **Settings "volume" slider** is cosmetic — no audio system consumes it, value
  not persisted.
- **No "forgot password" entry point** on the login form (reset only from
  Settings when already logged in).
- **ESLint debt**: 82 errors (mostly `@typescript-eslint/no-explicit-any` — many
  props typed `any`, e.g. the whole BattleshipGame props object) and 113 warnings
  (`react-hooks/exhaustive-deps`, `@next/next/no-img-element`, unused vars).
- **npm audit**: `npm audit fix` addresses most transitive issues; the Next.js
  middleware advisory (GHSA-26hh-7cqf-hhc6) needs a Next.js patch-version bump.

## ✅ What is in good shape

- Consistent hook architecture across all five games (fetch → subscribe →
  version-guarded merge → optimistic update) — easy to learn, easy to extend.
- Defensive coding around the players array/record split; legacy stats format
  migrated on the fly.
- First-click safety + iterative flood fill in Minesweeper (no stack overflow on
  100×100 boards).
- Server-authoritative *timestamps* (`turnDeadline`, `roundStartTime`) keep
  timers in sync without a server.
- Presence-based auto-kick with reconnect grace period.
- Clean localization pattern (RU/EN dictionaries per component).
- No secrets in the runtime bundle after the env fix; `.gitignore` correct.

## Method

Every file under `src/` was read in full; findings were verified against the
call sites (e.g. the Minesweeper dead branch traced through all four callers).
Fixes were applied only where the change is small, local and provably safe;
everything requiring schema changes, migrations or design decisions went to
[TODO.md](../TODO.md).
