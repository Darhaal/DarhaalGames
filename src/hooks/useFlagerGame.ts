import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FlagerState, FlagerPlayerState } from '@/types/flager';
import { COUNTRY_CODES } from '@/data/flager/countries';
import { updatePlayerStats } from '@/lib/playerStats';
import { useLobbySync } from '@/hooks/core/useLobbySync';
import { calcFlagerPoints } from '@/lib/gameLogic/flager';

// DEFENSIVE: players must be an array (broken shapes have been seen in the DB)
const normalizeFlager = (state: FlagerState): FlagerState => {
  if (!state.players || !Array.isArray(state.players)) {
    return { ...state, players: [] };
  }
  return state;
};

const generateFlags = (count: number): string[] => {
  const shuffled = [...COUNTRY_CODES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Delay before the round starts (ms)
const START_DELAY = 3000;

export function useFlagerGame(lobbyId: string | null, userId: string | undefined) {
  const {
    gameState, setGameState, gameStateRef,
    roomMeta, loading, lobbyDeleted,
    updateState, deleteLobby
  } = useLobbySync<FlagerState>({
    lobbyId,
    userId,
    channelPrefix: 'lobby-flager',
    normalize: normalizeFlager,
    // Preserve local progress when the server lags behind (latency hiding)
    mergeIncoming: (prev, incoming) => {
      const prevVersion = prev?.version || 0;
      const newVersion = incoming.version || 0;
      if (prev && newVersion < prevVersion) return prev;

      if (prev && userId && incoming.status === 'playing') {
        if (prev.currentRoundIndex !== incoming.currentRoundIndex) return incoming;

        const myPrev = prev.players.find(pl => pl.id === userId);
        const myIncoming = incoming.players.find(pl => pl.id === userId);

        if (myPrev && myIncoming) {
          if ((myPrev.guesses?.length || 0) > (myIncoming.guesses?.length || 0) || (myPrev.score || 0) > (myIncoming.score || 0)) {
            return { ...incoming, players: incoming.players.map(pl => pl.id === userId ? myPrev : pl) };
          }
        }
      }
      return incoming;
    }
  });

  // --- ACTIONS ---

  const initGame = async (userProfile: { name: string; avatarUrl: string }) => {
    if (!userId || !lobbyId) return;

    // Fetch fresh state to avoid overwriting
    const { data } = await supabase.from('lobbies').select('game_state').eq('id', lobbyId).single();
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
    const { data } = await supabase.from('lobbies').select('game_state').eq('id', lobbyId).single();
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

  // Both players answer at the same moment constantly, and each only touches
  // their own entry — written as a function of current state so a collision is
  // rebuilt on fresh state instead of costing someone their answer.
  const makeGuess = async (guessCode: string) => {
    if (!userId) return;
    await updateState((current) => {
      if (current.status !== 'playing') return null;
      if (Date.now() < current.roundStartTime) return null;
      if (!current.players || !Array.isArray(current.players)) return null;

      const player = current.players.find(p => p.id === userId);
      if (!player || player.hasFinishedRound) return null;

      const targetFlag = current.targetChain[current.currentRoundIndex].toLowerCase();
      const guess = guessCode.toLowerCase();

      const newState: FlagerState = JSON.parse(JSON.stringify(current));
      if (!newState.players || !Array.isArray(newState.players)) newState.players = [];

      const pIndex = newState.players.findIndex(p => p.id === userId);
      if (pIndex === -1) return null;
      const pState = newState.players[pIndex];

      if (!pState.guesses) pState.guesses = [];
      if (!pState.guesses.includes(guess)) {
          pState.guesses.push(guess);
      }

      const isCorrect = guess === targetFlag;
      const attemptsUsed = pState.guesses.length;

      if (isCorrect) {
          const timeTaken = (Date.now() - (current.roundStartTime || Date.now())) / 1000;
          const points = calcFlagerPoints(attemptsUsed, timeTaken);

          pState.score = (pState.score || 0) + points;
          pState.roundScore = points;
          pState.hasFinishedRound = true;
      } else if (attemptsUsed >= 10) {
          pState.hasFinishedRound = true;
          pState.roundScore = 0;
      }

      checkRoundEnd(newState, targetFlag);
      return newState;
    });
  };

  const handleTimeout = async () => {
    if (!userId) return;
    await updateState((current) => {
      if (current.status !== 'playing') return null;
      if (!current.players || !Array.isArray(current.players)) return null;

      const player = current.players.find(p => p.id === userId);
      if (!player || player.hasFinishedRound) return null;

      if (!current.targetChain || current.targetChain.length <= current.currentRoundIndex) return null;
      const targetFlag = current.targetChain[current.currentRoundIndex].toLowerCase();

      const newState: FlagerState = JSON.parse(JSON.stringify(current));
      if (!newState.players || !Array.isArray(newState.players)) newState.players = [];

      const pIndex = newState.players.findIndex(p => p.id === userId);
      if (pIndex === -1) return null;
      const pState = newState.players[pIndex];

      pState.hasFinishedRound = true;
      pState.roundScore = 0;

      checkRoundEnd(newState, targetFlag);
      return newState;
    });
  };

  const readyNextRound = async () => {
    if (!lobbyId || !userId) return;

    const { data } = await supabase.from('lobbies').select('game_state').eq('id', lobbyId).single();
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
     const currentGs = gameStateRef.current;
     if (!lobbyId || !userId || !currentGs) return;

     // A finished match is a record, not live state: leaving must not rewrite
     // the results the other players are still looking at. Just walk away —
     // the page navigates us out.
     if (currentGs.status === 'finished') return;

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
         await deleteLobby();
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
                  // Mode and flags-guessed count — parity with Minesweeper statistics
                  const mode = gameState.players.length > 1 ? 'multi' as const : 'single' as const;
                  const flagsGuessed = (me.history || []).filter(h => h.isCorrect).length;

                  updatePlayerStats(userId, {
                      gameType: 'flager',
                      result: isWinner ? 'win' : 'loss',
                      durationSeconds: duration,
                      mode: mode,
                      extraCount: flagsGuessed
                  });
              }
          }
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once when the match finishes; adding gameState.players would re-record stats
  }, [gameState?.status, userId, lobbyDeleted]);

  return {
      gameState, roomMeta, loading, lobbyDeleted,
      initGame, startGame, makeGuess, handleTimeout, readyNextRound, leaveGame
  };
}