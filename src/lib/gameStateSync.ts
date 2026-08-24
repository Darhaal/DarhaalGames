import { supabase } from '@/lib/supabase';

interface WriteResult {
  /** The new state is in the database. */
  ok: boolean;
  /**
   * The write lost a race — someone else wrote first. Distinct from a hard
   * failure: a conflict is worth recomputing and retrying, an error is not.
   */
  conflict: boolean;
}

/** Version-conflict event — AppToaster shows a subtle notification */
export const SYNC_CONFLICT_EVENT = 'dg:sync-conflict';

/** Tell the user their action was dropped. Exported for the retry path. */
export function notifyConflict() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SYNC_CONFLICT_EVENT));
  }
}

/**
 * game_state write with optimistic locking (compare-and-swap).
 *
 * Calls the `update_game_state` RPC (see supabase/migrations/..._v2_security.sql):
 * the write succeeds only when the DB version equals the expected one (version - 1),
 * which prevents two players' concurrent actions from clobbering each other.
 *
 * There is deliberately no fallback to a plain UPDATE. Clients hold no write
 * privilege on `game_state` (see the v2.1 hardening migration), so the old
 * fallback could not succeed — and because it reported `usedCas: false`, the
 * caller read a hard failure as a completed write and dropped the player's
 * action without a word. An RPC error is now surfaced as what it is.
 */
export async function writeGameState(
  lobbyId: string,
  newState: { version?: number; status?: string } & Record<string, unknown>,
  options?: {
    hostId?: string;
    /**
     * Suppress the conflict toast. Set when the caller intends to recompute
     * against fresh state and retry — a conflict that is about to be resolved
     * silently is not something to bother the player with.
     */
    silent?: boolean;
  }
): Promise<WriteResult> {
  const expectedVersion = (newState.version || 1) - 1;

  const { data, error } = await supabase.rpc('update_game_state', {
    p_lobby_id: lobbyId,
    p_expected_version: expectedVersion,
    p_new_state: newState,
    p_status: newState.status || 'waiting'
  });

  if (error) {
    // Not a race — the write cannot go through at all. Retrying is pointless,
    // so tell the player rather than losing the action quietly.
    console.error('game_state write failed:', error.message);
    if (!options?.silent) notifyConflict();
    return { ok: false, conflict: false };
  }

  // data === true — written; false — the expected version no longer matches
  if (data === true) {
    if (options?.hostId) {
      // host_id is synced by a separate lightweight update (host change is rare)
      supabase.from('lobbies').update({ host_id: options.hostId }).eq('id', lobbyId).then(() => {});
    }
    return { ok: true, conflict: false };
  }

  if (!options?.silent) notifyConflict();
  return { ok: false, conflict: true };
}
