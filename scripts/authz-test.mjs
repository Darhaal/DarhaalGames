/**
 * End-to-end authorization test against the live database, driven through the
 * public anon key exactly as the browser would.
 *
 * Two throwaway guest sessions are created; guest B attempts to tamper with
 * guest A's lobby. Real lobbies are never targeted, and both guests are
 * deleted at the end using the service_role key (profiles and player_stats
 * follow via ON DELETE CASCADE).
 *
 * Run from the project root:  node scripts/authz-test.mjs
 * Exits non-zero if any check fails, so it can gate a deploy.
 */
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((l) => l && !l.trimStart().startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const client = () => createClient(URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } });

let failures = 0;
const pass = (label, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(52)} ${detail}`);
};

const code = () => Array.from({ length: 6 }, () =>
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('');

const A = client();
const B = client();
const { data: aAuth } = await A.auth.signInAnonymously();
const { data: bAuth } = await B.auth.signInAnonymously();
const aId = aAuth.user.id;
const bId = bAuth.user.id;
console.log('guest A:', aId.slice(0, 8), ' guest B:', bId.slice(0, 8), '\n');

const baseState = {
  players: [{ id: aId, name: 'A', isHost: true }],
  status: 'waiting', version: 1, gameType: 'coup', lastActionTime: Date.now()
};

// --- A creates a lobby in its own name ---
const { data: lobby, error: insErr } = await A.from('lobbies')
  .insert({ code: code(), name: 'authz-test', host_id: aId, is_private: false, status: 'waiting', game_state: baseState })
  .select('id').single();
pass('A can create a lobby in its own name', !insErr && !!lobby, insErr?.message ?? '');
if (!lobby) process.exit(1);

// --- a bare .select() means `*`, which needs SELECT on the revoked password
//     column. This is a real regression that shipped once: the create page
//     used .select() and every lobby creation failed with 42501. Keep the
//     constraint asserted so nobody reintroduces the star.
{
  const { error } = await A.from('lobbies')
    .insert({ code: code(), name: 'star-select', host_id: aId, is_private: false, status: 'waiting', game_state: baseState })
    .select().single();
  // INSERT ... RETURNING * is one statement, so the privilege failure rolls
  // the insert back too — no stray row to clean up.
  pass('a bare .select() on lobbies is denied (use columns)', error?.code === '42501',
    error ? (error.code ?? '') : 'STAR SELECT SUCCEEDED — password may be readable');
}

// --- B tries to create a lobby impersonating A ---
{
  const { error } = await B.from('lobbies')
    .insert({ code: code(), name: 'spoof', host_id: aId, is_private: false, status: 'waiting', game_state: baseState });
  pass('B cannot create a lobby owned by A', !!error, error ? (error.code ?? '') : 'INSERT SUCCEEDED');
}

// --- B tries to delete A's lobby directly ---
{
  const { error } = await B.from('lobbies').delete().eq('id', lobby.id);
  const { data: still } = await A.from('lobbies').select('id').eq('id', lobby.id).maybeSingle();
  pass('B cannot DELETE A\'s lobby directly', !!still, error ? (error.code ?? '') : (still ? 'blocked, row intact' : 'ROW DESTROYED'));
}

// --- B tries to rewrite A's game_state directly ---
{
  const { error } = await B.from('lobbies').update({ game_state: { hacked: true } }).eq('id', lobby.id);
  const { data: row } = await A.from('lobbies').select('game_state').eq('id', lobby.id).single();
  const intact = row?.game_state?.hacked === undefined;
  pass('B cannot rewrite A\'s game_state', intact, error ? (error.code ?? '') : (intact ? 'blocked' : 'STATE OVERWRITTEN'));
}

// --- B tries to read the password column ---
{
  const { error } = await B.from('lobbies').select('password').limit(1);
  pass('B cannot read lobbies.password', !!error, error?.code ?? 'READABLE');
}

// --- B calls leave_lobby on a room it does not belong to ---
{
  const { data, error } = await B.rpc('leave_lobby', { p_lobby_id: lobby.id });
  const { data: still } = await A.from('lobbies').select('id').eq('id', lobby.id).maybeSingle();
  pass('leave_lobby refuses a non-participant', data === false && !!still, error?.message ?? `returned ${data}`);
}

// --- A (the host) closes its own room ---
{
  const { data, error } = await A.rpc('leave_lobby', { p_lobby_id: lobby.id });
  const { data: gone } = await A.from('lobbies').select('id').eq('id', lobby.id).maybeSingle();
  pass('leave_lobby lets the host close the room', data === true && !gone, error?.message ?? `returned ${data}`);
}

// --- clean up: remove both throwaway guests ---
// profiles and player_stats follow via ON DELETE CASCADE.
const admin = createClient(URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});
for (const id of [aId, bId]) {
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) console.log(`  cleanup failed for ${id}: ${error.message}`);
}
console.log('\ntest guests removed.');

if (failures > 0) {
  console.error(`\n${failures} authorization check(s) FAILED`);
  process.exit(1);
}
console.log('all authorization checks passed.');
