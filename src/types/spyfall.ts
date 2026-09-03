export type SpyfallStatus = 'waiting' | 'playing' | 'voting' | 'finished';

export interface SpyfallRole {
  name: { ru: string; en: string };
}

export interface SpyfallLocation {
  id: string;
  name: { ru: string; en: string };
  roles: SpyfallRole[];
  /**
   * Optional artwork path. No location currently ships one: every reader
   * guards with `loc.image ? ... : fallback`, and the card already renders the
   * location name over a scrim, so the fallback reads perfectly well.
   */
  image?: string;
}

export interface SpyfallPack {
  id: string;
  name: { ru: string; en: string };
  locations: SpyfallLocation[];
  emoji: string;
}

export interface SpyfallPlayer {
  id: string;
  name: string;
  avatarUrl: string;
  isHost: boolean;

  // Game data
  isSpy: boolean;
  role: string | null;
  isReady: boolean;
  hasNominated?: boolean; // Whether the player already nominated this round
  score: number; // Score across a series of games
}

export interface Nomination {
  authorId: string; // Who started the vote
  targetId: string; // Who is accused
  votes: Record<string, boolean>; // player id -> yes/no
  startTime: number; // For the voting timer
}

export interface SpyfallState {
  players: SpyfallPlayer[];
  status: SpyfallStatus;

  // Settings
  settings: {
    roundDuration: number;
    spyCount: number;
    useCustomLocations: boolean;
    customLocations: string[];
    packId: string; // Selected pack id (exactly one)
  };

  // Round
  currentLocationId: string | null;
  locationList: string[]; // Location ids of the current round
  startTime: number;
  winner: 'spy' | 'locals' | null;
  winReason?: 'time' | 'guessed_loc' | 'spy_failed_guess' | 'spy_caught' | 'innocent_killed' | 'spy_left';

  // Voting
  nomination: Nomination | null;

  // Notifications
  notifications: Array<{ id: number; msg: string; type: 'info' | 'alert' | 'success' }>;

  version: number;
  gameType: 'spyfall';
}