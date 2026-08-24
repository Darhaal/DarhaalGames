import { Ship, Orientation, Coordinate, FLEET_CONFIG } from '@/types/battleship';

export const BOARD_SIZE = 10;

export const getKey = (x: number, y: number) => `${x},${y}`;
export const isValidCoord = (x: number, y: number) => x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;

/** All cells occupied by a ship */
export const getShipCoords = (ship: Ship): Coordinate[] => {
  const coords: Coordinate[] = [];
  for (let i = 0; i < ship.size; i++) {
    coords.push({
      x: ship.orientation === 'horizontal' ? ship.position.x + i : ship.position.x,
      y: ship.orientation === 'vertical' ? ship.position.y + i : ship.position.y,
    });
  }
  return coords;
};

/** Is the ship placement valid: inside the board and not touching others (incl. diagonals) */
export const checkPlacement = (ships: Ship[], newShip: Ship, ignoreShipId?: string): boolean => {
  const newShipCoords = getShipCoords(newShip);
  for (const c of newShipCoords) {
    if (!isValidCoord(c.x, c.y)) return false;
  }

  const dangerZone = new Set<string>();
  const otherShips = ships.filter(s => s.id !== newShip.id && s.id !== ignoreShipId);

  otherShips.forEach(s => {
    getShipCoords(s).forEach(coord => {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          dangerZone.add(getKey(coord.x + dx, coord.y + dy));
        }
      }
    });
  });

  for (const c of newShipCoords) {
    if (dangerZone.has(getKey(c.x, c.y))) return false;
  }
  return true;
};

/** Random valid placement of the whole fleet (10 ships) */
export const shuffleFleet = (): Ship[] => {
  const ships: Ship[] = [];
  let attempts = 0;
  while (ships.length < 10 && attempts < 200) {
    ships.length = 0;
    let success = true;
    for (const config of FLEET_CONFIG) {
      for (let i = 0; i < config.count; i++) {
        let placed = false;
        let innerAttempts = 0;
        while (!placed && innerAttempts < 100) {
          const orientation: Orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
          const x = Math.floor(Math.random() * BOARD_SIZE);
          const y = Math.floor(Math.random() * BOARD_SIZE);
          const newShip: Ship = {
            id: `${config.type}-${i}-${Math.random()}`,
            type: config.type,
            size: config.size,
            orientation,
            position: { x, y },
            hits: 0
          };
          if (checkPlacement(ships, newShip)) {
            ships.push(newShip);
            placed = true;
          }
          innerAttempts++;
        }
        if (!placed) { success = false; break; }
      }
      if (!success) break;
    }
    if (success) return ships;
    attempts++;
  }
  return [];
};
