import { describe, it, expect } from 'vitest';
import {
  absoluteUrl,
  localizedPath,
  buildAlternates,
  breadcrumbJsonLd,
  faqJsonLd,
  videoGameJsonLd,
  NOINDEX,
  hubMetadata
} from '@/lib/seo';
import { GAMES_CONTENT, GAME_SLUGS, getGameContent, CONTENT_REVISION } from '@/content/games';

/**
 * These are cheap to get wrong and expensive to notice: a malformed canonical
 * or a broken hreflang pair fails silently in production and only shows up
 * weeks later as pages missing from the index.
 */

describe('localizedPath', () => {
  it('serves Russian from the bare path', () => {
    expect(localizedPath('ru', '/games/coup')).toBe('/games/coup');
    expect(localizedPath('ru', '/')).toBe('/');
  });

  it('prefixes English with /en', () => {
    expect(localizedPath('en', '/games/coup')).toBe('/en/games/coup');
  });

  it('never produces an empty href for the English root', () => {
    expect(localizedPath('en', '/')).toBe('/en');
  });
});

describe('absoluteUrl', () => {
  it('produces absolute URLs on the canonical host', () => {
    expect(absoluteUrl('/games')).toBe('https://games.okhten.com/games');
  });

  it('tolerates a missing leading slash', () => {
    expect(absoluteUrl('games')).toBe('https://games.okhten.com/games');
  });
});

describe('buildAlternates', () => {
  const alts = buildAlternates('en', '/games/spyfall');

  it('points canonical at the current locale', () => {
    expect(alts?.canonical).toBe('https://games.okhten.com/en/games/spyfall');
  });

  it('declares both locales plus x-default', () => {
    const langs = alts?.languages as Record<string, string>;
    expect(langs.ru).toBe('https://games.okhten.com/games/spyfall');
    expect(langs.en).toBe('https://games.okhten.com/en/games/spyfall');
    expect(langs['x-default']).toBe(langs.ru);
  });

  it('is symmetric — each locale points at the same pair', () => {
    const ru = buildAlternates('ru', '/games/coup')?.languages as Record<string, string>;
    const en = buildAlternates('en', '/games/coup')?.languages as Record<string, string>;
    expect(ru).toEqual(en);
  });
});

describe('game content integrity', () => {
  it('exposes a slug for every game', () => {
    expect(GAME_SLUGS).toHaveLength(GAMES_CONTENT.length);
    expect(new Set(GAME_SLUGS).size).toBe(GAME_SLUGS.length); // no duplicates
  });

  it('resolves known slugs and rejects unknown ones', () => {
    expect(getGameContent('coup')?.slug).toBe('coup');
    expect(getGameContent('mafia')).toBeUndefined();
  });

  it('uses a fixed content revision, never a build timestamp', () => {
    expect(CONTENT_REVISION).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  for (const game of GAMES_CONTENT) {
    for (const locale of ['ru', 'en'] as const) {
      const copy = game.locales[locale];

      it(`${game.slug}/${locale}: has the fields every page and JSON-LD block needs`, () => {
        expect(copy.name.length).toBeGreaterThan(0);
        expect(copy.metaTitle.length).toBeGreaterThan(0);
        expect(copy.intro.length).toBeGreaterThan(0);
        expect(copy.howToPlay.length).toBeGreaterThan(0);
        expect(copy.faq.length).toBeGreaterThan(0);
      });

      /**
       * The rendered title is `%s · Darhaal Games` — the 16-character brand
       * suffix is part of the budget. Google truncates around 60 characters,
       * and six of nine pages were being cut mid-phrase before this was caught.
       */
      it(`${game.slug}/${locale}: rendered title survives SERP truncation`, () => {
        expect(`${copy.metaTitle} · Darhaal Games`.length).toBeLessThanOrEqual(60);
      });

      it(`${game.slug}/${locale}: meta description stays within snippet length`, () => {
        expect(copy.metaDescription.length).toBeGreaterThanOrEqual(100);
        expect(copy.metaDescription.length).toBeLessThanOrEqual(200);
      });
    }

    it(`${game.slug}: player range is coherent`, () => {
      expect(game.players.min).toBeGreaterThan(0);
      expect(game.players.max).toBeGreaterThanOrEqual(game.players.min);
    });
  }
});

describe('hub metadata', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`${locale}: rendered hub title survives SERP truncation`, () => {
      const title = hubMetadata(locale).title as string;
      expect(`${title} · Darhaal Games`.length).toBeLessThanOrEqual(60);
    });
  }
});

describe('structured data', () => {
  const coup = getGameContent('coup')!;

  it('emits a VideoGame node with a resolvable url and player range', () => {
    const node = videoGameJsonLd(coup, 'ru') as Record<string, unknown>;
    expect(node['@type']).toBe('VideoGame');
    expect(node.url).toBe('https://games.okhten.com/games/coup');
    expect(node.numberOfPlayers).toMatchObject({ minValue: 2, maxValue: 6 });
  });

  it('marks single-player-capable games as such', () => {
    const solo = getGameContent('minesweeper')!;
    const node = videoGameJsonLd(solo, 'ru') as Record<string, unknown>;
    // max > 1, so the listing is a multiplayer one even though solo is allowed
    expect(node.playMode).toBe('MultiPlayer');
  });

  it('turns every FAQ entry into a Question/Answer pair', () => {
    const node = faqJsonLd(coup, 'en') as { mainEntity: unknown[] };
    expect(node.mainEntity).toHaveLength(coup.locales.en.faq.length);
  });

  it('numbers breadcrumbs from 1 and resolves each item', () => {
    const node = breadcrumbJsonLd('ru', [
      { name: 'Игры', path: '/games' },
      { name: 'Переворот', path: '/games/coup' }
    ]) as { itemListElement: { position: number; item: string }[] };

    expect(node.itemListElement[0].position).toBe(1);
    expect(node.itemListElement[1].item).toBe('https://games.okhten.com/games/coup');
  });
});

describe('NOINDEX', () => {
  it('keeps app screens out of the index and stops link-following', () => {
    expect(NOINDEX.robots).toMatchObject({ index: false, follow: false });
  });
});
