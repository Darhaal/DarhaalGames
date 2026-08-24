import { Cell } from '@/types/minesweeper';

/** Neighboring cells (up to 8) within the board */
export const getNeighbors = (x: number, y: number, width: number, height: number) => {
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

export const generateEmptyBoard = (width: number, height: number): Cell[][] => {
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

/** Places mines with a 3x3 safe zone around the first click; recomputes neighbor counts */
export const placeMines = (board: Cell[][], width: number, height: number, minesCount: number, safeX: number, safeY: number) => {
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

/** Iterative flood-fill cell opening (stack-overflow safe on large boards) */
export const openCellIterative = (board: Cell[][], startX: number, startY: number, width: number, height: number) => {
    const stack = [{ x: startX, y: startY }];

    while (stack.length > 0) {
        const { x, y } = stack.pop()!;

        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        const cell = board[y][x];

        if (cell.isOpen || cell.isFlagged) continue;

        cell.isOpen = true;

        if (cell.neighborCount === 0) {
            const neighbors = getNeighbors(x, y, width, height);
            for (const n of neighbors) {
                if (!board[n.y][n.x].isOpen && !board[n.y][n.x].isFlagged) {
                    stack.push(n);
                }
            }
        }
    }
};

export interface ChordResult {
  changed: boolean;  // did the chord open at least one neighbor
  hitMine: boolean;  // did opening a neighbor hit a mine
}

/**
 * Chord on an opened numbered cell: when the number of flags around it equals
 * its neighbor count, open every remaining non-flagged neighbor at once.
 * Mutates the board in place. This is the classic "click the number with the
 * right flags to clear the rest" speed mechanic.
 */
export const chordCell = (board: Cell[][], x: number, y: number, width: number, height: number): ChordResult => {
    const cell = board[y][x];
    if (!cell.isOpen || cell.neighborCount === 0) return { changed: false, hitMine: false };

    const neighbors = getNeighbors(x, y, width, height);
    const flaggedCount = neighbors.reduce((acc, n) => acc + (board[n.y][n.x].isFlagged ? 1 : 0), 0);
    if (flaggedCount !== cell.neighborCount) return { changed: false, hitMine: false };

    let changed = false;
    let hitMine = false;
    for (const n of neighbors) {
        const nCell = board[n.y][n.x];
        if (nCell.isOpen || nCell.isFlagged) continue;
        changed = true;
        if (nCell.isMine) {
            hitMine = true;
            nCell.isOpen = true;
        } else {
            openCellIterative(board, n.x, n.y, width, height);
        }
    }
    return { changed, hitMine };
};
