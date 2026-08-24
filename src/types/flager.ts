export type FlagerStatus = 'waiting' | 'playing' | 'round_end' | 'finished';

export interface RoundResult {
  flagCode: string;
  isCorrect: boolean;
  attempts: number;
  points: number;
}

export interface FlagerNotification {
  id: number;
  message: {
    ru: string;
    en: string;
  };
  type: 'info' | 'leave' | 'join';
}

export interface FlagerPlayerState {
  id: string;
  name: string;
  avatarUrl: string;
  isHost: boolean;

  // Current state
  score: number;
  guesses: string[]; // Country codes the player entered in the current round
  hasFinishedRound: boolean;
  roundScore: number;

  // History
  history: RoundResult[];

  // Between-round synchronization
  isReadyForNextRound: boolean;
}

export interface FlagerState {
  players: FlagerPlayerState[];
  status: FlagerStatus;

  targetChain: string[]; // Country codes for the whole game (the answers)
  currentRoundIndex: number;

  roundStartTime: number; // Round start timestamp for the timer
  lastActionTime: number;
  version: number;

  // Player notifications (e.g. someone left)
  notifications?: FlagerNotification[];

  gameType: 'flager';
  settings: {
    maxPlayers: number;
    totalRounds: number;
    roundDuration: number;
  };
}