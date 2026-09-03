import { SpyfallPack } from "@/types/spyfall";

import { general1 } from "./packs/general1";
import { general2 } from "./packs/general2";
import { general3 } from "./packs/general3";
import { school } from "./packs/school";
import { university } from "./packs/university";
import { office } from "./packs/office";
import { horror } from "./packs/horror";
import { gaming } from "./packs/gaming";
import { ussr } from "./packs/ussr";
import { usa } from "./packs/usa";
import { nature } from "./packs/nature";
import { history } from "./packs/history";
import { scifi } from "./packs/scifi";
import { sports } from "./packs/sports";
import { food } from "./packs/food";

export const SPYFALL_PACKS: SpyfallPack[] = [
  general1,
  general2,
  general3,
  school,
  university,
  office,
  horror,
  gaming,
  ussr,
  usa,
  nature,
  history,
  scifi,
  sports,
  food,
];

/** Flatten every location so a game can resolve one by id across all packs. */
export const getAllLocations = () => SPYFALL_PACKS.flatMap(p => p.locations);

/**
 * locationId -> packId. Lets a card find its own pack without the id being
 * threaded down through props from wherever the round was set up.
 */
export const LOCATION_PACK: Record<string, string> = Object.fromEntries(
  SPYFALL_PACKS.flatMap(p => p.locations.map(l => [l.id, p.id]))
);
