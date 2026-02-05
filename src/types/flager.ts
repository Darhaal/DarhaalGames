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

  // Текущее состояние
  score: number;
  guesses: string[]; // Коды стран, которые игрок вводил в текущем раунде
  hasFinishedRound: boolean;
  roundScore: number;

  // История
  history: RoundResult[];

  // Синхронизация между раундами
  isReadyForNextRound: boolean;
}

export interface FlagerState {
  players: FlagerPlayerState[];
  status: FlagerStatus;

  targetChain: string[]; // Массив кодов стран на всю игру (ответы)
  currentRoundIndex: number;

  roundStartTime: number; // Timestamp начала раунда для таймера
  lastActionTime: number;
  version: number;

  // Уведомления для игроков (например, о выходе)
  notifications?: FlagerNotification[];

  gameType: 'flager';
  settings: {
    maxPlayers: number;
    totalRounds: number;
    roundDuration: number;
  };
}