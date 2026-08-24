import { useState, useEffect, useRef } from 'react';
import { BattleshipState, Ship } from '@/types/battleship';
import { updatePlayerStats } from '@/lib/playerStats';
import { useLobbySync } from '@/hooks/core/useLobbySync';
import { getKey, isValidCoord, getShipCoords, checkPlacement, shuffleFleet } from '@/lib/gameLogic/battleship';

// Re-export for import backward compatibility
export { checkPlacement };

export function useBattleshipGame(
    lobbyId: string | null,
    user: { id: string; name: string; avatarUrl: string } | null
) {
  const [myShips, setMyShips] = useState<Ship[]>([]);
  const myShipsRef = useRef<Ship[]>([]);
  useEffect(() => { myShipsRef.current = myShips; }, [myShips]);

  const {
    gameState, gameStateRef,
    roomMeta, loading, lobbyDeleted,
    updateState, deleteLobby
  } = useLobbySync<BattleshipState>({
    lobbyId,
    userId: user?.id,
    channelPrefix: 'lobby-bs',
    getHostId: (state) => Object.values(state.players).find(pl => pl.isHost)?.id,
    // Sync local ships with the server state:
    // the server is authoritative in battle; during setup we only pick up on reconnect
    onIncoming: (incoming) => {
      const uid = user?.id;
      if (!uid || !incoming.players?.[uid]?.ships) return;
      const serverShips = incoming.players[uid].ships;

      if (incoming.phase === 'playing') {
        setMyShips(serverShips);
      } else if (incoming.phase === 'setup') {
        if (myShipsRef.current.length === 0 && serverShips.length > 0) {
          setMyShips(serverShips);
        }
      }
    }
  });

  // --- ACTIONS ---

  const initGame = async () => {
    if (!user || !gameStateRef.current) return;
    const currentState = gameStateRef.current;

    let playersObj = currentState.players;
    if (Array.isArray(playersObj)) playersObj = {};

    const existing = playersObj[user.id];
    if (!existing || !existing.name) {
      if (currentState.status === 'playing') {
          return;
      }

      const newState = JSON.parse(JSON.stringify(currentState)) as BattleshipState;
      if (Array.isArray(newState.players)) newState.players = {};

      const isFirst = Object.keys(newState.players).length === 0;

      newState.players[user.id] = {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        ships: existing?.ships || [],
        shots: existing?.shots || {},
        isReady: existing?.isReady || false,
        isHost: isFirst || existing?.isHost,
        aliveShipsCount: existing?.aliveShipsCount || 0
      };
      await updateState(newState);
    }
  };

  const startGame = async () => {
    if (!gameState || !user?.id) return;
    const newState = JSON.parse(JSON.stringify(gameState)) as BattleshipState;
    newState.status = 'playing';
    newState.phase = 'setup';
    newState.logs = [];
    await updateState(newState);
  };

  const autoPlaceShips = () => setMyShips(shuffleFleet());
  const clearShips = () => setMyShips([]);

  const placeShipManual = (ship: Ship) => {
      const otherShips = myShips.filter(s => s.id !== ship.id);
      if (checkPlacement(otherShips, ship)) {
          setMyShips([...otherShips, ship]);
          return true;
      }
      return false;
  };

  const removeShip = (id: string) => setMyShips(myShips.filter(s => s.id !== id));

  const submitShips = async () => {
    if (!user?.id || !gameState) return;

    const currentGs = gameStateRef.current || gameState;
    const newState = JSON.parse(JSON.stringify(currentGs)) as BattleshipState;

    newState.players[user.id].ships = myShips;
    newState.players[user.id].isReady = true;
    newState.players[user.id].aliveShipsCount = myShips.length;

    const playersArr = Object.values(newState.players);
    if (playersArr.length === 2 && playersArr.every(p => p.isReady)) {
      newState.phase = 'playing';
      newState.status = 'playing';
      newState.turn = playersArr[0].id;
      newState.turnDeadline = Date.now() + (60 * 1000);
      newState.startTime = Date.now();
    }

    await updateState(newState);
  };

  const fireShot = async (x: number, y: number) => {
    if (!user?.id || !gameState || gameState.turn !== user.id || gameState.phase !== 'playing') return;
    const opponentId = Object.keys(gameState.players).find(id => id !== user.id);
    if (!opponentId) return;

    const newState = JSON.parse(JSON.stringify(gameState)) as BattleshipState;
    const opponentBoard = newState.players[opponentId];
    const myBoard = newState.players[user.id];
    const key = getKey(x, y);

    if (myBoard.shots[key]) return;

    let hit = false, killed = false, hitShipIdx = -1;
    for (let i = 0; i < opponentBoard.ships.length; i++) {
      const s = opponentBoard.ships[i];
      if (getShipCoords(s).some(c => c.x === x && c.y === y)) {
        hit = true; hitShipIdx = i; s.hits++;
        if (s.hits >= s.size) killed = true;
        break;
      }
    }

    myBoard.shots[key] = hit ? (killed ? 'killed' : 'hit') : 'miss';

    if (killed) {
      opponentBoard.aliveShipsCount--;
      getShipCoords(opponentBoard.ships[hitShipIdx]).forEach(c => {
        myBoard.shots[getKey(c.x, c.y)] = 'killed';
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const nx = c.x + dx, ny = c.y + dy;
            if (isValidCoord(nx, ny) && !myBoard.shots[getKey(nx, ny)]) myBoard.shots[getKey(nx, ny)] = 'miss';
          }
        }
      });
    } else if (!hit) {
      newState.turn = opponentId;
      newState.turnDeadline = Date.now() + (60 * 1000);
    } else {
        newState.turnDeadline = Date.now() + (60 * 1000);
    }

    if (opponentBoard.aliveShipsCount === 0) {
      newState.phase = 'finished';
      newState.status = 'finished';
      newState.winner = user.id;
    }
    await updateState(newState);
  };

  const handleTimeout = async () => {
    const currentGs = gameStateRef.current;
    const currentUser = user;
    if (!currentGs || !currentUser || currentGs.phase !== 'playing' || currentGs.turn !== currentUser.id) return;

    const opponentId = Object.keys(currentGs.players).find(id => id !== currentUser.id);
    const newState = JSON.parse(JSON.stringify(currentGs)) as BattleshipState;

    if (opponentId) {
        newState.turn = opponentId;
        newState.turnDeadline = Date.now() + (60 * 1000);
        await updateState(newState);
    }
  };

  const leaveGame = async () => {
     const currentGs = gameStateRef.current;
     if (!lobbyId || !user || !currentGs) return;

     // A finished match is a record, not live state: leaving must not rewrite
     // the results the other players are still looking at. Just walk away —
     // the page navigates us out.
     if (currentGs.status === 'finished') return;

     const newState = JSON.parse(JSON.stringify(currentGs));
     const wasHost = newState.players[user.id]?.isHost;

     delete newState.players[user.id];

     if (Object.keys(newState.players).length === 0) {
         await deleteLobby();
     } else {
         if (wasHost) {
             const nextHostId = Object.keys(newState.players)[0];
             if (nextHostId) newState.players[nextHostId].isHost = true;
         }

         // Technical win for the remaining player only if the match already started
         // (phase === 'setup' is set before the start in the waiting lobby — leaving must not end the game)
         if (newState.status === 'playing') {
             newState.phase = 'finished';
             newState.status = 'finished';
             newState.winner = Object.keys(newState.players)[0];
         }
         await updateState(newState);
     }
  };

  // TRACK GAME END TO RECORD STATISTICS
  useEffect(() => {
      if (gameState?.status === 'finished' && user?.id && !lobbyDeleted) {
          const isWinner = gameState.winner === user.id;
          // Actual match duration; 600s fallback for legacy states
          const duration = gameState.startTime
              ? Math.max(1, Math.round((Date.now() - gameState.startTime) / 1000))
              : 600;

          updatePlayerStats(user.id, {
              gameType: 'battleship',
              result: isWinner ? 'win' : 'loss',
              durationSeconds: duration
          });
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once when the match finishes; adding gameState.players would re-record stats
  }, [gameState?.status, gameState?.winner, user?.id, lobbyDeleted]);

  return {
      gameState, roomMeta, myShips, loading, lobbyDeleted,
      initGame, startGame, autoPlaceShips, clearShips,
      placeShipManual, removeShip, submitShips, fireShot, leaveGame,
      handleTimeout
  };
}