import { describe, it, expect } from 'vitest';
import { checkPlacement, shuffleFleet, getShipCoords, BOARD_SIZE } from '@/lib/gameLogic/battleship';
import { Ship, FLEET_CONFIG } from '@/types/battleship';

const ship = (x: number, y: number, size: number, orientation: 'horizontal' | 'vertical' = 'horizontal', id = 's1'): Ship => ({
  id, type: 'cruiser', size, orientation, position: { x, y }, hits: 0
});

describe('getShipCoords', () => {
  it('horizontal ship occupies cells to the right', () => {
    expect(getShipCoords(ship(2, 3, 3))).toEqual([
      { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }
    ]);
  });

  it('vertical ship occupies cells downward', () => {
    expect(getShipCoords(ship(5, 0, 2, 'vertical'))).toEqual([
      { x: 5, y: 0 }, { x: 5, y: 1 }
    ]);
  });
});

describe('checkPlacement', () => {
  it('accepts a ship inside the board', () => {
    expect(checkPlacement([], ship(0, 0, 4))).toBe(true);
  });

  it('rejects a ship sticking out of the board', () => {
    expect(checkPlacement([], ship(7, 0, 4))).toBe(false);
    expect(checkPlacement([], ship(0, 8, 4, 'vertical'))).toBe(false);
  });

  it('rejects overlapping ships', () => {
    const existing = ship(2, 2, 3, 'horizontal', 'a');
    expect(checkPlacement([existing], ship(3, 2, 2, 'vertical', 'b'))).toBe(false);
  });

  it('rejects touching ships (including diagonal)', () => {
    const existing = ship(2, 2, 2, 'horizontal', 'a');
    // Diagonal touch at (1,1)
    expect(checkPlacement([existing], ship(0, 1, 2, 'horizontal', 'b'))).toBe(false);
    // Flush below
    expect(checkPlacement([existing], ship(2, 3, 2, 'horizontal', 'b'))).toBe(false);
  });

  it('accepts ships with a one-cell gap', () => {
    const existing = ship(0, 0, 2, 'horizontal', 'a');
    expect(checkPlacement([existing], ship(0, 2, 2, 'horizontal', 'b'))).toBe(true);
  });

  it('ignores the ship being moved (ignoreShipId)', () => {
    const existing = ship(2, 2, 3, 'horizontal', 'a');
    expect(checkPlacement([existing], ship(2, 2, 3, 'horizontal', 'a'), 'a')).toBe(true);
  });
});

describe('shuffleFleet', () => {
  it('places the full 10-ship fleet in valid positions', () => {
    for (let run = 0; run < 5; run++) {
      const fleet = shuffleFleet();
      expect(fleet).toHaveLength(10);

      // Fleet composition matches the configuration
      for (const cfg of FLEET_CONFIG) {
        expect(fleet.filter(s => s.type === cfg.type)).toHaveLength(cfg.count);
      }

      // Every ship is valid relative to the rest
      for (const s of fleet) {
        const others = fleet.filter(o => o.id !== s.id);
        expect(checkPlacement(others, s)).toBe(true);
        for (const c of getShipCoords(s)) {
          expect(c.x).toBeGreaterThanOrEqual(0);
          expect(c.x).toBeLessThan(BOARD_SIZE);
          expect(c.y).toBeGreaterThanOrEqual(0);
          expect(c.y).toBeLessThan(BOARD_SIZE);
        }
      }
    }
  });
});
