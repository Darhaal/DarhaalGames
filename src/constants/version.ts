export const APP_VERSION = '1.4.5';

export type VersionType = 'major' | 'minor' | 'patch' | 'init';

export interface VersionLog {
  ver: string;
  date: string;
  type: VersionType;
  title?: { ru: string; en: string };
  desc: { ru: string; en: string };
}

export const VERSION_HISTORY: VersionLog[] = [
  /* ===================== 1.4.x ===================== */

  {
    ver: '1.4.5',
    date: '3 FEB 2026',
    type: 'patch',
    desc: {
      ru: 'Мелкие багфиксы, улучшена отзывчивость UI и обработка кликов.',
      en: 'Minor bug fixes, improved UI responsiveness and click handling.'
    }
  },
  {
    ver: '1.4.4',
    date: '3 FEB 2026',
    type: 'patch',
    desc: {
      ru: 'Фиксы мультиплеера, стабильность лобби и таймеров.',
      en: 'Multiplayer fixes, improved lobby and timer stability.'
    }
  },
  {
    ver: '1.4.3',
    date: '3 FEB 2026',
    type: 'patch',
    desc: {
      ru: 'Улучшения UX в Сапере, оптимизация анимаций.',
      en: 'UX improvements for Minesweeper, animation optimizations.'
    }
  },
  {
    ver: '1.4.2',
    date: '3 FEB 2026',
    type: 'patch',
    desc: {
      ru: 'Исправлены ошибки генерации поля и логики флагов.',
      en: 'Fixed board generation issues and flag logic.'
    }
  },
  {
    ver: '1.4.1',
    date: '3 FEB 2026',
    type: 'patch',
    desc: {
      ru: 'Оптимизация производительности и сетевого взаимодействия.',
      en: 'Performance and networking optimizations.'
    }
  },
  {
    ver: '1.4.0',
    date: '3 FEB 2026',
    type: 'minor',
    title: { ru: 'Minesweeper', en: 'Minesweeper' },
    desc: {
      ru: 'Добавлен Сапер: мультиплеер, флаги, масштабирование поля.',
      en: 'Added Minesweeper: multiplayer, flags and board zoom.'
    }
  },

  /* ===================== 1.3.x ===================== */

  {
    ver: '1.3.5',
    date: '2 FEB 2026',
    type: 'patch',
    desc: {
      ru: 'Фиксы локализации и корректности вопросов.',
      en: 'Localization fixes and question correctness.'
    }
  },
  {
    ver: '1.3.4',
    date: '2 FEB 2026',
    type: 'patch',
    desc: {
      ru: 'Улучшения UI викторины и плавности анимаций.',
      en: 'Quiz UI and animation smoothness improvements.'
    }
  },
  {
    ver: '1.3.3',
    date: '2 FEB 2026',
    type: 'patch',
    desc: {
      ru: 'Оптимизация Pixel Match и ускорение загрузки.',
      en: 'Pixel Match optimizations and faster loading.'
    }
  },
  {
    ver: '1.3.2',
    date: '1 FEB 2026',
    type: 'patch',
    desc: {
      ru: 'Исправлены редкие ошибки подсчёта результатов.',
      en: 'Fixed rare score calculation issues.'
    }
  },
  {
    ver: '1.3.1',
    date: '1 FEB 2026',
    type: 'patch',
    desc: {
      ru: 'Мелкие багфиксы и улучшения стабильности.',
      en: 'Minor bug fixes and stability improvements.'
    }
  },
  {
    ver: '1.3.0',
    date: '1 FEB 2026',
    type: 'minor',
    title: { ru: 'Flager', en: 'Flager' },
    desc: {
      ru: 'Добавлена викторина флагов с механикой Pixel Match.',
      en: 'Added flag quiz with Pixel Match mechanic.'
    }
  },

  /* ===================== 1.2.x ===================== */

  {
    ver: '1.2.5',
    date: '31 JAN 2026',
    type: 'patch',
    desc: {
      ru: 'Оптимизация Drag&Drop и сетевой синхронизации.',
      en: 'Drag&Drop and network sync optimizations.'
    }
  },
  {
    ver: '1.2.4',
    date: '31 JAN 2026',
    type: 'patch',
    desc: {
      ru: 'Фиксы визуальных багов и улучшение отклика.',
      en: 'Visual bug fixes and improved responsiveness.'
    }
  },
  {
    ver: '1.2.3',
    date: '31 JAN 2026',
    type: 'patch',
    desc: {
      ru: 'Исправлены ошибки размещения кораблей.',
      en: 'Fixed ship placement issues.'
    }
  },
  {
    ver: '1.2.2',
    date: '30 JAN 2026',
    type: 'patch',
    desc: {
      ru: 'Стабилизация матчей и таймеров.',
      en: 'Match and timer stabilization.'
    }
  },
  {
    ver: '1.2.1',
    date: '30 JAN 2026',
    type: 'patch',
    desc: {
      ru: 'Мелкие багфиксы и улучшения UI.',
      en: 'Minor bug fixes and UI improvements.'
    }
  },
  {
    ver: '1.2.0',
    date: '30 JAN 2026',
    type: 'minor',
    title: { ru: 'Battleship', en: 'Battleship' },
    desc: {
      ru: 'Добавлен Морской бой в реальном времени.',
      en: 'Added real-time Battleship.'
    }
  },

  /* ===================== 1.1.x ===================== */

  {
    ver: '1.1.5',
    date: '29 JAN 2026',
    type: 'patch',
    desc: {
      ru: 'Баланс ролей и исправление логики карт.',
      en: 'Role balance and card logic fixes.'
    }
  },
  {
    ver: '1.1.4',
    date: '29 JAN 2026',
    type: 'patch',
    desc: {
      ru: 'Фиксы сетевых рассинхронов.',
      en: 'Network desync fixes.'
    }
  },
  {
    ver: '1.1.3',
    date: '29 JAN 2026',
    type: 'patch',
    desc: {
      ru: 'Улучшения UI и стабильности матчей.',
      en: 'UI and match stability improvements.'
    }
  },
  {
    ver: '1.1.2',
    date: '28 JAN 2026',
    type: 'patch',
    desc: {
      ru: 'Исправлены ошибки завершения раундов.',
      en: 'Fixed round ending issues.'
    }
  },
  {
    ver: '1.1.1',
    date: '28 JAN 2026',
    type: 'patch',
    desc: {
      ru: 'Мелкие багфиксы и оптимизация.',
      en: 'Minor bug fixes and optimizations.'
    }
  },
  {
    ver: '1.1.0',
    date: '28 JAN 2026',
    type: 'minor',
    title: { ru: 'Coup', en: 'Coup' },
    desc: {
      ru: 'Добавлена карточная игра Coup.',
      en: 'Added the card game Coup.'
    }
  },

  /* ===================== 1.0.x ===================== */

  {
    ver: '1.0.2',
    date: '27 JAN 2026',
    type: 'patch',
    desc: {
      ru: 'Добавлены RU/EN локализации и настройки звука.',
      en: 'Added RU/EN localization and audio settings.'
    }
  },
  {
    ver: '1.0.1',
    date: '27 JAN 2026',
    type: 'patch',
    desc: {
      ru: 'Фиксы авторизации и лобби.',
      en: 'Authentication and lobby fixes.'
    }
  },
  {
    ver: '1.0.0',
    date: '27 JAN 2026',
    type: 'init',
    title: { ru: 'Launch', en: 'Launch' },
    desc: {
      ru: 'Первый релиз платформы: аккаунты, профили и лобби.',
      en: 'Initial platform release: accounts, profiles and lobbies.'
    }
  }
];
