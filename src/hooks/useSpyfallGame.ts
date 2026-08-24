import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SpyfallState, SpyfallPlayer } from '@/types/spyfall';
import { SPYFALL_PACKS } from '@/data/spyfall/locations';
import { updatePlayerStats } from '@/lib/playerStats';
import { useLobbySync } from '@/hooks/core/useLobbySync';

// Module-level helper: sidesteps the react-compiler purity heuristic
// (Date.now inside event handlers is a legitimate use)
const now = () => Date.now();

export function useSpyfallGame(lobbyId: string | null, userId: string | undefined) {
  const {
    gameState, setGameState, gameStateRef,
    roomMeta, loading, lobbyDeleted,
    updateState, deleteLobby
  } = useLobbySync<SpyfallState>({
    lobbyId,
    userId,
    channelPrefix: 'lobby-spyfall',
    touchLastAction: false
  });

  // --- LOGIC ---

  const startGame = async () => {
      const currentGs = gameStateRef.current;
      if (!currentGs) return;

      const newState: SpyfallState = JSON.parse(JSON.stringify(currentGs));

      // 1. Take locations from the selected pack
      const packId = newState.settings.packId || 'standard';
      const selectedPack = SPYFALL_PACKS.find(p => p.id === packId) || SPYFALL_PACKS[0];
      const availableLocations = selectedPack.locations;

      // 2. Pick a location
      const location = availableLocations[Math.floor(Math.random() * availableLocations.length)];
      newState.currentLocationId = location.id;
      newState.locationList = availableLocations.map(l => l.id);

      // 3. Pick the spy
      const indices = newState.players.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      const spyRealIndex = indices[0];

      // 4. Roles
      const rolesShuffled = [...location.roles].sort(() => 0.5 - Math.random());

      newState.players = newState.players.map((p, idx) => {
          const isSpy = idx === spyRealIndex;
          const roleObj = rolesShuffled[idx % rolesShuffled.length];
          const roleString = JSON.stringify(roleObj.name);

          return {
              ...p,
              isSpy,
              role: isSpy ? null : roleString,
              isReady: false,
              hasNominated: false
          };
      });

      newState.status = 'playing';
      newState.startTime = now();
      newState.winner = null;
      newState.nomination = null;
      newState.notifications = [];

      await updateState(newState);
  };

  const startNomination = async (targetId: string) => {
      const currentGs = gameStateRef.current;
      if (!currentGs || !userId) return;

      const newState: SpyfallState = JSON.parse(JSON.stringify(currentGs));
      const target = newState.players.find(p => p.id === targetId);
      const author = newState.players.find(p => p.id === userId);

      if (!target || !author) return;
      if (author.hasNominated) return;

      author.hasNominated = true;

      newState.status = 'voting';
      newState.nomination = {
          authorId: userId,
          targetId: targetId,
          votes: { [userId]: true },
          startTime: now()
      };

      await updateState(newState);
  };

  const vote = async (agree: boolean) => {
      const currentGs = gameStateRef.current;
      if (!currentGs || !userId || !currentGs.nomination) return;

      const newState: SpyfallState = JSON.parse(JSON.stringify(currentGs));
      newState.nomination!.votes[userId] = agree;

      const voters = newState.players.filter(p => p.id !== newState.nomination!.targetId);
      const totalVotes = Object.keys(newState.nomination!.votes).length;

      if (totalVotes === voters.length) {
          const votesFor = Object.values(newState.nomination!.votes).filter(v => v === true).length;

          if (votesFor === voters.length) {
              const target = newState.players.find(p => p.id === newState.nomination!.targetId);
              if (target?.isSpy) {
                  endGame('locals', 'spy_caught', newState); // Pass the state so the votes are not lost
                  return; // endGame calls updateState itself
              } else {
                  endGame('spy', 'innocent_killed', newState);
                  return;
              }
          } else {
              newState.status = 'playing';
              // Compensate the pause: shift the round start by the voting duration
              // so voting does not eat into the round timer
              const votingDuration = now() - (newState.nomination?.startTime || now());
              newState.startTime += Math.max(0, votingDuration);
              newState.nomination = null;
              newState.notifications.push({
                  id: now(),
                  msg: 'Голосование отклонено',
                  type: 'info'
              });
          }
      }

      await updateState(newState);
  };

  type WinReason = SpyfallState['winReason'];

  const endGame = async (winner: 'spy' | 'locals', reason?: string, stateOverride?: SpyfallState) => {
      const currentGs = stateOverride || gameStateRef.current;
      if (!currentGs) return;

      const newState: SpyfallState = JSON.parse(JSON.stringify(currentGs));
      newState.status = 'finished';
      newState.winner = winner;
      newState.winReason = reason as WinReason;

      // --- SCORING ---
      newState.players = newState.players.map(p => {
          let points = p.score || 0;

          if (winner === 'spy') {
              // Spy won: +5 to the spy
              if (p.isSpy) points += 5;
          } else {
              // Locals won: +1 to every local
              if (!p.isSpy) {
                  points += 1;
                  // Bonus for a successful accusation: +1 to the nomination author
                  if (reason === 'spy_caught' && newState.nomination?.authorId === p.id) {
                      points += 1;
                  }
              }
          }
          return { ...p, score: points };
      });

      await updateState(newState);
  };

  const restartGame = async () => {
      const currentGs = gameStateRef.current;
      if (!currentGs) return;
      const newState: SpyfallState = {
          ...currentGs,
          status: 'waiting',
          currentLocationId: null,
          winner: null,
          nomination: null,
          players: currentGs.players.map(p => ({
              ...p,
              isSpy: false,
              role: null,
              isReady: true,
              hasNominated: false
              // Score persists across rounds!
          }))
      };
      await updateState(newState);
  };

  const leaveGame = async () => {
     const currentGs = gameStateRef.current;
     if (!lobbyId || !userId || !currentGs) return;

     // A finished match is a record, not live state: leaving must not rewrite
     // the results the other players are still looking at. Just walk away —
     // the page navigates us out.
     if (currentGs.status === 'finished') return;

     const newState = JSON.parse(JSON.stringify(currentGs));
     const leavingPlayer = newState.players.find((p: SpyfallPlayer) => p.id === userId);

     if (!leavingPlayer) return;

     if (newState.status === 'playing' || newState.status === 'voting') {
         if (leavingPlayer.isSpy) {
             // The spy left — locals win
             // Pass newState so the changes are preserved
             newState.players = newState.players.filter((p: SpyfallPlayer) => p.id !== userId);
             endGame('locals', 'spy_left', newState);
             return;
         } else {
             newState.notifications.push({
                 id: now(),
                 msg: `${leavingPlayer.name} покинул игру`,
                 type: 'alert'
             });
             newState.players = newState.players.filter((p: SpyfallPlayer) => p.id !== userId);
             if (newState.players.length < 3) {
                 endGame('spy', 'innocent_killed', newState); // Technical win
                 return;
             }
         }
     } else {
         newState.players = newState.players.filter((p: SpyfallPlayer) => p.id !== userId);
     }

     if (newState.players.length === 0) {
         await deleteLobby();
     } else {
         if (leavingPlayer.isHost && newState.players.length > 0) {
            newState.players[0].isHost = true;
         }
         await updateState(newState);
     }
  };

  const initGame = async (userProfile: { name: string; avatarUrl: string }) => {
    if (!userId || !lobbyId) return;
    const { data } = await supabase.from('lobbies').select('game_state').eq('id', lobbyId).single();
    const currentState = data?.game_state as SpyfallState;
    if (!currentState) return;

    if (!currentState.players.find(p => p.id === userId)) {
        if (currentState.status !== 'waiting') return;
        const newState = JSON.parse(JSON.stringify(currentState)) as SpyfallState;
        const isFirst = newState.players.length === 0;
        newState.players.push({
            id: userId,
            name: userProfile.name,
            avatarUrl: userProfile.avatarUrl,
            isHost: isFirst,
            isSpy: false,
            role: null,
            isReady: true,
            hasNominated: false,
            score: 0
        });
        await updateState(newState);
    } else {
        setGameState(currentState);
    }
  };

  // Record statistics when the round finishes:
  // a local wins when locals win, the spy wins when the spy side wins
  useEffect(() => {
      if (gameState?.status === 'finished' && userId && !lobbyDeleted && gameState.winner) {
          const me = gameState.players.find(p => p.id === userId);
          if (me) {
              const isWinner = (gameState.winner === 'spy' && me.isSpy) ||
                               (gameState.winner === 'locals' && !me.isSpy);
              const duration = gameState.startTime
                  ? Math.max(1, Math.round((now() - gameState.startTime) / 1000))
                  : (gameState.settings.roundDuration || 480);

              updatePlayerStats(userId, {
                  gameType: 'spyfall',
                  result: isWinner ? 'win' : 'loss',
                  durationSeconds: duration
              });
          }
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once when the match finishes; adding gameState.players would re-record stats
  }, [gameState?.status, gameState?.winner, userId, lobbyDeleted]);

  return {
      gameState, roomMeta, loading, lobbyDeleted,
      initGame, startGame, endGame, restartGame, leaveGame,
      startNomination, vote
  };
}