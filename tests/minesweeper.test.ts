import { describe, it, expect } from 'vitest';
import { getNeighbors, generateEmptyBoard, placeMines, openCellIterative, chordCell } from '@/lib/gameLogic/minesweeper';
import type { Cell } from '@/types/minesweeper';

/** Build a board from an ASCII map. '*' = mine, '.' = empty. Recomputes counts. */
function boardFromMap(rows: string[]): { board: Cell[][]; w: number; h: number } {
  const h = rows.length;
  const w = rows[0].length;
  const board = generateEmptyBoard(w, h);
  rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '*') board[y][x].isMine = true; }));
  placeMines(board, w, h, 0, -5, -5); // 0 new mines, just recompute neighbor counts
  return { board, w, h };
}

describe('getNeighbors', () => {
  it('returns 8 neighbors for a center cell', () => {
    expect(getNeighbors(5, 5, 10, 10)).toHaveLength(8);
  });

  it('returns 3 neighbors for a corner cell', () => {
    expect(getNeighbors(0, 0, 10, 10)).toHaveLength(3);
  });

  it('returns 5 neighbors for an edge cell', () => {
    expect(getNeighbors(0, 5, 10, 10)).toHaveLength(5);
  });
});

describe('generateEmptyBoard', () => {
  it('creates a board with correct dimensions and clean cells', () => {
    const board = generateEmptyBoard(7, 4);
    expect(board).toHaveLength(4);        // rows = height
    expect(board[0]).toHaveLength(7);     // cols = width
    expect(board.flat().every(c => !c.isMine && !c.isOpen && !c.isFlagged)).toBe(true);
  });
});

describe('placeMines', () => {
  it('places the exact number of mines outside the 3x3 safe zone', () => {
    const board = generateEmptyBoard(10, 10);
    placeMines(board, 10, 10, 15, 5, 5);

    const mines = board.flat().filter(c => c.isMine);
    expect(mines).toHaveLength(15);

    // The safe zone around the first click is clean
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        expect(board[5 + dy][5 + dx].isMine).toBe(false);
      }
    }
  });

  it('computes neighbor counts correctly', () => {
    const board = generateEmptyBoard(5, 5);
    // One mine in the center, placed manually; recount via placeMines with 0 new mines
    board[2][2].isMine = true;
    placeMines(board, 5, 5, 0, 0, 0); // 0 new mines, but neighbor counts get recomputed

    expect(board[1][1].neighborCount).toBe(1);
    expect(board[2][1].neighborCount).toBe(1);
    expect(board[0][0].neighborCount).toBe(0);
  });
});

describe('openCellIterative', () => {
  it('flood-fills an empty region and stops at numbered borders', () => {
    const board = generateEmptyBoard(5, 5);
    board[0][4].isMine = true;
    placeMines(board, 5, 5, 0, 0, 0); // recompute neighbor counts

    openCellIterative(board, 0, 4, 5, 5); // click in the corner far from the mine (x=0,y=4)

    // The mine stays closed
    expect(board[0][4].isOpen).toBe(false);
    // The far corner is open
    expect(board[4][0].isOpen).toBe(true);
    // Numbered border cells are open, but nothing beyond
    const openedCount = board.flat().filter(c => c.isOpen).length;
    expect(openedCount).toBe(24); // everything except the mine
  });

  it('does not open flagged cells', () => {
    const board = generateEmptyBoard(3, 3);
    board[1][1].isFlagged = true;
    openCellIterative(board, 0, 0, 3, 3);
    expect(board[1][1].isOpen).toBe(false);
  });

  it('handles large boards without stack overflow', () => {
    const board = generateEmptyBoard(100, 100);
    expect(() => openCellIterative(board, 50, 50, 100, 100)).not.toThrow();
    expect(board.flat().every(c => c.isOpen)).toBe(true);
  });
});

describe('chordCell', () => {
  // Layout: a single mine at (x=0,y=0). Cell (x=1,y=1) is a "1" (touches the mine).
  //   * . .
  //   . 1 .
  //   . . .
  const openCenter = () => {
    const { board, w, h } = boardFromMap(['*..', '...', '...']);
    board[1][1].isOpen = true; // open the number at (x=1,y=1)
    return { board, w, h };
  };

  it('does nothing when the flag count does not match the number', () => {
    const { board, w, h } = openCenter();
    const res = chordCell(board, 1, 1, w, h);
    expect(res.changed).toBe(false);
    expect(board.flat().filter(c => c.isOpen)).toHaveLength(1); // only the number
  });

  it('opens all safe neighbors when the correct flag sits on the mine', () => {
    const { board, w, h } = openCenter();
    board[0][0].isFlagged = true; // flag the actual mine at (x=0,y=0)
    const res = chordCell(board, 1, 1, w, h);
    expect(res.changed).toBe(true);
    expect(res.hitMine).toBe(false);
    // Every non-mine cell is now open (the flagged mine stays closed)
    expect(board.flat().filter(c => !c.isMine).every(c => c.isOpen)).toBe(true);
    expect(board[0][0].isOpen).toBe(false);
  });

  it('detonates when the flag is on the wrong cell', () => {
    const { board, w, h } = openCenter();
    board[0][2].isFlagged = true; // wrong flag — count still matches (1)
    const res = chordCell(board, 1, 1, w, h);
    expect(res.changed).toBe(true);
    expect(res.hitMine).toBe(true);
    expect(board[0][0].isOpen).toBe(true); // the real mine got opened
  });

  it('is a no-op on an unopened cell', () => {
    const { board, w, h } = openCenter();
    expect(chordCell(board, 0, 1, w, h).changed).toBe(false); // (x=0,y=1) is not opened
  });
});
