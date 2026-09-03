import { describe, it, expect } from 'vitest';
import { SPYFALL_PACKS, getAllLocations, LOCATION_PACK } from '@/data/spyfall/locations';
import { locationIcon } from '@/components/spyfall/locationIcon';

/**
 * The packs are 330 hand-written locations with 1650 roles across two
 * languages. A duplicate id silently breaks location lookup during a match,
 * and a missing translation renders as an empty card — neither shows up in a
 * type check, so they are asserted here instead.
 */

describe('Spyfall packs', () => {
  it('ships the full set of packs', () => {
    expect(SPYFALL_PACKS.length).toBeGreaterThanOrEqual(15);
  });

  it('gives every pack a unique id', () => {
    const ids = SPYFALL_PACKS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps location ids unique across all packs, not just within one', () => {
    // getLocationData searches the flattened list, so a collision between two
    // packs would resolve to whichever happens to come first.
    const ids = getAllLocations().map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const pack of SPYFALL_PACKS) {
    describe(pack.id, () => {
      it('is named in both languages and has an emoji', () => {
        expect(pack.name.ru.length).toBeGreaterThan(0);
        expect(pack.name.en.length).toBeGreaterThan(0);
        expect(pack.emoji.length).toBeGreaterThan(0);
      });

      it('holds between 20 and 30 locations', () => {
        expect(pack.locations.length).toBeGreaterThanOrEqual(20);
        expect(pack.locations.length).toBeLessThanOrEqual(30);
      });

      it('gives every location a name in both languages', () => {
        for (const loc of pack.locations) {
          expect(loc.name.ru.length, `${loc.id} ru`).toBeGreaterThan(0);
          expect(loc.name.en.length, `${loc.id} en`).toBeGreaterThan(0);
        }
      });

      it('gives every location enough distinct roles for a full table', () => {
        for (const loc of pack.locations) {
          // A room seats at most 12, so 20 roles means a group replaying the
          // same location gets a different cast rather than the same one.
          expect(loc.roles.length, `${loc.id}`).toBeGreaterThanOrEqual(20);

          const ru = loc.roles.map((r) => r.name.ru);
          expect(new Set(ru).size, `${loc.id} has a duplicate role`).toBe(ru.length);

          for (const role of loc.roles) {
            expect(role.name.ru.length, `${loc.id} role ru`).toBeGreaterThan(0);
            expect(role.name.en.length, `${loc.id} role en`).toBeGreaterThan(0);
          }
        }
      });

      it('uses slug-shaped location ids', () => {
        for (const loc of pack.locations) {
          expect(loc.id).toMatch(/^[a-z0-9_]+$/);
        }
      });
    });
  }

  it('varies the cast between locations in a pack', () => {
    // Bespoke roles plus an offset slice of the pack pool. If the offset ever
    // stopped working, neighbouring locations would carry identical filler.
    for (const pack of SPYFALL_PACKS) {
      const [first, second] = pack.locations;
      const a = new Set(first.roles.map((r) => r.name.ru));
      const shared = second.roles.filter((r) => a.has(r.name.ru)).length;
      expect(shared, `${pack.id}`).toBeLessThan(first.roles.length);
    }
  });

  it('never points at artwork that does not exist', () => {
    // public/spyfall/ was never populated, so any path here would 404 on every
    // card. Cards draw their own art instead — see LocationArt.
    for (const loc of getAllLocations()) {
      expect(loc.image, `${loc.id}`).toBeUndefined();
    }
  });

  it('maps every location to a pack', () => {
    // LocationArt resolves a location's pack through this map to pick a
    // fallback icon; a gap would silently drop it to the generic symbol.
    for (const loc of getAllLocations()) {
      expect(LOCATION_PACK[loc.id], `${loc.id}`).toBeTruthy();
    }
  });

  describe('generated artwork', () => {
    it('gives every location an icon, deterministically', () => {
      for (const loc of getAllLocations()) {
        const pack = LOCATION_PACK[loc.id];
        const first = locationIcon(loc.id, pack);
        expect(first, `${loc.id}`).toBeTruthy();
        // Same input, same icon — the card must not change between renders.
        expect(locationIcon(loc.id, pack)).toBe(first);
      }
    });

    it('does not collapse a pack onto a single icon', () => {
      // If the keyword rules stopped matching, every location would fall
      // through to its pack default and the grid would look identical.
      for (const pack of SPYFALL_PACKS) {
        const icons = new Set(pack.locations.map((l) => locationIcon(l.id, pack.id)));
        expect(icons.size, `${pack.id} uses only ${icons.size} icon(s)`).toBeGreaterThanOrEqual(8);
      }
    });
  });
});
