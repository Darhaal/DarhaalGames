import { describe, it, expect } from 'vitest';
import { buildDeck, shuffleDeck, getRequiredRoles } from '@/lib/gameLogic/coup';

describe('buildDeck', () => {
  it('contains 15 cards, 3 of each role', () => {
    const deck = buildDeck();
    expect(deck).toHaveLength(15);
    for (const role of ['duke', 'assassin', 'captain', 'ambassador', 'contessa']) {
      expect(deck.filter(r => r === role)).toHaveLength(3);
    }
  });
});

describe('shuffleDeck', () => {
  it('preserves deck contents', () => {
    const deck = buildDeck();
    const shuffled = shuffleDeck(deck);
    expect(shuffled).toHaveLength(15);
    expect([...shuffled].sort()).toEqual([...deck].sort());
  });

  it('does not mutate the original', () => {
    const deck = buildDeck();
    const copy = [...deck];
    shuffleDeck(deck);
    expect(deck).toEqual(copy);
  });
});

describe('getRequiredRoles', () => {
  it('action claims', () => {
    expect(getRequiredRoles('tax', false)).toEqual(['duke']);
    expect(getRequiredRoles('steal', false)).toEqual(['captain']);
    expect(getRequiredRoles('assassinate', false)).toEqual(['assassin']);
    expect(getRequiredRoles('exchange', false)).toEqual(['ambassador']);
  });

  it('block claims', () => {
    expect(getRequiredRoles('foreign_aid', true)).toEqual(['duke']);
    expect(getRequiredRoles('assassinate', true)).toEqual(['contessa']);
    expect(getRequiredRoles('steal', true)).toEqual(['captain', 'ambassador']);
  });
});
