import { Target, Zap, Shield, Trophy, MousePointer2, Move, Eye, Flag, Ship, RefreshCw, Crosshair, AlertTriangle, Coins, Search, Clock, Map as MapIcon } from 'lucide-react';
import { GameRulesData } from '@/components/GameRulesModal';

export const GAME_RULES: Record<'ru' | 'en', Record<string, GameRulesData>> = {
  ru: {
    battleship: {
      title: 'Морской Бой',
      description: 'Стратегическое морское сражение',
      sections: [
        {
          title: 'Цель игры',
          icon: Trophy,
          content: 'Ваша главная задача — обнаружить и уничтожить флотилию противника раньше, чем он уничтожит вашу. Побеждает тот, кто первым пустит ко дну все 10 кораблей соперника. Игра ведется до полного уничтожения флота одного из игроков.',
          type: 'text'
        },
        {
          title: 'Состав флота',
          icon: Ship,
          content: [
            '1x Линкор (4 клетки) — самый большой и ценный корабль, основа вашей мощи.',
            '2x Крейсера (3 клетки) — универсальные боевые единицы.',
            '3x Эсминца (2 клетки) — маневренные корабли поддержки.',
            '4x Подлодки (1 клетка) — их сложнее всего найти на карте.'
          ],
          type: 'list'
        },
        {
          title: 'Правила расстановки',
          icon: MapIcon,
          content: [
            'Корабли можно ставить горизонтально или вертикально. Используйте клавишу R или Пробел при перетаскивании для поворота.',
            'ВАЖНОЕ ПРАВИЛО: Между кораблями должно быть расстояние минимум в одну клетку. Они не могут касаться друг друга даже углами.',
            'Вы можете расставить флот вручную для создания хитрых ловушек или использовать кнопку "Авто" для быстрой случайной генерации позиций.'
          ],
          type: 'list'
        },
        {
          title: 'Ход сражения',
          icon: Crosshair,
          content: [
            'Стрельба ведется по очереди. На каждый выстрел дается 60 секунд.',
            'ПОПАДАНИЕ (X): Если вы попали в корабль, вы получаете право на ДОПОЛНИТЕЛЬНЫЙ ХОД. Продолжайте стрелять, пока не промахнетесь.',
            'ПРОМАХ (•): Если выстрел пришелся в пустую клетку, ход переходит к сопернику.',
            'УНИЧТОЖЕНИЕ (☠): Когда все палубы корабля подбиты, он считается уничтоженным. Клетки вокруг него (ореол) автоматически помечаются как "Мимо", так как по правилам там не может быть других кораблей.'
          ],
          type: 'list'
        }
      ]
    },
    coup: {
      title: 'Переворот (Coup)',
      description: 'Игра на блеф, интриги и дедукцию',
      sections: [
        {
          title: 'Суть игры',
          icon: Trophy,
          content: 'Вы — глава влиятельной семьи в коррумпированном городе-государстве. Ваша цель — уничтожить влияние других семей и остаться единственным выжившим. Ваше влияние — это карты персонажей (роли), которые лежат перед вами рубашкой вверх.',
          type: 'text'
        },
        {
          title: 'Ресурсы и Жизни',
          icon: Shield,
          content: [
            'Каждый игрок начинает игру с 2 картами (ролями) и 2 монетами.',
            'Одна карта = Одна жизнь. Потеряв влияние (жизнь), вы обязаны открыть одну из своих карт. Открытая карта выбывает из игры.',
            'Потеряв обе карты, вы выбываете из игры.',
            'Монеты нужны для оплаты сильных действий, таких как Убийство или Переворот.'
          ],
          type: 'list'
        },
        {
          title: 'Роли и Действия',
          icon: Zap,
          content: [
            'ГЕРЦОГ (Duke): Может брать "Налог" (+3 монеты). Блокирует "Иностранную помощь" другим игрокам.',
            'АССАСИН (Assassin): Платит 3 монеты, чтобы заставить жертву потерять карту. Блокируется Графиней.',
            'КАПИТАН (Captain): Крадет 2 монеты у другого игрока. Блокируется другим Капитаном или Послом.',
            'ПОСОЛ (Ambassador): Берет 2 карты из колоды, меняет их на свои (или оставляет свои). Блокирует Кражу.',
            'ГРАФИНЯ (Contessa): Не имеет активного действия, но блокирует попытку Убийства против себя.',
            'ОБЩИЕ ДЕЙСТВИЯ: Доход (+1 монета, нельзя блокировать), Иностр. помощь (+2 монеты, блок Герцогом), Переворот (-7 монет, гарантированное убийство карты, нельзя блокировать).'
          ],
          type: 'list'
        },
        {
          title: 'Искусство Блефа',
          icon: Eye,
          content: 'Это главное правило игры! Вы можете объявить ЛЮБОЕ действие, даже если у вас нет соответствующей карты. Например, сказать "Я Герцог" и взять 3 монеты, имея на руках двух Ассасинов. Но любой игрок может сказать "НЕ ВЕРЮ!" (Challenge). Если вас поймали на лжи — вы теряете карту. Если вы говорили правду (и показали карту) — карту теряет тот, кто вам не поверил (а вы берете новую карту из колоды).',
          type: 'text'
        }
      ]
    },
    minesweeper: {
      title: 'Сапер',
      description: 'Гонка на выживание и логику',
      sections: [
        {
          title: 'Задача',
          icon: Trophy,
          content: 'Очистить минное поле быстрее соперников. В этом режиме игра идет не просто на очки, а на скорость и выживание. Победит тот, кто первым откроет все безопасные клетки или останется единственным "живым" игроком, если остальные подорвутся.',
          type: 'text'
        },
        {
          title: 'Механика',
          icon: Shield,
          content: [
            'Цифра в клетке (1-8) показывает количество мин в радиусе 3x3 вокруг неё.',
            'Если мин вокруг нет, клетка пустая, и откроется целая безопасная область.',
            'Первый клик всегда безопасен — мины генерируются после первого хода, так что смело начинайте!',
            'Ошибка фатальна: нажав на мину, вы немедленно выбываете из раунда.'
          ],
          type: 'list'
        },
        {
          title: 'Управление (PRO)',
          icon: MousePointer2,
          content: [
            'ЛКМ: Открыть клетку.',
            'ПКМ (или долгое нажатие на телефоне): Поставить флаг, чтобы пометить мину.',
            'СКМ (Колесико) или Двойной клик (на телефонах): АККОРД. Если вокруг открытой цифры уже стоит правильное количество флагов, эта функция мгновенно откроет все остальные закрытые клетки вокруг. Это главный инструмент для скоростной игры!'
          ],
          type: 'list'
        },
        {
          title: 'Мультиплеер',
          icon: Clock,
          content: 'Все игроки начинают одновременно на одинаковых картах. Вы видите прогресс соперников в реальном времени (проценты). Если все соперники подорвались на минах, вы автоматически побеждаете как "Последний герой".',
          type: 'text'
        }
      ]
    },
    flager: {
      title: 'Флагер',
      description: 'Викторина с механикой Pixel Match',
      sections: [
        {
          title: 'Как это работает',
          icon: Flag,
          content: 'Вам загадан флаг страны, который скрыт под "шумом". Ваша задача — угадать страну. Но вы не обязаны угадать с первой попытки! В игре используется уникальная механика "Частичного совпадения" (Pixel Match).',
          type: 'text'
        },
        {
          title: 'Pixel Match',
          icon: Target,
          content: 'Вводите названия ЛЮБЫХ стран. Система наложит флаг введенной вами страны на загаданный. Если в какой-то точке пиксели совпадут по цвету — эта часть картинки проявится на экране. Пример: Загадан флаг Франции (Синий-Белый-Красный). Вы вводите "Италия" (Зеленый-Белый-Красный). Белая и Красная полосы совпадут и откроются!',
          type: 'text'
        },
        {
          title: 'Начисление очков',
          icon: Trophy,
          content: [
            'Стартовый банк: 1000 очков в начале раунда.',
            'Штраф за попытку: -50 очков за каждую неверную догадку.',
            'Штраф за время: -10 очков за каждую прошедшую секунду.',
            'Лимит: 10 попыток на раунд.',
            'Цель: Угадать максимально быстро и с минимальным количеством попыток, чтобы сохранить как можно больше очков.'
          ],
          type: 'list'
        },
        {
          title: 'Совет',
          icon: Search,
          content: 'Начинайте с "разноцветных" флагов (например, ЮАР, Сейшелы, ЦАР), чтобы "просканировать" сразу много цветов и понять структуру загаданного флага.',
          type: 'text'
        }
      ]
    },
    spyfall: {
      title: 'Находка для шпиона',
      description: 'Социальная дедукция и разговорный жанр',
      sections: [
        {
          title: 'Сюжет',
          icon: Eye,
          content: 'Все игроки находятся в одной локации (например, "Океанский лайнер", "Полярная станция" или "Театр"). Все знают, где они, кроме одного человека — Шпиона. Шпион видит в своей карте надпись "НЕИЗВЕСТНО".',
          type: 'text'
        },
        {
          title: 'Геймплей',
          icon: RefreshCw,
          content: 'Запускается таймер. Игроки начинают задавать друг другу вопросы по кругу или хаотично. Задача Мирных — по ответам вычислить того, кто не понимает, о чем речь и плавает в деталях. Задача Шпиона — внимательно слушать, анализировать вопросы и ответы, чтобы понять, где он находится, при этом отвечая так, чтобы не вызвать подозрений.',
          type: 'text'
        },
        {
          title: 'Условия победы',
          icon: Trophy,
          content: [
            'ШПИОН ПОБЕЖДАЕТ, ЕСЛИ: 1) Таймер истек, а его не раскрыли. 2) Он нажал кнопку "Назвать локацию" и верно угадал место. 3) Мирные ошиблись и проголосовали против невиновного игрока.',
            'МИРНЫЕ ПОБЕЖДАЮТ, ЕСЛИ: Единогласно проголосуют против реального Шпиона во время фазы обвинения.'
          ],
          type: 'list'
        },
        {
          title: 'Обвинение',
          icon: AlertTriangle,
          content: 'Любой игрок 1 раз за раунд может нажать кнопку "Обвинить". Начинается голосование. Если ВСЕ (кроме обвиняемого) голосуют ЗА — игра заканчивается вердиктом. Если хоть один голосует ПРОТИВ — игра продолжается.',
          type: 'text'
        }
      ]
    }
  },
  en: {
    battleship: {
      title: 'Battleship',
      description: 'Strategic Naval Combat',
      sections: [
        {
          title: 'Objective',
          icon: Trophy,
          content: 'Your goal is to locate and destroy the enemy fleet before they destroy yours. The winner is the first to sink all 10 opponent ships. The game continues until total destruction of one side.',
          type: 'text'
        },
        {
          title: 'Fleet Composition',
          icon: Ship,
          content: [
            '1x Battleship (4 cells) — the largest and most valuable asset.',
            '2x Cruisers (3 cells) — the backbone of your strike force.',
            '3x Destroyers (2 cells) — agile and dangerous.',
            '4x Submarines (1 cell) — hardest to locate.'
          ],
          type: 'list'
        },
        {
          title: 'Deployment Rules',
          icon: MapIcon,
          content: [
            'Ships can be placed horizontally or vertically (Press "R" or Spacebar while dragging).',
            'CRITICAL: Ships cannot touch each other, not even diagonally. A 1-cell gap is mandatory.',
            'Use "Auto" for random placement or deploy manually for strategic defense.'
          ],
          type: 'list'
        },
        {
          title: 'Combat Phase',
          icon: Crosshair,
          content: [
            'Players take turns firing. Turn time limit: 60 seconds.',
            'HIT (X): If you hit a ship, you get a BONUS TURN. Keep firing until you miss.',
            'MISS (•): Turn passes to the opponent.',
            'SUNK (☠): When all decks of a ship are hit, it is destroyed. All surrounding cells are automatically marked as "Miss" to save time and prevent useless shots.'
          ],
          type: 'list'
        }
      ]
    },
    coup: {
      title: 'Coup',
      description: 'Game of Bluff, Intrigue & Deduction',
      sections: [
        {
          title: 'The Core',
          icon: Trophy,
          content: 'You are the head of a family in a corrupt Italian city-state. Destroy the influence of other families. Be the last survivor. Your influence consists of face-down character cards.',
          type: 'text'
        },
        {
          title: 'Life & Money',
          icon: Shield,
          content: [
            'Start with 2 cards and 2 coins.',
            '1 Card = 1 Life. Lose a life -> Reveal a card. Lose both -> You are out.',
            'Coins are ammo for powerful actions (Assassination, Coup).'
          ],
          type: 'list'
        },
        {
          title: 'Roles & Actions',
          icon: Zap,
          content: [
            'DUKE: Tax (+3 coins). Blocks Foreign Aid.',
            'ASSASSIN: Pay 3 coins to kill a card. Blocked by Contessa.',
            'CAPTAIN: Steal 2 coins from another player. Blocked by Captain/Ambassador.',
            'AMBASSADOR: Swap cards with the deck. Blocks Stealing.',
            'CONTESSA: Blocks Assassination.',
            'GENERAL ACTIONS: Income (+1, safe), Foreign Aid (+2, blocked by Duke), Coup (-7, unblockable kill, mandatory at 10+ coins).'
          ],
          type: 'list'
        },
        {
          title: 'Bluffing',
          icon: Eye,
          content: 'This is the heart of the game. You can claim ANY action, regardless of your cards. Claim to be a Duke to take 3 coins? Sure! But anyone can CHALLENGE you. If caught lying, you lose a card. If truthful (and you prove it), the challenger loses a card.',
          type: 'text'
        }
      ]
    },
    minesweeper: {
      title: 'Minesweeper',
      description: 'Speed & Logic Survival',
      sections: [
        {
          title: 'Goal',
          icon: Trophy,
          content: 'Clear the minefield faster than your opponents. In multiplayer, this is a race. The winner is the first to open all safe cells or the last survivor standing.',
          type: 'text'
        },
        {
          title: 'Mechanics',
          icon: Shield,
          content: [
            'Number (1-8): Shows how many mines are in the 8 surrounding cells.',
            'Empty space: No mines around, safe to open.',
            'First Click: Always safe (mines generated after).',
            'One Mistake: Hitting a mine eliminates you instantly.'
          ],
          type: 'list'
        },
        {
          title: 'Pro Controls',
          icon: MousePointer2,
          content: [
            'Left Click: Open cell.',
            'Right Click (or Long Press): Flag a mine.',
            'Middle Click (Wheel) or Double Tap: CHORD. If a number has the correct amount of flags around it, this opens all remaining neighbors instantly. Essential for speedruns.'
          ],
          type: 'list'
        },
        {
          title: 'Multiplayer',
          icon: Clock,
          content: 'You play on identical boards. You see opponents\' progress in % real-time. If all opponents explode, you win by default.',
          type: 'text'
        }
      ]
    },
    flager: {
      title: 'Flager',
      description: 'Pixel Match Geography Quiz',
      sections: [
        {
          title: 'Concept',
          icon: Flag,
          content: 'A country flag is hidden behind "noise". Your job is to guess the country. But you don\'t have to guess blindly! We use the "Pixel Match" mechanic.',
          type: 'text'
        },
        {
          title: 'Pixel Match',
          icon: Target,
          content: 'Type the name of ANY country. The game compares your guess\'s flag with the hidden target. If pixels match in color and position, those parts of the image are revealed. Example: Target is France (Blue-White-Red). You guess "Italy" (Green-White-Red). The White and Red stripes match and reveal!',
          type: 'text'
        },
        {
          title: 'Scoring',
          icon: Trophy,
          content: [
            'Start Bank: 1000 points.',
            'Guess Penalty: -50 points per attempt.',
            'Time Penalty: -10 points per second.',
            'Limit: 10 guesses per round.',
            'Goal: Solve fast with few guesses to keep a high score.'
          ],
          type: 'list'
        },
        {
          title: 'Strategy',
          icon: Search,
          content: 'Start with colorful flags (South Africa, Seychelles) to "scan" for multiple colors at once.',
          type: 'text'
        }
      ]
    },
    spyfall: {
      title: 'Spyfall',
      description: 'Social Deduction & Talk',
      sections: [
        {
          title: 'The Plot',
          icon: Eye,
          content: 'All players are in the same location (e.g., "Space Station"), except one — the Spy. The Spy sees "UNKNOWN". Locals know the place.',
          type: 'text'
        },
        {
          title: 'Gameplay',
          icon: RefreshCw,
          content: 'A timer starts. Players ask each other questions. Locals try to spot the person who is clueless. The Spy listens to clues to figure out the location and blends in.',
          type: 'text'
        },
        {
          title: 'Winning Conditions',
          icon: Trophy,
          content: [
            'SPY WINS IF: 1) Timer runs out without being caught. 2) Guesses the location correctly (action button). 3) Locals vote out an innocent player.',
            'LOCALS WIN IF: They unanimously vote for the real Spy.'
          ],
          type: 'list'
        },
        {
          title: 'Accusation',
          icon: AlertTriangle,
          content: 'Any player can "Accuse" once per round. A vote starts. Unanimous "Guilty" verdict ends the game. Any "Innocent" vote continues the game.',
          type: 'text'
        }
      ]
    }
  }
};