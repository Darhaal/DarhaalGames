/**
 * Public, crawlable game content — the single source of truth for the SEO layer.
 *
 * Deliberately server-safe: no React, no lucide-react, no client components.
 * `src/constants/rules.ts` cannot be reused here because it imports icon
 * components and a `'use client'` module, which would drag the whole client
 * graph into these static pages.
 *
 * Consumed by /games, /games/[slug], their /en counterparts, sitemap.ts and
 * the JSON-LD builders in src/lib/seo.ts.
 */

export type Locale = 'ru' | 'en';

export interface GameFaq {
  q: string;
  a: string;
}

export interface GameContentLocale {
  /** Display name */
  name: string;
  /** One-line hook, used on cards and as the page subtitle */
  tagline: string;
  /** <title> for the detail page (brand suffix appended by the template) */
  metaTitle: string;
  /** <meta name="description"> — aim for 140-160 characters */
  metaDescription: string;
  /** Opening prose paragraphs */
  intro: string[];
  /** Ordered "how to play" steps — also emitted as HowTo JSON-LD */
  howToPlay: string[];
  /** Bullet highlights */
  features: string[];
  /** Tactical advice — the substance players actually search for */
  strategy: string[];
  /** Common mistakes, phrased as things to stop doing */
  mistakes: string[];
  /** Emitted as FAQPage JSON-LD */
  faq: GameFaq[];
}

export interface GameContent {
  slug: string;
  players: { min: number; max: number };
  /** Typical match length in minutes, used for the "duration" facts row */
  playtimeMinutes: number;
  genre: Record<Locale, string>;
  /** Tailwind-friendly accent used by the public cards */
  accent: string;
  locales: Record<Locale, GameContentLocale>;
}

export const GAMES_CONTENT: GameContent[] = [
  {
    slug: 'spyfall',
    players: { min: 3, max: 12 },
    playtimeMinutes: 10,
    genre: { ru: 'Социальная дедукция', en: 'Social deduction' },
    accent: '#7c3aed',
    locales: {
      ru: {
        name: 'Шпион',
        tagline: 'Вычислите шпиона в своих рядах или не выдайте себя.',
        metaTitle: 'Шпион — играть онлайн с друзьями бесплатно',
        metaDescription:
          'Онлайн-игра «Шпион» на 3–12 игроков: все знают локацию, кроме одного. Задавайте вопросы, ищите чужака и голосуйте. Бесплатно, без установки.',
        intro: [
          'Шпион — это разговорная игра на дедукцию и блеф. В начале раунда все участники получают одну и ту же локацию и личную роль внутри неё. Все, кроме одного: шпион не знает, где оказалась компания, и должен это выяснить, не привлекая к себе внимания.',
          'Игроки по очереди задают друг другу вопросы. Вопрос должен быть достаточно конкретным, чтобы поймать шпиона на незнании, но достаточно расплывчатым, чтобы не выдать локацию самому шпиону. Именно это противоречие и делает партию напряжённой.',
          'Побеждает либо команда, если она вычислит и осудит шпиона голосованием, либо шпион — если продержится до конца таймера или сумеет верно назвать локацию.'
        ],
        howToPlay: [
          'Создайте комнату и отправьте друзьям ссылку или шестизначный код.',
          'Выберите тематический набор: школа, универ, офис, хоррор, игры, природа, история, фантастика, спорт, еда и другие.',
          'После старта откройте свою карточку: вы увидите локацию и роль — либо надпись, что вы шпион.',
          'По очереди задавайте вопросы другим игрокам и внимательно слушайте ответы.',
          'Заподозрив кого-то, вынесите обвинение — остальные проголосуют за или против.',
          'Осудите шпиона до конца таймера, чтобы победить. Шпион побеждает, если угадает локацию или дотянет до нуля.'
        ],
        features: [
          'От 3 до 12 игроков в одной комнате',
          '15 тематических наборов, 330 локаций',
          'Настраиваемая длительность раунда',
          'Голосование с подсчётом голосов в реальном времени',
          'Статистика побед за мирных и за шпиона'
        ],
        strategy: [
          'Задавайте вопросы, на которые нельзя ответить односложно. «Тебе тут нравится?» не выдаёт ничего — а «что ты слышишь вокруг себя?» заставляет назвать деталь.',
          'Не начинайте с самых очевидных признаков локации. Если первый же вопрос звучит как «ты в халате?», шпион получает больницу почти даром.',
          'Следите, кому адресуют вопросы. Шпион редко спрашивает первым и охотно перекидывает внимание на других.',
          'Играя за шпиона, отвечайте общими словами и переспрашивайте. Фраза «а ты сам как думаешь?» выигрывает время и звучит естественно.',
          'Обвинение — ресурс, а не эмоция. Ошиблись всей компанией — шпион спокойно досиживает до конца таймера.',
        ],
        mistakes: [
          'Спешат с голосованием на первой же заминке. Человек может просто задуматься, а группа уже потратила попытку.',
          'Называют локацию вслух, чтобы «проверить» соседа. Это подарок шпиону — он только этого и ждал.',
          'Мирные отвечают слишком подробно и фактически описывают локацию вслух.',
        ],
        faq: [
          {
            q: 'Сколько человек нужно для игры в Шпиона?',
            a: 'Минимум трое. Комфортнее всего играть компанией от пяти до восьми человек, максимум — двенадцать.'
          },
          {
            q: 'Нужно ли что-то устанавливать?',
            a: 'Нет. Игра работает прямо в браузере на компьютере и телефоне, установка не требуется.'
          },
          {
            q: 'Можно ли играть бесплатно?',
            a: 'Да, все игры на платформе бесплатны. Для быстрой партии достаточно гостевого входа.'
          },
          {
            q: 'Что делать шпиону, если он угадал локацию?',
            a: 'Шпион может назвать локацию и досрочно закончить раунд в свою пользу. Ошибка означает поражение, поэтому спешить не стоит.'
          }
        ]
      },
      en: {
        name: 'Spyfall',
        tagline: 'Find the spy among you or blend in without being caught.',
        metaTitle: 'Spyfall — play online with friends for free',
        metaDescription:
          'Play Spyfall online with 3–12 players: everyone knows the location except one. Ask questions, expose the outsider, vote. Free, no download.',
        intro: [
          'Spyfall is a conversation game built on deduction and bluffing. At the start of a round every player receives the same location and a personal role within it. Everyone except one: the spy has no idea where the group is and has to work it out without drawing attention.',
          'Players take turns questioning each other. A good question is specific enough to catch someone who does not know the location, yet vague enough not to hand that location to the spy. That tension is what makes each round tense.',
          'The group wins by identifying and convicting the spy through a vote. The spy wins by surviving until the timer runs out, or by correctly naming the location.'
        ],
        howToPlay: [
          'Create a room and share the link or the six-character code with your friends.',
          'Pick a themed pack: school, university, office, horror, gaming, nature, history, sci-fi, sports, food and more.',
          'Once the round starts, open your card to see the location and your role — or the note that you are the spy.',
          'Take turns asking other players questions and listen closely to the answers.',
          'When you suspect someone, call them out and let the table vote.',
          'Convict the spy before time runs out to win. The spy wins by guessing the location or surviving the timer.'
        ],
        features: [
          'Three to twelve players per room',
          '15 themed packs, 330 locations',
          'Adjustable round length',
          'Live vote tallying',
          'Separate win statistics for civilians and the spy'
        ],
        strategy: [
          'Ask questions that cannot be answered in one word. "Do you like it here?" reveals nothing; "what can you hear around you?" forces a concrete detail.',
          'Do not open with the most obvious feature of the location. If your first question is "are you wearing a gown?", you have handed the spy a hospital.',
          'Watch who people question. A spy rarely asks first and is happy to redirect attention elsewhere.',
          'As the spy, answer in generalities and ask back. "What do you reckon?" buys time and sounds natural.',
          'An accusation is a resource, not a reaction. Convict the wrong person and the spy simply runs out the clock.',
        ],
        mistakes: [
          'Voting at the first hesitation. Someone may just be thinking, and the group has already spent its attempt.',
          'Naming the location out loud to test someone. That is exactly what the spy was waiting for.',
          'Civilians answering so precisely that they describe the location for everyone, spy included.',
        ],
        faq: [
          {
            q: 'How many players do you need for Spyfall?',
            a: 'Three at minimum. The game is at its best with five to eight players, and supports up to twelve.'
          },
          {
            q: 'Do I need to install anything?',
            a: 'No. The game runs directly in the browser on desktop and mobile, with nothing to install.'
          },
          {
            q: 'Is it free to play?',
            a: 'Yes, every game on the platform is free. Guest sign-in is enough for a quick match.'
          },
          {
            q: 'What happens if the spy guesses the location?',
            a: 'The spy can name the location to end the round early and win it. Guessing wrong loses the round, so timing matters.'
          }
        ]
      }
    }
  },
  {
    slug: 'minesweeper',
    players: { min: 1, max: 4 },
    playtimeMinutes: 10,
    genre: { ru: 'Головоломка', en: 'Puzzle' },
    accent: '#dc2626',
    locales: {
      ru: {
        name: 'Сапёр',
        tagline: 'Скоростное разминирование. Кто быстрее очистит поле?',
        metaTitle: 'Сапёр онлайн — соло и на скорость',
        metaDescription:
          'Классический Сапёр в браузере: одиночная игра и гонка до четырёх игроков на одинаковых полях. Аккорд, флаги, зум, настраиваемая сложность.',
        intro: [
          'Сапёр — логическая головоломка, в которой нужно вскрыть все безопасные клетки поля, не подорвавшись на мине. Цифра в открытой клетке показывает, сколько мин находится в восьми соседних клетках, и вся игра строится на выводах из этих подсказок.',
          'Здесь к классике добавлен мультиплеер: до четырёх игроков получают одинаковые поля и разминируют их одновременно. Побеждает тот, кто первым закончит — или последний выживший, если остальные подорвались.',
          'Первый клик всегда безопасен: поле генерируется после него, поэтому проиграть на первом же ходу невозможно.'
        ],
        howToPlay: [
          'Выберите размер поля и количество мин или возьмите готовый уровень сложности.',
          'Левый клик открывает клетку, правый — ставит флаг на подозрительной мине.',
          'Читайте цифры: число показывает, сколько мин граничит с этой клеткой.',
          'Левый клик по открытой цифре делает аккорд — открывает соседние клетки, если рядом уже стоит нужное число флагов.',
          'Масштабируйте поле колесом мыши или с клавиатуры, если играете на большой сетке.',
          'Откройте все безопасные клетки, чтобы выиграть партию.'
        ],
        features: [
          'Одиночная игра и мультиплеер до четырёх человек',
          'Одинаковые поля для всех участников гонки',
          'Аккорд по левому клику и удобный зум',
          'Первый клик гарантированно безопасен',
          'Поля до 100×100 без потери отзывчивости',
          'Отдельная статистика для соло и мультиплеера'
        ],
        strategy: [
          'Начинайте с углов и краёв: там у клеток меньше соседей, и цифры дают более однозначные выводы.',
          'Работайте не с отдельной клеткой, а с парой соседних цифр. Разница между ними часто указывает мину точнее, чем каждая по отдельности.',
          'Ставьте флаги сразу, как уверены. Аккорд по цифре экономит десятки кликов, но работает только по выставленным флагам.',
          'Если позиция не решается логикой, ищите другой участок поля вместо угадывания — почти всегда где-то есть однозначный ход.',
          'В гонке важна не идеальность, а темп: открытая пустая область даёт больше информации, чем аккуратно обставленный флагами угол.',
        ],
        mistakes: [
          'Ставят флаги на всё подозрительное. Лишний флаг ломает аккорд и приводит к взрыву на ровном месте.',
          'Угадывают в середине поля, когда с краю оставался очевидный ход.',
          'Забывают, что первый клик безопасен, и тратят время на «удачное» начало.',
        ],
        faq: [
          {
            q: 'Можно ли играть в Сапёра одному?',
            a: 'Да. Одиночный режим доступен без соперников, результат записывается в личную статистику.'
          },
          {
            q: 'Что такое аккорд?',
            a: 'Если рядом с открытой цифрой уже стоит столько флагов, сколько она показывает, клик по ней открывает все оставшиеся соседние клетки разом.'
          },
          {
            q: 'Можно ли проиграть на первом ходу?',
            a: 'Нет. Мины расставляются после первого клика, поэтому он всегда безопасен.'
          },
          {
            q: 'Играют ли все на одном поле?',
            a: 'В мультиплеере у каждого своё поле, но сгенерированы они одинаково — это честная гонка на скорость.'
          }
        ]
      },
      en: {
        name: 'Minesweeper',
        tagline: 'Speed defusal. Who clears the grid first?',
        metaTitle: 'Minesweeper online — solo or race',
        metaDescription:
          'Classic Minesweeper in your browser: solo play plus a race for up to four players on identical grids. Chord, flags, zoom and custom difficulty.',
        intro: [
          'Minesweeper is a logic puzzle about uncovering every safe cell without detonating a mine. A revealed number tells you how many mines sit in the eight neighbouring cells, and the entire game is built on reasoning from those clues.',
          'This version adds multiplayer: up to four players get identically generated grids and clear them at the same time. The first to finish wins — or the last one standing, if everyone else detonates.',
          'The first click is always safe. The board is generated after it, so losing on move one is impossible.'
        ],
        howToPlay: [
          'Pick a grid size and mine count, or start from a difficulty preset.',
          'Left click reveals a cell, right click plants a flag on a suspected mine.',
          'Read the numbers: each one counts the mines touching that cell.',
          'Left click a revealed number to chord — it opens the remaining neighbours once the flag count matches.',
          'Zoom with the scroll wheel or the keyboard when playing on a large grid.',
          'Reveal every safe cell to win the round.'
        ],
        features: [
          'Solo play and multiplayer for up to four',
          'Identical grids for every racer',
          'Left-click chord and smooth zoom',
          'Guaranteed safe first click',
          'Grids up to 100×100 with no loss of responsiveness',
          'Separate solo and multiplayer statistics'
        ],
        strategy: [
          'Start from corners and edges: those cells have fewer neighbours, so the numbers resolve more definitively.',
          'Read pairs of adjacent numbers rather than single cells. The difference between them often pins a mine that neither one does alone.',
          'Flag as soon as you are certain. Chording saves dozens of clicks, but only works off flags you have actually placed.',
          'When a position will not resolve logically, move to another part of the grid instead of guessing — there is almost always a certain move somewhere.',
          'In a race, tempo beats perfection: opening an empty region yields more information than meticulously flagging one corner.',
        ],
        mistakes: [
          'Flagging everything that looks suspicious. A stray flag breaks chording and detonates a cell you had already solved.',
          'Guessing in the middle while an obvious move was still sitting on the edge.',
          'Forgetting the first click is always safe and hunting for a lucky opening.',
        ],
        faq: [
          {
            q: 'Can I play Minesweeper alone?',
            a: 'Yes. Solo mode needs no opponents and still records your result in your personal statistics.'
          },
          {
            q: 'What is chording?',
            a: 'When a revealed number already has that many flags around it, clicking it opens all remaining neighbouring cells at once.'
          },
          {
            q: 'Can I lose on the first click?',
            a: 'No. Mines are placed after your first click, so it is always safe.'
          },
          {
            q: 'Does everyone play on the same board?',
            a: 'In multiplayer each player has their own grid, generated identically — a fair race on equal terms.'
          }
        ]
      }
    }
  },
  {
    slug: 'flager',
    players: { min: 1, max: 4 },
    playtimeMinutes: 10,
    genre: { ru: 'Викторина', en: 'Quiz' },
    accent: '#0891b2',
    locales: {
      ru: {
        name: 'Флагер',
        tagline: 'Географическая викторина. Угадай флаг по пикселям.',
        metaTitle: 'Флагер — викторина «угадай флаг»',
        metaDescription:
          'Географическая викторина на флаги с механикой Pixel Match: флаг проявляется постепенно, чем раньше ответишь — тем больше очков. Соло и до 4 игроков.',
        intro: [
          'Флагер — викторина на знание флагов стран мира. Флаг не показывают целиком: он проявляется пиксель за пикселем, и чем раньше вы его узнаете, тем больше очков получите за раунд.',
          'Механика Pixel Match превращает обычный тест в гонку интуиции. Опытный игрок ловит страну по паре характерных цветовых пятен, новичок дожидается узнаваемого силуэта — и оба остаются в игре.',
          'Играть можно в одиночку, тренируя географию, или компанией до четырёх человек: все получают одну и ту же цепочку флагов, а очки суммируются по раундам.'
        ],
        howToPlay: [
          'Выберите количество раундов и длительность каждого из них.',
          'Смотрите, как флаг постепенно проявляется из пикселей.',
          'Начните вводить название страны — подсказки появятся сразу под полем.',
          'Выбирайте подсказку стрелками и Tab или введите ответ целиком.',
          'Отвечайте как можно раньше: скорость напрямую влияет на количество очков.',
          'После всех раундов сравните итоговые очки с соперниками.'
        ],
        features: [
          'Более двухсот стран и территорий',
          'Механика постепенного проявления Pixel Match',
          'Автодополнение с управлением с клавиатуры',
          'Соло-тренировка и мультиплеер до четырёх игроков',
          'Настраиваемое число раундов и таймер',
          'История ответов и точность в статистике'
        ],
        strategy: [
          'Смотрите на цвета раньше, чем на рисунок. Сочетание полос сужает круг до нескольких стран задолго до того, как флаг проявится.',
          'Учите флаги группами: скандинавские кресты, панарабские и панафриканские цвета, британские кантоны. Внутри группы отличие обычно в одной детали.',
          'Начинайте вводить ответ, как только появилась догадка — подсказки отфильтруют похожие названия быстрее, чем вы вспомните точное написание.',
          'Не тяните до полного проявления: очки убывают со временем, и уверенный ответ на середине выгоднее идеального в конце.',
          'Ошибка стоит попытки, но не очков. Если вариантов два — лучше проверить оба, чем ждать.',
        ],
        mistakes: [
          'Ждут «стопроцентной» картинки и теряют больше очков, чем стоила бы ошибка.',
          'Путают похожие пары — Чад и Румыния, Индонезия и Монако, Нидерланды и Люксембург. Их стоит выучить отдельно.',
          'Печатают название целиком вместо того, чтобы выбрать из подсказок.',
        ],
        faq: [
          {
            q: 'Как начисляются очки?',
            a: 'Чем меньше пикселей открылось к моменту верного ответа, тем больше очков за раунд. За ошибку очки не снимаются, но время идёт.'
          },
          {
            q: 'Сколько стран в игре?',
            a: 'В базе более двухсот стран и территорий, включая редко встречающиеся флаги.'
          },
          {
            q: 'Можно ли тренироваться в одиночку?',
            a: 'Да, соло-режим доступен всегда и ведёт отдельную статистику точности.'
          },
          {
            q: 'Нужно ли писать название без ошибок?',
            a: 'Достаточно начать вводить название и выбрать нужный вариант из подсказок — опечатки не помешают.'
          }
        ]
      },
      en: {
        name: 'Flager',
        tagline: 'Geography quiz. Guess the flag pixel by pixel.',
        metaTitle: 'Flager — guess the country flag quiz online',
        metaDescription:
          'A flag quiz with a Pixel Match twist: the flag resolves gradually and answering earlier scores higher. Play solo or with up to four players.',
        intro: [
          'Flager is a quiz about the flags of the world. The flag is never shown outright — it resolves pixel by pixel, and the sooner you recognise it, the more points the round is worth.',
          'The Pixel Match mechanic turns a plain test into a race of intuition. Experienced players catch a country from a couple of characteristic colour patches, newcomers wait for a recognisable shape, and both stay in the game.',
          'Play solo to drill your geography, or with up to four people: everyone gets the same chain of flags and points accumulate across rounds.'
        ],
        howToPlay: [
          'Choose how many rounds to play and how long each one lasts.',
          'Watch the flag emerge gradually from the pixels.',
          'Start typing a country name — suggestions appear right below the field.',
          'Pick a suggestion with the arrow keys and Tab, or type the full answer.',
          'Answer as early as you can: speed feeds directly into your score.',
          'After the final round, compare your total with everyone else.'
        ],
        features: [
          'Over two hundred countries and territories',
          'Gradual Pixel Match reveal',
          'Autocomplete with full keyboard control',
          'Solo practice and multiplayer for up to four',
          'Configurable round count and timer',
          'Answer history and accuracy tracking'
        ],
        strategy: [
          'Read the colours before the shapes. A stripe combination narrows the field to a handful of countries long before the flag resolves.',
          'Learn flags in families: Nordic crosses, pan-Arab and pan-African palettes, British cantons. Within a family the difference is usually one detail.',
          'Start typing the moment you have a guess — the suggestions filter lookalike names faster than you can recall the exact spelling.',
          'Do not wait for a full reveal: points decay with time, and a confident answer halfway through beats a perfect one at the end.',
          'A wrong guess costs an attempt, not points. With two candidates, test both rather than stalling.',
        ],
        mistakes: [
          'Waiting for a certain image and losing more points than a wrong guess would have cost.',
          'Confusing the classic lookalikes — Chad and Romania, Indonesia and Monaco, the Netherlands and Luxembourg. Learn those pairs deliberately.',
          'Typing the full name instead of picking from the suggestions.',
        ],
        faq: [
          {
            q: 'How is scoring calculated?',
            a: 'The fewer pixels revealed when you answer correctly, the more the round is worth. A wrong guess costs no points, but the clock keeps running.'
          },
          {
            q: 'How many countries are included?',
            a: 'More than two hundred countries and territories, including plenty of rarely seen flags.'
          },
          {
            q: 'Can I practise on my own?',
            a: 'Yes, solo mode is always available and keeps its own accuracy statistics.'
          },
          {
            q: 'Do I have to spell the name perfectly?',
            a: 'No. Start typing and pick the right option from the suggestions — typos will not block you.'
          }
        ]
      }
    }
  },
  {
    slug: 'battleship',
    players: { min: 2, max: 2 },
    playtimeMinutes: 15,
    genre: { ru: 'Стратегия', en: 'Strategy' },
    accent: '#1d4ed8',
    locales: {
      ru: {
        name: 'Морской бой',
        tagline: 'Классическая тактика. Потопи флот противника.',
        metaTitle: 'Морской бой онлайн — игра на двоих',
        metaDescription:
          'Морской бой на двоих в браузере: расстановка флота перетаскиванием, автоматическая расстановка, дополнительный ход за попадание и таймер на выстрел.',
        intro: [
          'Морской бой — дуэльная игра на дедукцию и удачу, знакомая почти каждому по школьным тетрадям. Два игрока расставляют флот на своих полях и по очереди обстреливают поле соперника, пытаясь первым потопить все десять кораблей.',
          'Флот состоит из линкора на четыре палубы, двух крейсеров, трёх эсминцев и четырёх подлодок. Корабли не могут соприкасаться даже углами, поэтому грамотная расстановка — это уже половина партии.',
          'Попадание даёт право на дополнительный выстрел, так что удачная серия способна решить исход поединка за один ход. На каждый выстрел отводится минута.'
        ],
        howToPlay: [
          'Создайте комнату и отправьте сопернику ссылку — второй игрок присоединится по ней.',
          'Расставьте флот: перетащите корабли с верфи или нажмите «Авто» для случайной расстановки.',
          'Поворачивайте корабль клавишей R, пробелом или правым кликом по полю.',
          'Соблюдайте зазор: между кораблями нужна минимум одна пустая клетка.',
          'Подтвердите готовность и стреляйте по полю соперника, выбирая клетку.',
          'За попадание получаете дополнительный ход, за промах ход переходит сопернику.',
          'Потопите все десять кораблей противника, чтобы выиграть.'
        ],
        features: [
          'Дуэль один на один по прямой ссылке',
          'Расстановка перетаскиванием и кнопка автоматической расстановки',
          'Проверка правил расстановки в реальном времени',
          'Дополнительный ход за попадание',
          'Автоматическая пометка клеток вокруг потопленного корабля',
          'Таймер на ход и журнал боя'
        ],
        strategy: [
          'Не жмите корабли к краям. Край кажется безопасным, но опытный соперник обстреливает периметр в первую очередь.',
          'Разносите крупные корабли. Линкор и крейсер рядом превращают одно попадание в цепочку находок.',
          'Ищите по диагонали с шагом в две клетки — такая сетка гарантированно задевает любой корабль от двух палуб.',
          'Попали — добивайте вдоль оси. Сначала проверьте две клетки по горизонтали, и только потом по вертикали.',
          'Помните про ореол: после потопления соседние клетки автоматически пусты, и обстреливать их бессмысленно.',
        ],
        mistakes: [
          'Ставят весь флот в одной половине поля — после первых попаданий остальное вычисляется почти без промахов.',
          'Стреляют подряд по строкам. Половина выстрелов уходит в клетки, где корабль поместиться не мог.',
          'Забывают про дополнительный ход за попадание и останавливаются, не добив корабль.',
        ],
        faq: [
          {
            q: 'Сколько кораблей в флоте?',
            a: 'Десять: один линкор на четыре клетки, два крейсера по три, три эсминца по две и четыре однопалубные подлодки.'
          },
          {
            q: 'Могут ли корабли стоять вплотную?',
            a: 'Нет. Между кораблями должна быть хотя бы одна свободная клетка, касание углами тоже запрещено.'
          },
          {
            q: 'Что происходит при попадании?',
            a: 'Попадание даёт дополнительный выстрел. Ход переходит сопернику только после промаха.'
          },
          {
            q: 'Как пригласить друга?',
            a: 'Скопируйте ссылку на комнату или продиктуйте шестизначный код — присоединиться можно и тем, и другим способом.'
          }
        ]
      },
      en: {
        name: 'Battleship',
        tagline: 'Classic tactics. Sink the enemy fleet.',
        metaTitle: 'Battleship online — two players',
        metaDescription:
          'Two-player Battleship in your browser: drag-and-drop fleet placement, auto-arrange, an extra turn for every hit, and a timer on each shot.',
        intro: [
          'Battleship is a duel of deduction and luck that most people first met in the back of a school notebook. Two players lay out a fleet on their own grid and take turns shelling the opponent, racing to sink all ten ships first.',
          'The fleet is one four-cell battleship, two cruisers, three destroyers and four submarines. Ships may not touch, not even at the corners, so a smart layout is already half the match.',
          'A hit earns another shot, which means a good streak can decide the duel in a single turn. Each shot is on a one-minute clock.'
        ],
        howToPlay: [
          'Create a room and send your opponent the link — they join straight through it.',
          'Lay out your fleet: drag ships from the dock or hit Auto for a random arrangement.',
          'Rotate a ship with R, Space, or a right click on the board.',
          'Mind the spacing: every ship needs at least one empty cell around it.',
          'Confirm you are ready, then pick a cell to fire on the opponent grid.',
          'A hit grants an extra turn; a miss passes the turn to your opponent.',
          'Sink all ten enemy ships to win.'
        ],
        features: [
          'One-on-one duel over a direct link',
          'Drag-and-drop placement plus an auto-arrange button',
          'Live validation of placement rules',
          'Extra turn on every hit',
          'Cells around a sunken ship marked automatically',
          'Per-turn timer and a full battle log'
        ],
        strategy: [
          'Keep ships off the edges. The rim feels safe, but an experienced opponent sweeps the perimeter first.',
          'Spread the big ships out. A battleship next to a cruiser turns one hit into a chain of discoveries.',
          'Search on a diagonal with a two-cell step — that lattice is guaranteed to touch any ship of two decks or more.',
          'On a hit, finish along the axis. Probe the two horizontal neighbours first, then the vertical ones.',
          'Remember the halo: once a ship sinks, the surrounding cells are known to be empty and are not worth a shot.',
        ],
        mistakes: [
          'Placing the whole fleet in one half of the board — after the first hits the rest follows almost without misses.',
          'Firing row by row. Half those shots land where a ship could never have fitted.',
          'Forgetting a hit grants another shot, and stopping before the ship is finished.',
        ],
        faq: [
          {
            q: 'How many ships are in the fleet?',
            a: 'Ten: one four-cell battleship, two three-cell cruisers, three two-cell destroyers and four single-cell submarines.'
          },
          {
            q: 'Can ships be placed next to each other?',
            a: 'No. Every ship needs at least one free cell around it, and touching at the corners is not allowed either.'
          },
          {
            q: 'What happens when I hit a ship?',
            a: 'A hit gives you another shot. The turn only passes to your opponent when you miss.'
          },
          {
            q: 'How do I invite a friend?',
            a: 'Copy the room link or read out the six-character code — either one lets them join.'
          }
        ]
      }
    }
  },
  {
    slug: 'coup',
    players: { min: 2, max: 6 },
    playtimeMinutes: 15,
    genre: { ru: 'Карточная игра', en: 'Card game' },
    accent: '#b45309',
    locales: {
      ru: {
        name: 'Переворот',
        tagline: 'Блеф, интриги и влияние. Останься последним.',
        metaTitle: 'Переворот (Coup) — игра на блеф',
        metaDescription:
          'Карточная игра «Переворот» на 2–6 игроков: пять ролей, блеф, блокировки и разоблачения. Лишите соперников влияния и останьтесь последним.',
        intro: [
          'Переворот — быстрая карточная игра о блефе и дедукции. Каждый игрок возглавляет влиятельную семью в коррумпированном городе-государстве и стремится лишить влияния всех остальных.',
          'Влияние — это две закрытые карты ролей. Заявить можно любую роль, даже ту, которой у вас нет: соперники вправе усомниться, и тогда лжец теряет карту. Но ошибочное обвинение стоит карты обвинителю.',
          'В колоде пять ролей: Герцог, Ассасин, Капитан, Посол и Графиня. Каждая даёт своё действие или блокировку, а вся партия строится на том, во что поверят остальные.'
        ],
        howToPlay: [
          'Соберите от двух до шести игроков в комнате.',
          'Каждый получает две закрытые карты ролей и две монеты.',
          'В свой ход выберите действие: доход, иностранная помощь, налог, кража, убийство, обмен или переворот.',
          'Заявляя роль, вы можете блефовать — карта на руках необязательна.',
          'Сомневаетесь в сопернике? Разоблачите его: лжец теряет карту, но ошибка стоит карты вам.',
          'Накопив семь монет, вы обязаны совершить переворот — его нельзя заблокировать.',
          'Потеряв обе карты, игрок выбывает. Последний оставшийся побеждает.'
        ],
        features: [
          'От двух до шести игроков',
          'Пять ролей с уникальными действиями и блокировками',
          'Полная цепочка заявок, блоков и разоблачений',
          'Таймер хода и журнал всех действий',
          'Вход в комнату по прямой ссылке'
        ],
        strategy: [
          'Считайте заявленные роли. В колоде по три карты каждой — четвёртый «Герцог» за столом всегда блеф.',
          'Следите за монетами соперников. Семь монет означают неизбежный переворот, и к этому моменту нужно решить, кого он ударит.',
          'Блефуйте ролью, которую никто ещё не заявлял. Чем реже роль звучала, тем дешевле в неё поверят.',
          'Разоблачение — обоюдная ставка. Обвиняйте, когда карта соперника вам нужна, а не когда просто кажется.',
          'Графиню выгодно держать в тайне. Заявленная вслух, она защищает один раз, необъявленная — сдерживает саму мысль об убийстве.',
        ],
        mistakes: [
          'Копят монеты до десяти, не замечая, что стали главной мишенью стола.',
          'Разоблачают наугад в начале партии, теряя карту там, где информации ещё нет.',
          'Заявляют одну и ту же роль весь матч — она перестаёт быть блефом и становится приметой.',
        ],
        faq: [
          {
            q: 'Можно ли блефовать в Перевороте?',
            a: 'Не просто можно — на этом держится вся игра. Заявить разрешено любую роль, риск лишь в том, что вас разоблачат.'
          },
          {
            q: 'Что происходит при разоблачении?',
            a: 'Если игрок блефовал, он теряет карту влияния. Если роль у него действительно была, карту теряет тот, кто обвинял.'
          },
          {
            q: 'Что делает каждая роль?',
            a: 'Герцог берёт налог и блокирует помощь, Ассасин убивает за три монеты, Капитан крадёт монеты, Посол меняет карты, Графиня блокирует убийство.'
          },
          {
            q: 'Когда переворот обязателен?',
            a: 'Как только у вас накопилось десять монет и больше — в этот ход вы обязаны совершить переворот.'
          }
        ]
      },
      en: {
        name: 'Coup',
        tagline: 'Bluff, intrigue, influence. Be the last one standing.',
        metaTitle: 'Coup — the bluffing card game online',
        metaDescription:
          'Play Coup online with 2–6 players: five roles, bluffing, blocks and challenges. Strip your rivals of influence and be the last one standing.',
        intro: [
          'Coup is a fast card game of bluffing and deduction. Each player heads an influential family in a corrupt city-state and works to strip everyone else of their influence.',
          'Influence is two face-down role cards. You may claim any role, including one you do not hold — but rivals can challenge you, and a caught liar loses a card. A wrong challenge costs the challenger a card instead.',
          'The deck holds five roles: Duke, Assassin, Captain, Ambassador and Contessa. Each grants an action or a block, and the whole match turns on what the table is willing to believe.'
        ],
        howToPlay: [
          'Gather two to six players in a room.',
          'Everyone starts with two face-down role cards and two coins.',
          'On your turn pick an action: income, foreign aid, tax, steal, assassinate, exchange or coup.',
          'When you claim a role you may be bluffing — you do not need the card in hand.',
          'Doubt an opponent? Challenge them: a liar loses a card, but a wrong call costs you one.',
          'Once you hold ten coins you must launch a coup, and a coup cannot be blocked.',
          'Lose both cards and you are out. The last player standing wins.'
        ],
        features: [
          'Two to six players',
          'Five roles with distinct actions and blocks',
          'Full claim, block and challenge chains',
          'Turn timer and a complete action log',
          'Join a room straight from a link'
        ],
        strategy: [
          'Count the claimed roles. There are three of each in the deck, so a fourth Duke at the table is always a bluff.',
          'Watch the coins. Seven means a coup is coming, and by then you should know who it lands on.',
          'Bluff a role nobody has claimed yet. The rarer it has been at the table, the cheaper it is to be believed.',
          'A challenge is a two-way bet. Call when you need that card gone, not when something merely feels off.',
          'Keep the Contessa quiet. Announced, she blocks one assassination; unannounced, she discourages the thought entirely.',
        ],
        mistakes: [
          'Hoarding coins to ten without noticing you became the obvious target.',
          'Challenging blindly early on and losing a card before any information exists.',
          'Claiming the same role all match — it stops being a bluff and becomes a tell.',
        ],
        faq: [
          {
            q: 'Can you bluff in Coup?',
            a: 'Bluffing is the whole game. You may claim any role at all — the only risk is being challenged.'
          },
          {
            q: 'What happens on a challenge?',
            a: 'If the player was bluffing, they lose an influence card. If they genuinely held the role, the challenger loses one instead.'
          },
          {
            q: 'What does each role do?',
            a: 'Duke takes tax and blocks foreign aid, Assassin kills for three coins, Captain steals coins, Ambassador exchanges cards, Contessa blocks assassination.'
          },
          {
            q: 'When is a coup mandatory?',
            a: 'The moment you hold ten coins or more, you must launch a coup on that turn.'
          }
        ]
      }
    }
  }
];

/**
 * When the public copy in this file last actually changed (YYYY-MM-DD).
 *
 * This is the sitemap's `lastmod`. It must NOT be a build timestamp: stamping
 * every URL with "now" on each deploy claims the whole site changed whenever
 * anything ships, and search engines respond by ignoring the field. Bump this
 * by hand when the wording, the games or the FAQs change — not for styling or
 * unrelated code.
 */
export const CONTENT_REVISION = '2026-08-20';

/** Every public game slug, in the order they should appear on the hub page. */
export const GAME_SLUGS = GAMES_CONTENT.map((g) => g.slug);

/** Look up a game by slug; returns undefined for unknown slugs (→ notFound). */
export const getGameContent = (slug: string): GameContent | undefined =>
  GAMES_CONTENT.find((g) => g.slug === slug);

/* -------------------------------------------------------------------------- */
/* Page-level copy                                                            */
/*                                                                            */
/* The root and the hub deliberately say different things. `/` explains the   */
/* platform — what it is, how a room works, why nothing is installed. `/games`*/
/* helps you choose between the five. Giving them the same text would make    */
/* two of our own pages compete for the same query.                           */
/* -------------------------------------------------------------------------- */

export interface PageSection {
  title: string;
  body: string;
}

export interface HomeCopy {
  heroTitle: string;
  heroLead: string;
  about: string[];
  steps: PageSection[];
  faq: GameFaq[];
  gamesTitle: string;
  gamesLead: string;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
}

export interface HubCopy {
  intro: string[];
  chooseTitle: string;
  choose: PageSection[];
  faq: GameFaq[];
}

export const HOME_CONTENT: Record<Locale, HomeCopy> = {
  ru: {
    heroTitle: 'Игры с друзьями прямо в браузере',
    heroLead:
      'Пять настольных и логических игр для компании. Создайте комнату, отправьте ссылку — и играйте. Ничего скачивать не нужно, регистрация не обязательна.',
    about: [
      'Darhaal Games — платформа для тех вечеров, когда все в разных городах, а поиграть вместе хочется. Здесь нет лаунчеров, установки и обязательных аккаунтов: игра живёт по ссылке, которую можно просто кинуть в чат.',
      'Каждая комната — это отдельная партия со своими настройками. Хост выбирает игру, число игроков, длительность раунда и при желании ставит пароль. Остальные заходят по ссылке или по шестизначному коду.',
      'Партии рассчитаны на 10–15 минут: столько, чтобы успеть сыграть в перерыве или несколько раз подряд за вечер. Прогресс, статистика и достижения сохраняются, если войти в аккаунт, но попробовать можно и гостем.'
    ],
    gamesTitle: 'Во что можно сыграть',
    gamesLead: 'Пять игр: от разговорной дедукции на всю компанию до дуэли на двоих и логики в одиночку.',
    steps: [
      {
        title: 'Создайте комнату',
        body: 'Выберите игру и настройте партию: сколько игроков, сколько длится раунд, нужен ли пароль. На всё уходит несколько секунд.'
      },
      {
        title: 'Позовите друзей',
        body: 'Скопируйте ссылку на комнату или продиктуйте шестизначный код. Присоединиться можно и тем, и другим способом, с телефона или компьютера.'
      },
      {
        title: 'Играйте',
        body: 'Партия синхронизируется в реальном времени: ходы, таймеры и результаты видны всем сразу. Отключившийся игрок успевает вернуться, прежде чем его исключат.'
      }
    ],
    ctaTitle: 'Готовы начать?',
    ctaText: 'Создайте комнату за пару секунд и позовите друзей по ссылке.',
    ctaButton: 'Играть',
    faq: [
      {
        q: 'Нужно ли регистрироваться, чтобы поиграть?',
        a: 'Нет. Гостевой вход открывает все игры сразу. Аккаунт нужен только чтобы сохранять статистику, достижения и свою аватарку.'
      },
      {
        q: 'Нужно ли что-то скачивать?',
        a: 'Нет. Всё работает в браузере на компьютере и телефоне — устанавливать ничего не требуется.'
      },
      {
        q: 'Сколько человек можно позвать?',
        a: 'Зависит от игры: Морской бой рассчитан на двоих, Сапёр и Флагер — до четырёх, Переворот — до шести, Шпион — до двенадцати.'
      },
      {
        q: 'Это бесплатно?',
        a: 'Да, все игры бесплатны и без рекламы внутри партии.'
      },
      {
        q: 'Как пригласить друга в уже созданную комнату?',
        a: 'Отправьте ему ссылку на комнату или продиктуйте её код — он попадёт сразу в вашу партию.'
      }
    ]
  },
  en: {
    heroTitle: 'Play with friends right in the browser',
    heroLead:
      'Five board and logic games for a group. Create a room, share the link, play. Nothing to download, no account required.',
    about: [
      'Darhaal Games is for the evenings when everyone is in a different city and you still want to play together. No launchers, no installs, no mandatory accounts: a game lives behind a link you can paste into a chat.',
      'Each room is its own match with its own settings. The host picks the game, the player count, the round length, and optionally a password. Everyone else joins by link or by a six-character code.',
      'Matches run 10–15 minutes — long enough to fit into a break, short enough to play several in an evening. Stats and achievements are saved once you sign in, but you can try everything as a guest first.'
    ],
    gamesTitle: 'What you can play',
    gamesLead: 'Five games, from group-wide conversational deduction to a two-player duel and solo logic.',
    steps: [
      {
        title: 'Create a room',
        body: 'Pick a game and set the match up: how many players, how long a round lasts, whether it needs a password. It takes seconds.'
      },
      {
        title: 'Invite your friends',
        body: 'Copy the room link or read out the six-character code. Either one works, from a phone or a desktop.'
      },
      {
        title: 'Play',
        body: 'The match syncs in real time: moves, timers and results appear for everyone at once. A player who drops out has time to reconnect before being removed.'
      }
    ],
    ctaTitle: 'Ready to play?',
    ctaText: 'Create a room in seconds and invite your friends with a link.',
    ctaButton: 'Play',
    faq: [
      {
        q: 'Do I need an account to play?',
        a: 'No. Guest sign-in opens every game immediately. An account only matters if you want your statistics, achievements and custom avatar saved.'
      },
      {
        q: 'Is there anything to download?',
        a: 'No. Everything runs in the browser on desktop and mobile, with nothing to install.'
      },
      {
        q: 'How many people can join?',
        a: 'It depends on the game: Battleship is for two, Minesweeper and Flager take up to four, Coup up to six, and Spyfall up to twelve.'
      },
      {
        q: 'Is it free?',
        a: 'Yes, every game is free and there are no ads inside a match.'
      },
      {
        q: 'How do I invite someone to a room I already made?',
        a: 'Send them the room link or read out its code — they land straight in your match.'
      }
    ]
  }
};

export const HUB_CONTENT: Record<Locale, HubCopy> = {
  ru: {
    intro: [
      'Все пять игр работают по одному принципу: хост создаёт комнату, остальные заходят по ссылке или коду. Различаются они тем, сколько нужно людей, сколько длится партия и что именно от вас требуется — внимательно слушать, быстро считать или блефовать с непроницаемым лицом.',
      'Ниже — короткая подсказка, что выбрать под конкретную ситуацию, а на странице каждой игры есть подробные правила, тактика и разбор частых ошибок.'
    ],
    chooseTitle: 'Что выбрать',
    choose: [
      {
        title: 'Большой компанией',
        body: 'Шпион — единственная игра здесь, которая тем лучше, чем больше людей: от пяти до двенадцати. Ей не нужна ни реакция, ни знания, только разговор, поэтому играть могут все сразу и вперемешку по возрасту.'
      },
      {
        title: 'Вдвоём',
        body: 'Морской бой — классическая дуэль на двоих, где всё решает расстановка флота и порядок обстрела. Переворот тоже играется вдвоём, но раскрывается в компании от четырёх.'
      },
      {
        title: 'Когда хочется соревнования на скорость',
        body: 'Сапёр и Флагер дают всем одинаковые условия и сравнивают результат. В Сапёре у каждого своё поле, но одинаково сгенерированное; во Флагере — общая цепочка флагов и общий таймер.'
      },
      {
        title: 'В одиночку',
        body: 'Сапёр и Флагер работают и без соперников: первый как классическая головоломка, второй как тренировка географии. Результат записывается в личную статистику отдельно от мультиплеера.'
      },
      {
        title: 'Если есть только десять минут',
        body: 'Партия в Шпиона или Флагера укладывается примерно в десять минут. Переворот и Морской бой чуть длиннее — рассчитывайте на четверть часа.'
      }
    ],
    faq: [
      {
        q: 'С какой игры начать, если никто ни во что не играл?',
        a: 'С Шпиона: правила объясняются за минуту, не нужно ничего уметь, и партия идёт сама собой за счёт разговора.'
      },
      {
        q: 'Можно ли играть с телефона?',
        a: 'Да, все игры работают в мобильном браузере. Сапёр и Морской бой удобнее на большом экране, остальные одинаково хороши везде.'
      },
      {
        q: 'Что будет, если игрок отключится посреди партии?',
        a: 'У него есть время вернуться — платформа отслеживает присутствие и исключает только после паузы. В играх с ходами очередь при этом не застревает.'
      },
      {
        q: 'Можно ли закрыть комнату от посторонних?',
        a: 'Да, при создании включите приватность и задайте пароль. Такая комната остаётся в списке, но войти в неё можно только с паролем.'
      }
    ]
  },
  en: {
    intro: [
      'All five games work the same way: the host creates a room, everyone else joins by link or code. What differs is how many people you need, how long a match runs, and what it asks of you — listening closely, counting quickly, or bluffing with a straight face.',
      'Below is a short guide to picking one for the situation you are actually in. Each game page then covers the full rules, tactics and the mistakes people usually make.'
    ],
    chooseTitle: 'Which one to pick',
    choose: [
      {
        title: 'For a large group',
        body: 'Spyfall is the only game here that gets better the more people join — five to twelve. It needs no reflexes and no knowledge, just conversation, so a mixed group can all play at once.'
      },
      {
        title: 'For two',
        body: 'Battleship is the classic duel, decided by how you lay out the fleet and how you search. Coup also works with two, though it comes alive from four upwards.'
      },
      {
        title: 'When you want a race',
        body: 'Minesweeper and Flager give everyone identical conditions and compare the result. In Minesweeper each player has their own grid, generated the same; in Flager everyone shares one chain of flags and one clock.'
      },
      {
        title: 'On your own',
        body: 'Minesweeper and Flager both work without opponents — one as the classic puzzle, the other as geography practice. Solo results are tracked separately from multiplayer.'
      },
      {
        title: 'If you only have ten minutes',
        body: 'A round of Spyfall or Flager fits into roughly ten minutes. Coup and Battleship run a little longer — plan for about fifteen.'
      }
    ],
    faq: [
      {
        q: 'Which game should a group of complete beginners start with?',
        a: 'Spyfall. The rules take a minute to explain, no skill is required, and the conversation carries the match on its own.'
      },
      {
        q: 'Can I play on a phone?',
        a: 'Yes, every game runs in a mobile browser. Minesweeper and Battleship are more comfortable on a large screen; the rest play equally well anywhere.'
      },
      {
        q: 'What happens if someone disconnects mid-match?',
        a: 'They get time to come back — the platform tracks presence and only removes a player after a grace period. In turn-based games the turn order does not stall meanwhile.'
      },
      {
        q: 'Can a room be closed to strangers?',
        a: 'Yes. Enable privacy when creating it and set a password. The room still appears in the list, but only someone with the password can enter.'
      }
    ]
  }
};
