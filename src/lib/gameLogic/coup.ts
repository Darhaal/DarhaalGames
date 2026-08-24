import { Role } from '@/types/coup';

/** Full deck: 3 copies of each of the 5 roles */
export const buildDeck = (): Role[] => ([
  'duke', 'duke', 'duke',
  'assassin', 'assassin', 'assassin',
  'captain', 'captain', 'captain',
  'ambassador', 'ambassador', 'ambassador',
  'contessa', 'contessa', 'contessa'
]);

export const shuffleDeck = (deck: Role[]): Role[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

/**
 * Which roles prove the legitimacy of an action (isBlock=false)
 * or a block (isBlock=true) when challenged.
 */
export const getRequiredRoles = (action: string, isBlock: boolean): Role[] => {
  if (isBlock) {
      if (action === 'foreign_aid') return ['duke'];
      if (action === 'assassinate') return ['contessa'];
      if (action === 'steal') return ['captain', 'ambassador'];
      return ['duke'];
  } else {
      if (action === 'tax') return ['duke'];
      if (action === 'steal') return ['captain'];
      if (action === 'assassinate') return ['assassin'];
      if (action === 'exchange') return ['ambassador'];
      return ['duke'];
  }
};
