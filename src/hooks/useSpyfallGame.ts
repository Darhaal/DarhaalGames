import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { SpyfallState, SpyfallPlayer } from '@/types/spyfall';
import { SPYFALL_PACKS } from '@/data/spyfall/locations';

export function useSpyfallGame(lobbyId: string | null, userId: string | undefined) {
  const [gameState, setGameState] = useState<SpyfallState | null>(null);
  const [roomMeta, setRoomMeta] = useState<{ name: string; code: string; isHost: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [lobbyDeleted, setLobbyDeleted] = useState(false);

  const stateRef = useRef<{ lobbyId: string | null; userId: string | undefined; gameState: SpyfallState | null }>({
    lobbyId, userId, gameState: null
  });

  useEffect(() => {
    stateRef.current = { lobbyId, userId, gameState };
  }, [lobbyId, userId, gameState]);

  // --- SYNC ---
  const fetchLobbyState = useCallback(async () => {
    if (!lobbyId) return;
    try {
      const { data } = await supabase.from('lobbies').select('name, code, host_id, game_state').eq('id', lobbyId).single();
      if (data) {
        setRoomMeta({ name: data.name, code: data.code, isHost: data.host_id === userId });
        if (data.game_state) setGameState(data.game_state);
      } else {
        setGameState(null);
        setLobbyDeleted(true);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [lobbyId, userId]);

  useEffect(() => {
    if (!lobbyId) return;
    fetchLobbyState();

    const ch = supabase.channel(`lobby-spyfall:${lobbyId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `id=eq.${lobbyId}` },
      (payload) => {
          if (payload.new.game_state) {
            setGameState(prev => {
                const incoming = payload.new.game_state as SpyfallState;
                if (prev && (incoming.version || 0) < (prev.version || 0)) return prev;
                return incoming;
            });
          }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'lobbies', filter: `id=eq.${lobbyId}` },
      () => { setGameState(null); setLobbyDeleted(true); })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [lobbyId, fetchLobbyState]);

  const updateState = async (newState: SpyfallState) => {
    newState.version = (newState.version || 0) + 1;
    setGameState(newState);
    if (stateRef.current.lobbyId) {
       await supabase.from('lobbies').update({
           game_state: newState,
           status: newState.status
       }).eq('id', stateRef.current.lobbyId);
    }
  };

  // --- LOGIC ---

  const startGame = async () => {
      const currentGs = stateRef.current.gameState;
      if (!currentGs) return;

      const newState: SpyfallState = JSON.parse(JSON.stringify(currentGs));

      // 1. Берем локации из выбранного пака
      const packId = newState.settings.packId || 'standard';
      const selectedPack = SPYFALL_PACKS.find(p => p.id === packId) || SPYFALL_PACKS[0];
      const availableLocations = selectedPack.locations;

      // 2. Выбираем локацию
      const location = availableLocations[Math.floor(Math.random() * availableLocations.length)];
      newState.currentLocationId = location.id;
      newState.locationList = availableLocations.map(l => l.id);

      // 3. Выбираем шпиона
      const indices = newState.players.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      const spyRealIndex = indices[0];

      // 4. Роли
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
      newState.startTime = Date.now();
      newState.winner = null;
      newState.nomination = null;
      newState.notifications = [];

      await updateState(newState);
  };

  const startNomination = async (targetId: string) => {
      const currentGs = stateRef.current.gameState;
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
          startTime: Date.now()
      };

      await updateState(newState);
  };

  const vote = async (agree: boolean) => {
      const currentGs = stateRef.current.gameState;
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
                  endGame('locals', 'spy_caught', newState); // Передаем стейт, чтобы не потерять голоса
                  return; // endGame сам вызовет updateState
              } else {
                  endGame('spy', 'innocent_killed', newState);
                  return;
              }
          } else {
              newState.status = 'playing';
              newState.nomination = null;
              newState.notifications.push({
                  id: Date.now(),
                  msg: 'Голосование отклонено',
                  type: 'info'
              });
          }
      }

      await updateState(newState);
  };

  type WinReason = SpyfallState['winReason'];

  const endGame = async (winner: 'spy' | 'locals', reason?: string, stateOverride?: SpyfallState) => {
      const currentGs = stateOverride || stateRef.current.gameState;
      if (!currentGs) return;

      const newState: SpyfallState = JSON.parse(JSON.stringify(currentGs));
      newState.status = 'finished';
      newState.winner = winner;
      newState.winReason = reason as WinReason;

      // --- НАЧИСЛЕНИЕ ОЧКОВ ---
      newState.players = newState.players.map(p => {
          let points = p.score || 0;

          if (winner === 'spy') {
              // Шпион победил: +5 шпиону
              if (p.isSpy) points += 5;
          } else {
              // Мирные победили: +1 всем мирным
              if (!p.isSpy) {
                  points += 1;
                  // Бонус за удачное обвинение: +1 автору номинации
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
      const currentGs = stateRef.current.gameState;
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
              // Score сохраняется!
          }))
      };
      await updateState(newState);
  };

  const leaveGame = async () => {
     const currentGs = stateRef.current.gameState;
     if (!lobbyId || !userId || !currentGs) return;

     const newState = JSON.parse(JSON.stringify(currentGs));
     const leavingPlayer = newState.players.find((p: SpyfallPlayer) => p.id === userId);

     if (!leavingPlayer) return;

     if (newState.status === 'playing' || newState.status === 'voting') {
         if (leavingPlayer.isSpy) {
             // Шпион вышел - мирные выиграли
             // Передаем newState, чтобы сохранить изменения
             newState.players = newState.players.filter((p: SpyfallPlayer) => p.id !== userId);
             endGame('locals', 'spy_left', newState);
             return;
         } else {
             newState.notifications.push({
                 id: Date.now(),
                 msg: `${leavingPlayer.name} покинул игру`,
                 type: 'alert'
             });
             newState.players = newState.players.filter((p: SpyfallPlayer) => p.id !== userId);
             if (newState.players.length < 3) {
                 endGame('spy', 'innocent_killed', newState); // Техническая победа
                 return;
             }
         }
     } else {
         newState.players = newState.players.filter((p: SpyfallPlayer) => p.id !== userId);
     }

     if (newState.players.length === 0) {
         await supabase.from('lobbies').delete().eq('id', lobbyId);
         setGameState(null);
         setLobbyDeleted(true);
     } else {
         if (leavingPlayer.isHost && newState.players.length > 0) {
            newState.players[0].isHost = true;
         }
         await updateState(newState);
     }
  };

  const initGame = async (userProfile: { name: string; avatarUrl: string }) => {
    if (!userId || !stateRef.current.lobbyId) return;
    const { data } = await supabase.from('lobbies').select('game_state').eq('id', stateRef.current.lobbyId).single();
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

  return {
      gameState, roomMeta, loading, lobbyDeleted,
      initGame, startGame, endGame, restartGame, leaveGame,
      startNomination, vote
  };
}