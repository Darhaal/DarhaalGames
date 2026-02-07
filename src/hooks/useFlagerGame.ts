import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { FlagerState, FlagerPlayerState } from '@/types/flager';
import { COUNTRY_CODES } from '@/data/flager/countries';
import { updatePlayerStats } from '@/lib/playerStats';

const generateFlags = (count: number): string[] => {
  const shuffled = [...COUNTRY_CODES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Задержка перед стартом раунда (в мс)
const START_DELAY = 3000;

export function useFlagerGame(lobbyId: string | null, userId: string | undefined) {
  const [gameState, setGameState] = useState<FlagerState | null>(null);
  const [roomMeta, setRoomMeta] = useState<{ name: string; code: string; isHost: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [lobbyDeleted, setLobbyDeleted] = useState(false);

  const stateRef = useRef<{ lobbyId: string | null; userId: string | undefined; gameState: FlagerState | null }>({
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
        if (data.game_state) {
            const safeState = data.game_state;
            // DEFENSIVE CODING: Ensure players is always an array
            if (!safeState.players || !Array.isArray(safeState.players)) {
                safeState.players = [];
            }
            setGameState(safeState);
        }
      } else {
        setGameState(null);
        setLobbyDeleted(true);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [lobbyId, userId]);

  useEffect(() => {
    if (!lobbyId) return;
    fetchLobbyState();

    const ch = supabase.channel(`lobby-flager:${lobbyId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `id=eq.${lobbyId}` },
      (payload) => {
          if (payload.new.game_state) {
            setGameState(prev => {
                const incoming = payload.new.game_state as FlagerState;

                // DEFENSIVE: Fix incoming data structure if corrupted
                if (!incoming.players || !Array.isArray(incoming.players)) {
                    incoming.players = [];
                }

                const prevVersion = prev?.version || 0;
                const newVersion = incoming.version || 0;

                // Optimistic update conflict resolution
                if (prev && newVersion < prevVersion) return prev;

                // Preserve local optimistic updates if version matches but we have more local info
                if (prev && userId && incoming.status === 'playing') {
                    if (prev.currentRoundIndex !== incoming.currentRoundIndex) {
                        return incoming;
                    }

                    const myPrev = prev.players.find(p => p.id === userId);
                    const myIncoming = incoming.players.find(p => p.id === userId);

                    if (myPrev && myIncoming) {
                        // Keep local guesses if they are ahead of server (latency hiding)
                        if ((myPrev.guesses?.length || 0) > (myIncoming.guesses?.length || 0) || (myPrev.score || 0) > (myIncoming.score || 0)) {
                            const mergedPlayers = incoming.players.map(p =>
                                p.id === userId ? myPrev : p
                            );
                            return { ...incoming, players: mergedPlayers };
                        }
                    }
                }
                return incoming;
            });
          }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'lobbies', filter: `id=eq.${lobbyId}` },
      () => {
          setGameState(null);
          setLobbyDeleted(true);
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [lobbyId, fetchLobbyState, userId]);

  const updateState = async (newState: FlagerState) => {
    newState.version = (newState.version || 0) + 1;
    newState.lastActionTime = Date.now();
    setGameState(newState);

    if (stateRef.current.lobbyId) {
       await supabase.from('lobbies').update({
           game_state: newState,
           status: newState.status
       }).eq('id', stateRef.current.lobbyId);
    }
  };

  // --- ACTIONS ---

  const initGame = async (userProfile: { name: string; avatarUrl: string }) => {
    if (!userId || !stateRef.current.lobbyId) return;

    // Fetch fresh state to avoid overwriting
    const { data } = await supabase.from('lobbies').select('game_state').eq('id', stateRef.current.lobbyId).single();
    const currentState = data?.game_state as FlagerState;
    if (!currentState) return;

    // Fix players array if broken in DB
    if (!currentState.players || !Array.isArray(currentState.players)) currentState.players = [];

    if (!currentState.players.find(p => p.id === userId)) {
      if (currentState.status !== 'waiting') return;

      const newState = JSON.parse(JSON.stringify(currentState)) as FlagerState;
      const isFirst = newState.players.length === 0;

      newState.players.push({
          id: userId,
          name: userProfile.name,
          avatarUrl: userProfile.avatarUrl,
          isHost: isFirst,
          score: 0,
          guesses: [],
          hasFinishedRound: false,
          roundScore: 0,
          history: [],
          isReadyForNextRound: false
      });

      await updateState(newState);
    } else {
        // Just update local state if already joined
        setGameState(currentState);
    }
  };

  const startGame = async () => {
    const { data } = await supabase.from('lobbies').select('game_state').eq('id', stateRef.current.lobbyId).single();
    const currentGs = data?.game_state as FlagerState;
    if (!currentGs) return;

    if (!currentGs.players || !Array.isArray(currentGs.players)) currentGs.players = [];

    const rounds = currentGs.settings.totalRounds || 5;
    const flags = generateFlags(rounds);

    const newState: FlagerState = {
      ...currentGs,
      status: 'playing',
      targetChain: flags,
      currentRoundIndex: 0,
      roundStartTime: Date.now() + START_DELAY,
      players: currentGs.players.map(p => ({
          ...p,
          guesses: [],
          hasFinishedRound: false,
          roundScore: 0,
          score: 0,
          history: [],
          isReadyForNextRound: false
      })),
      notifications: []
    };
    await updateState(newState);
  };

  const checkRoundEnd = (newState: FlagerState, targetFlag: string) => {
      if (!newState.players || newState.players.length === 0) return;

      const allFinished = newState.players.every(p => p.hasFinishedRound);
      if (allFinished) {
          newState.players.forEach(p => {
               const lastGuess = p.guesses && p.guesses.length > 0 ? p.guesses[p.guesses.length - 1] : '';
               const wasCorrect = lastGuess === targetFlag && p.roundScore > 0;

               if (!p.history) p.history = [];
               p.history.push({
                   flagCode: targetFlag,
                   isCorrect: wasCorrect,
                   attempts: p.guesses ? p.guesses.length : 0,
                   points: p.roundScore
               });
          });
          newState.status = 'round_end';
      }
  };

  const makeGuess = async (guessCode: string) => {
    const currentGs = stateRef.current.gameState;
    if (!currentGs || !userId || currentGs.status !== 'playing') return;

    const now = Date.now();
    if (now < currentGs.roundStartTime) return;

    // Safety checks
    if (!currentGs.players || !Array.isArray(currentGs.players)) return;

    const player = currentGs.players.find(p => p.id === userId);
    if (!player || player.hasFinishedRound) return;

    const targetFlag = currentGs.targetChain[currentGs.currentRoundIndex].toLowerCase();
    const guess = guessCode.toLowerCase();

    const newState: FlagerState = JSON.parse(JSON.stringify(currentGs));
    if (!newState.players || !Array.isArray(newState.players)) newState.players = [];

    const pIndex = newState.players.findIndex(p => p.id === userId);
    if (pIndex === -1) return;
    const pState = newState.players[pIndex];

    if (!pState.guesses) pState.guesses = [];
    if (!pState.guesses.includes(guess)) {
        pState.guesses.push(guess);
    }

    const isCorrect = guess === targetFlag;
    const attemptsUsed = pState.guesses.length;

    if (isCorrect) {
        const timeTaken = (Date.now() - (currentGs.roundStartTime || Date.now())) / 1000;
        const baseScore = 1000;
        const guessPenalty = (attemptsUsed - 1) * 50;
        const timePenalty = Math.floor(timeTaken * 10);

        const points = Math.max(10, baseScore - guessPenalty - timePenalty);

        pState.score = (pState.score || 0) + points;
        pState.roundScore = points;
        pState.hasFinishedRound = true;
    } else if (attemptsUsed >= 10) {
        pState.hasFinishedRound = true;
        pState.roundScore = 0;
    }

    checkRoundEnd(newState, targetFlag);
    await updateState(newState);
  };

  const handleTimeout = async () => {
    const currentGs = stateRef.current.gameState;
    if (!currentGs || !userId || currentGs.status !== 'playing') return;
    if (!currentGs.players || !Array.isArray(currentGs.players)) return;

    const player = currentGs.players.find(p => p.id === userId);
    if (!player || player.hasFinishedRound) return;

    const newState: FlagerState = JSON.parse(JSON.stringify(currentGs));
    if (!newState.players || !Array.isArray(newState.players)) newState.players = [];

    const pIndex = newState.players.findIndex(p => p.id === userId);
    if (pIndex === -1) return;
    const pState = newState.players[pIndex];

    // Ensure targetChain exists
    if (!currentGs.targetChain || currentGs.targetChain.length <= currentGs.currentRoundIndex) return;
    const targetFlag = currentGs.targetChain[currentGs.currentRoundIndex].toLowerCase();

    pState.hasFinishedRound = true;
    pState.roundScore = 0;

    checkRoundEnd(newState, targetFlag);
    await updateState(newState);
  };

  const readyNextRound = async () => {
    if (!stateRef.current.lobbyId || !userId) return;

    const { data } = await supabase.from('lobbies').select('game_state').eq('id', stateRef.current.lobbyId).single();
    const currentGs = data?.game_state as FlagerState;

    if (!currentGs || currentGs.status !== 'round_end') return;
    if (!currentGs.players || !Array.isArray(currentGs.players)) currentGs.players = [];

    const newState: FlagerState = JSON.parse(JSON.stringify(currentGs));
    const pIndex = newState.players.findIndex(p => p.id === userId);
    if (pIndex !== -1) {
        newState.players[pIndex].isReadyForNextRound = true;
    }

    const allReady = newState.players.every(p => p.isReadyForNextRound);
    if (allReady) {
        if (newState.currentRoundIndex >= newState.targetChain.length - 1) {
            newState.status = 'finished';
        } else {
            newState.status = 'playing';
            newState.currentRoundIndex++;
            newState.roundStartTime = Date.now() + START_DELAY;
            newState.players.forEach(p => {
                p.guesses = [];
                p.hasFinishedRound = false;
                p.roundScore = 0;
                p.isReadyForNextRound = false;
            });
        }
    }

    await updateState(newState);
  };

  const leaveGame = async () => {
     const currentGs = stateRef.current.gameState;
     if (!lobbyId || !userId || !currentGs) return;

     const newState = JSON.parse(JSON.stringify(currentGs));
     if (!newState.players || !Array.isArray(newState.players)) newState.players = [];

     const leavingPlayer = newState.players.find((p: FlagerPlayerState) => p.id === userId);

     if (!leavingPlayer) return;

     const wasHost = leavingPlayer.isHost;

     if (!newState.notifications) newState.notifications = [];
     newState.notifications.push({
         id: Date.now(),
         type: 'leave',
         message: {
             ru: `${leavingPlayer.name} покинул игру`,
             en: `${leavingPlayer.name} left the game`
         }
     });
     if (newState.notifications.length > 3) newState.notifications.shift();

     newState.players = newState.players.filter((p: FlagerPlayerState) => p.id !== userId);

     if (newState.players.length === 0) {
         await supabase.from('lobbies').delete().eq('id', lobbyId);
         setGameState(null);
         setLobbyDeleted(true);
     } else {
         if (wasHost && newState.players.length > 0) {
            newState.players[0].isHost = true;
         }
         await updateState(newState);
     }
  };

  useEffect(() => {
      if (gameState?.status === 'finished' && userId && !lobbyDeleted) {
          if (gameState.players && Array.isArray(gameState.players)) {
              const me = gameState.players.find(p => p.id === userId);
              if (me) {
                  const sorted = [...gameState.players].sort((a, b) => b.score - a.score);
                  const isWinner = sorted[0].id === userId;
                  const duration = (gameState.targetChain.length * (gameState.settings.roundDuration || 60));

                  updatePlayerStats(userId, {
                      gameType: 'flager',
                      result: isWinner ? 'win' : 'loss',
                      durationSeconds: duration
                  });
              }
          }
      }
  }, [gameState?.status, userId, lobbyDeleted]);

  return {
      gameState, roomMeta, loading, lobbyDeleted,
      initGame, startGame, makeGuess, handleTimeout, readyNextRound, leaveGame
  };
}