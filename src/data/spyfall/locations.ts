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
  usa
];

// Helper to flatten all locations for searching by ID across all packs
export const getAllLocations = () => SPYFALL_PACKS.flatMap(p => p.locations);