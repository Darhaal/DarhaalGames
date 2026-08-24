import { supabase } from '@/lib/supabase';
import { MinesweeperState, MinesweeperPlayer } from '@/types/minesweeper';
import { updatePlayerStats } from '@/lib/playerStats';
import { useLobbySync } from '@/hooks/core/useLobbySync';
import { generateEmptyBoard, placeMines, openCellIterative, chordCell as chordCellLogic } from '@/lib/gameLogic/minesweeper';

const countMoves = (p: MinesweeperPlayer) => {
    let moves = 0;
    for (const r of p.board) for (const c of r) if (c.isOpen || c.isFlagged) moves++;
    return moves;
};

export function useMinesweeperGame(lobbyId: string | null, userId: string | undefined) {
  const {
    gameState, setGameState, gameStateRef,
    roomMeta, loading, lobbyDeleted,
    updateState, deleteLobby
  } = useLobbySync<MinesweeperState>({
    lobbyId,
    userId,
    channelPrefix: 'lobby-mines',
    // Preserve local board progress when the server lags (anti-lag),
    // but accept the server state on game end/timeout
    mergeIncoming: (prev, incoming) => {
      if (incoming.status === 'waiting') return incoming;

      const prevVersion = prev?.version || 0;
      const newVersion = incoming.version || 0;
      if (prev && newVersion < prevVersion && incoming.status === 'playing') return prev;

      if (prev && userId && incoming.status === 'playing') {
        const myPrev = prev.players[userId];
        const myIncoming = incoming.players[userId];

        if (myPrev && myIncoming && myPrev.status !== 'left') {
          if (countMoves(myPrev) > countMoves(myIncoming) && myIncoming.status === 'playing') {
            return { ...incoming, players: { ...incoming.players, [userId]: myPrev } };
          }
        }
      }
      return incoming;
    }
  });

  const handleGameEndCheck = (newState: MinesweeperState, player: MinesweeperPlayer) => {
      const currentTime = Math.floor((Date.now() - newState.startTime) / 1000);

      let opened = 0, correctlyFlagged = 0, totalFlagged = 0;
      const totalCells = newState.settings.width * newState.settings.height;

      player.board.forEach(row => row.forEach(cell => {
          if (cell.isOpen) opened++;
          if (cell.isFlagged) {
              totalFlagged++;
              if (cell.isMine) correctlyFlagged++;
          }
      }));

      const isWin = (opened === totalCells - newState.settings.minesCount) ||
                    (totalFlagged === newState.settings.minesCount && correctlyFlagged === newState.settings.minesCount);

      // IMPORTANT: all callers (revealCell/toggleFlag/chordCell/handleTimeout) invoke this
      // check only for a player who was 'playing' before the action. A 'lost' status here
      // therefore means the loss happened just now and must be processed.
      const playerCount = Object.keys(newState.players).length;
      const mode = playerCount > 1 ? 'multi' : 'single';

      if (isWin && player.status === 'playing') {
          player.status = 'won';
          player.score = currentTime;
          newState.status = 'finished';
          newState.winner = player.name;
          newState.winnerId = player.id;

          if (userId && player.id === userId) {
              updatePlayerStats(userId, {
                  gameType: 'minesweeper',
                  result: 'win',
                  durationSeconds: currentTime,
                  mode: mode,
                  extraCount: correctlyFlagged
              });
          }
      }

      if (player.status === 'lost') {
          player.score = currentTime;
          const active = Object.values(newState.players).filter(p => p.status === 'playing');
          if (active.length === 0) newState.status = 'finished';

          if (userId && player.id === userId) {
              updatePlayerStats(userId, {
                  gameType: 'minesweeper',
                  result: 'loss',
                  durationSeconds: currentTime,
                  mode: mode,
                  extraCount: correctlyFlagged
              });
          }
      }
  };

  const initGame = async (userProfile: { name: string; avatarUrl: string }) => {
    if (!userId || !lobbyId) return;

    const { data } = await supabase.from('lobbies').select('game_state').eq('id', lobbyId).single();
    const currentState = data?.game_state as MinesweeperState;
    if (!currentState) return;

    if (!currentState.players[userId]) {
      if (currentState.status !== 'waiting') return;

      const newState = JSON.parse(JSON.stringify(currentState)) as MinesweeperState;
      const isFirst = Object.keys(newState.players).length === 0;

      newState.players[userId] = {
          id: userId,
          name: userProfile.name,
          avatarUrl: userProfile.avatarUrl,
          isHost: isFirst,
          board: [],
          status: 'playing',
          minesLeft: newState.settings.minesCount,
          score: 0
      };

      await updateState(newState);
    } else {
        setGameState(currentState);
    }
  };

  const startGame = async () => {
    const currentGs = gameStateRef.current;
    if (!currentGs) return;

    const newState: MinesweeperState = JSON.parse(JSON.stringify(currentGs));
    newState.status = 'playing';
    newState.startTime = Date.now();
    newState.winner = null;

    Object.keys(newState.players).forEach(pid => {
        newState.players[pid].board = generateEmptyBoard(newState.settings.width, newState.settings.height);
        newState.players[pid].status = 'playing';
        newState.players[pid].minesLeft = newState.settings.minesCount;
        newState.players[pid].score = 0;
    });

    await updateState(newState);
  };

  // Every player owns their own board, but all boards live in one row behind a
  // single version counter — so two players clicking at the same moment used to
  // collide and one click was dropped. These actions are written as functions of
  // the current state so a conflict can be rebuilt on fresh state and retried.
  const revealCell = async (x: number, y: number) => {
    if (!userId) return;
    await updateState((current) => {
      if (current.status !== 'playing') return null;
      const newState: MinesweeperState = JSON.parse(JSON.stringify(current));
      const player = newState.players[userId];

      if (!player || player.status !== 'playing') return null;
      if (player.board[y][x].isOpen || player.board[y][x].isFlagged) return null;

      // Optimization note: a hasStarted flag on the player would avoid the full scan,
      // but this is fast on the client and kept for compatibility
      const isFirstMove = player.board.flat().every((c) => !c.isOpen);
      if (isFirstMove) {
          placeMines(player.board, newState.settings.width, newState.settings.height, newState.settings.minesCount, x, y);
      }

      const cell = player.board[y][x];

      if (cell.isMine) {
          cell.isOpen = true;
          player.status = 'lost';
          // Reveal all mines
          player.board.forEach((r) => r.forEach((c) => { if (c.isMine) c.isOpen = true; }));
      } else {
          // Iterative approach
          openCellIterative(player.board, x, y, newState.settings.width, newState.settings.height);
      }

      handleGameEndCheck(newState, player);
      return newState;
    });
  };

  const toggleFlag = async (x: number, y: number) => {
    if (!userId) return;
    await updateState((current) => {
      if (current.status !== 'playing') return null;
      const newState: MinesweeperState = JSON.parse(JSON.stringify(current));
      const player = newState.players[userId];

      if (!player || player.status !== 'playing') return null;
      const cell = player.board[y][x];
      if (cell.isOpen) return null; // nothing to toggle — no state write

      cell.isFlagged = !cell.isFlagged;
      player.minesLeft += cell.isFlagged ? -1 : 1;

      handleGameEndCheck(newState, player);
      return newState;
    });
  };

  const chordCell = async (x: number, y: number) => {
    if (!userId) return;
    await updateState((current) => {
      if (current.status !== 'playing') return null;
      const newState: MinesweeperState = JSON.parse(JSON.stringify(current));
      const player = newState.players[userId];

      if (!player || player.status !== 'playing') return null;

      const { changed, hitMine } = chordCellLogic(player.board, x, y, newState.settings.width, newState.settings.height);
      if (!changed) return null; // nothing opened — no state write

      if (hitMine) {
          player.status = 'lost';
          player.board.forEach((r) => r.forEach((c) => { if (c.isMine) c.isOpen = true; }));
      }
      handleGameEndCheck(newState, player);
      return newState;
    });
  };

  const handleTimeout = async () => {
    if (!userId) return;
    await updateState((current) => {
      if (current.status !== 'playing') return null;
      const newState: MinesweeperState = JSON.parse(JSON.stringify(current));
      const player = newState.players[userId];
      if (!player || player.status !== 'playing') return null;

      player.status = 'lost';
      player.board.forEach((r) => r.forEach((c) => { if (c.isMine) c.isOpen = true; }));
      handleGameEndCheck(newState, player);
      return newState;
    });
  };

  const leaveGame = async () => {
     const currentGs = gameStateRef.current;
     if (!lobbyId || !userId || !currentGs) return;

     // A finished match is a record, not live state: leaving must not rewrite
     // the results the other players are still looking at. Just walk away —
     // the page navigates us out.
     if (currentGs.status === 'finished') return;

     const newState: MinesweeperState = JSON.parse(JSON.stringify(currentGs));
     const wasHost = newState.players[userId]?.isHost;

     if (newState.status === 'waiting') {
         delete newState.players[userId];
     } else {
         if (newState.players[userId]) {
             newState.players[userId].status = 'left';
         }
     }

     const remainingActive = Object.values(newState.players).filter((p) => p.status !== 'left');

     if (remainingActive.length === 0) {
         await deleteLobby();
     } else {
         if (wasHost) {
             const nextHost = remainingActive[0];
             if (nextHost) newState.players[nextHost.id].isHost = true;
         }

         if (newState.status === 'playing') {
             const playing = remainingActive.filter((p: MinesweeperPlayer) => p.status === 'playing');
             if (playing.length === 0) {
                 newState.status = 'finished';
             }
         }

         await updateState(newState);
     }
  };

  return {
      gameState, roomMeta, loading, lobbyDeleted,
      initGame, startGame, revealCell, toggleFlag, chordCell, leaveGame, handleTimeout
  };
}