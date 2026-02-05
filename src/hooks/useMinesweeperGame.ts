import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { MinesweeperState, MinesweeperPlayer, Cell } from '@/types/minesweeper';
import { updatePlayerStats } from '@/lib/playerStats';

// --- ГЕНЕРАТОРЫ ---
const getNeighbors = (x: number, y: number, width: number, height: number) => {
  const neighbors = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) neighbors.push({ x: nx, y: ny });
    }
  }
  return neighbors;
};

const generateEmptyBoard = (width: number, height: number): Cell[][] => {
  const board: Cell[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({ x, y, isMine: false, isOpen: false, isFlagged: false, neighborCount: 0 });
    }
    board.push(row);
  }
  return board;
};

const placeMines = (board: Cell[][], width: number, height: number, minesCount: number, safeX: number, safeY: number) => {
  let minesPlaced = 0;
  const safeZone = new Set<string>();
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) safeZone.add(`${safeX + dx},${safeY + dy}`);

  let attempts = 0;
  while (minesPlaced < minesCount && attempts < width * height * 10) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    if (!board[y][x].isMine && !safeZone.has(`${x},${y}`)) {
      board[y][x].isMine = true;
      minesPlaced++;
    }
    attempts++;
  }

  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (!board[y][x].isMine) {
      const neighbors = getNeighbors(x, y, width, height);
      let count = 0;
      neighbors.forEach(n => { if (board[n.y][n.x].isMine) count++; });
      board[y][x].neighborCount = count;
    }
  }
};

const openCellRecursive = (board: Cell[][], x: number, y: number, width: number, height: number) => {
    if (x < 0 || x >= width || y < 0 || y >= height || board[y][x].isOpen || board[y][x].isFlagged) return;
    board[y][x].isOpen = true;
    if (board[y][x].neighborCount === 0) {
        const neighbors = getNeighbors(x, y, width, height);
        neighbors.forEach(n => openCellRecursive(board, n.x, n.y, width, height));
    }
};

export function useMinesweeperGame(lobbyId: string | null, userId: string | undefined) {
  const [gameState, setGameState] = useState<MinesweeperState | null>(null);
  const [roomMeta, setRoomMeta] = useState<{ name: string; code: string; isHost: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [lobbyDeleted, setLobbyDeleted] = useState(false);

  const stateRef = useRef<{ lobbyId: string | null; userId: string | undefined; gameState: MinesweeperState | null }>({
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

    const ch = supabase.channel(`lobby-mines:${lobbyId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'lobbies', filter: `id=eq.${lobbyId}` },
      (payload) => {
          if (payload.new.game_state) {
            setGameState(prev => {
                const incoming = payload.new.game_state as MinesweeperState;
                if (incoming.status === 'waiting') return incoming;

                const prevVersion = prev?.version || 0;
                const newVersion = incoming.version || 0;
                if (prev && newVersion < prevVersion) return prev;

                if (prev && userId && incoming.status === 'playing') {
                    const myPrev = prev.players[userId];
                    const myIncoming = incoming.players[userId];

                    if (myPrev && myIncoming && myPrev.status !== 'left') {
                        const countMoves = (p: MinesweeperPlayer) => {
                            let moves = 0;
                            for(let r of p.board) for(let c of r) if(c.isOpen || c.isFlagged) moves++;
                            return moves;
                        };
                        const localMoves = countMoves(myPrev);
                        const serverMoves = countMoves(myIncoming);

                        if (localMoves > serverMoves) {
                             return {
                                 ...incoming,
                                 players: { ...incoming.players, [userId]: myPrev }
                             };
                        }
                    }
                }
                return incoming;
            });
          }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'lobbies', filter: `id=eq.${lobbyId}` },
      () => { setGameState(null); setLobbyDeleted(true); })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [lobbyId, fetchLobbyState, userId]);

  const updateState = async (newState: MinesweeperState) => {
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

      // Переменная isWin теперь объявлена корректно
      const isWin = (opened === totalCells - newState.settings.minesCount) ||
                    (totalFlagged === newState.settings.minesCount && correctlyFlagged === newState.settings.minesCount);

      // Проверяем, чтобы не записать статистику дважды
      const isAlreadyEnded = player.status === 'won' || player.status === 'lost';

      // Определение режима игры для статистики
      const playerCount = Object.keys(newState.players).length;
      const isMulti = playerCount > 1;
      const mode = isMulti ? 'multi' : 'single';

      if (isWin && !isAlreadyEnded) {
          player.status = 'won';
          player.score = currentTime;
          newState.status = 'finished';
          newState.winner = player.name;

          // ЗАПИСЬ СТАТИСТИКИ (ПОБЕДА)
          if (userId && player.id === userId) {
              updatePlayerStats(userId, {
                  gameType: 'minesweeper',
                  result: 'win',
                  durationSeconds: currentTime,
                  mode: mode,
                  extraCount: correctlyFlagged // Передаем кол-во найденных мин
              });
          }
      }

      if (player.status === 'lost' && !isAlreadyEnded) {
          player.score = currentTime;
          const active = Object.values(newState.players).filter(p => p.status === 'playing');
          if (active.length === 0) newState.status = 'finished';

          // ЗАПИСЬ СТАТИСТИКИ (ПОРАЖЕНИЕ)
          if (userId && player.id === userId) {
              updatePlayerStats(userId, {
                  gameType: 'minesweeper',
                  result: 'loss',
                  durationSeconds: currentTime,
                  mode: mode,
                  extraCount: correctlyFlagged // Сохраняем сколько успел найти
              });
          }
      }
  };

  // --- ACTIONS ---

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
    const currentGs = stateRef.current.gameState;
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

  const revealCell = async (x: number, y: number) => {
      const currentGs = stateRef.current.gameState;
      if (!currentGs || !userId || currentGs.status !== 'playing') return;
      const newState = JSON.parse(JSON.stringify(currentGs));
      const player = newState.players[userId];

      if (!player || player.status !== 'playing') return;
      if (player.board[y][x].isOpen || player.board[y][x].isFlagged) return;

      const isFirstMove = player.board.flat().every((c:any) => !c.isOpen);
      if (isFirstMove) {
          placeMines(player.board, newState.settings.width, newState.settings.height, newState.settings.minesCount, x, y);
      }

      const cell = player.board[y][x];

      if (cell.isMine) {
          cell.isOpen = true;
          player.status = 'lost';
          player.board.forEach((r:any) => r.forEach((c:any) => { if (c.isMine) c.isOpen = true; }));
      } else {
          openCellRecursive(player.board, x, y, newState.settings.width, newState.settings.height);
      }

      handleGameEndCheck(newState, player);
      await updateState(newState);
  };

  const toggleFlag = async (x: number, y: number) => {
      const currentGs = stateRef.current.gameState;
      if (!currentGs || !userId || currentGs.status !== 'playing') return;
      const newState = JSON.parse(JSON.stringify(currentGs));
      const player = newState.players[userId];

      if (!player || player.status !== 'playing') return;
      const cell = player.board[y][x];

      if (!cell.isOpen) {
          cell.isFlagged = !cell.isFlagged;
          player.minesLeft += cell.isFlagged ? -1 : 1;
      }
      handleGameEndCheck(newState, player);
      await updateState(newState);
  };

  const chordCell = async (x: number, y: number) => {
      const currentGs = stateRef.current.gameState;
      if (!currentGs || !userId || currentGs.status !== 'playing') return;
      const newState = JSON.parse(JSON.stringify(currentGs));
      const player = newState.players[userId];

      if (!player || player.status !== 'playing') return;
      const cell = player.board[y][x];

      if (!cell.isOpen || cell.neighborCount === 0) return;

      const neighbors = getNeighbors(x, y, newState.settings.width, newState.settings.height);
      const flaggedCount = neighbors.reduce((acc, n) => acc + (player.board[n.y][n.x].isFlagged ? 1 : 0), 0);

      if (flaggedCount === cell.neighborCount) {
          let hitMine = false;
          neighbors.forEach(n => {
              const nCell = player.board[n.y][n.x];
              if (!nCell.isOpen && !nCell.isFlagged) {
                  if (nCell.isMine) {
                      hitMine = true;
                      nCell.isOpen = true;
                  } else {
                      openCellRecursive(player.board, n.x, n.y, newState.settings.width, newState.settings.height);
                  }
              }
          });

          if (hitMine) {
              player.status = 'lost';
              player.board.forEach((r:any) => r.forEach((c:any) => { if (c.isMine) c.isOpen = true; }));
          }
          handleGameEndCheck(newState, player);
          await updateState(newState);
      }
  };

  const handleTimeout = async () => {
      const currentGs = stateRef.current.gameState;
      if (!currentGs || !userId || currentGs.status !== 'playing') return;
      const newState = JSON.parse(JSON.stringify(currentGs));
      const player = newState.players[userId];

      if (player && player.status === 'playing') {
          player.status = 'lost';
          player.board.forEach((r:any) => r.forEach((c:any) => { if (c.isMine) c.isOpen = true; }));
          handleGameEndCheck(newState, player);
          await updateState(newState);
      }
  };

  const leaveGame = async () => {
     const currentGs = stateRef.current.gameState;
     if (!lobbyId || !userId || !currentGs) return;

     const newState = JSON.parse(JSON.stringify(currentGs));
     const wasHost = newState.players[userId]?.isHost;

     if (newState.status === 'waiting') {
         delete newState.players[userId];
     } else {
         if (newState.players[userId]) {
             newState.players[userId].status = 'left';
         }
     }

     const remainingActive = Object.values(newState.players).filter((p:any) => p.status !== 'left') as MinesweeperPlayer[];

     if (remainingActive.length === 0) {
         await supabase.from('lobbies').delete().eq('id', lobbyId);
         setGameState(null);
         setLobbyDeleted(true);
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