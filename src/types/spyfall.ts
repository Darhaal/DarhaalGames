export type SpyfallStatus = 'waiting' | 'playing' | 'voting' | 'finished';

export interface SpyfallRole {
  name: { ru: string; en: string };
}

export interface SpyfallLocation {
  id: string;
  name: { ru: string; en: string };
  roles: SpyfallRole[];
  image: string; // Путь к картинке
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

  // Игровые данные
  isSpy: boolean;
  role: string | null;
  isReady: boolean;
  hasNominated?: boolean; // Голосовал ли уже в этом раунде
  score: number; // Очки за серию игр
}

export interface Nomination {
  authorId: string; // Кто начал голосование
  targetId: string; // Кого обвиняют
  votes: Record<string, boolean>; // id игрока -> за/против
  startTime: number; // Для таймера голосования
}

export interface SpyfallState {
  players: SpyfallPlayer[];
  status: SpyfallStatus;

  // Настройки
  settings: {
    roundDuration: number;
    spyCount: number;
    useCustomLocations: boolean;
    customLocations: string[];
    packId: string; // ID выбранного пака (строго один)
  };

  // Раунд
  currentLocationId: string | null;
  locationList: string[]; // Список ID локаций текущего раунда
  startTime: number;
  winner: 'spy' | 'locals' | null;
  winReason?: 'time' | 'guessed_loc' | 'spy_failed_guess' | 'spy_caught' | 'innocent_killed' | 'spy_left';

  // Голосование
  nomination: Nomination | null;

  // Уведомления
  notifications: Array<{ id: number; msg: string; type: 'info' | 'alert' | 'success' }>;

  version: number;
  gameType: 'spyfall';
}