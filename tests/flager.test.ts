import { describe, it, expect } from 'vitest';
import { calcFlagerPoints, FLAGER_BASE_SCORE, FLAGER_MIN_SCORE } from '@/lib/gameLogic/flager';

describe('calcFlagerPoints', () => {
  it('perfect answer: first attempt, instant', () => {
    expect(calcFlagerPoints(1, 0)).toBe(FLAGER_BASE_SCORE);
  });

  it('subtracts 50 per extra attempt', () => {
    expect(calcFlagerPoints(3, 0)).toBe(FLAGER_BASE_SCORE - 100);
  });

  it('subtracts 10 per second', () => {
    expect(calcFlagerPoints(1, 12)).toBe(FLAGER_BASE_SCORE - 120);
  });

  it('floors partial seconds', () => {
    expect(calcFlagerPoints(1, 1.9)).toBe(FLAGER_BASE_SCORE - 19);
  });

  it('never goes below the minimum', () => {
    expect(calcFlagerPoints(10, 500)).toBe(FLAGER_MIN_SCORE);
  });
});
