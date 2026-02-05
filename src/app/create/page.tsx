'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, Users, Lock, Unlock,
  ScrollText, ArrowRight, Eye, EyeOff, Loader2, Type, UserPlus,
  Bomb, Ship, ShieldAlert, Flag, Clock, Grid
} from 'lucide-react';
// Types needed for initial state creation
import { GameState as CoupState, Player as CoupPlayer } from '@/types/coup';
import { BattleshipState, PlayerBoard as BattleshipPlayer } from '@/types/battleship';
import { FlagerState } from '@/types/flager';
import { MinesweeperState, MinesweeperPlayer } from '@/types/minesweeper';

type Lang = 'ru' | 'en';

type Game = {
  id: string;
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
  minPlayers: number;
  maxPlayers: number;
  icon: React.ReactNode;
  disabled?: boolean;
};

// Configuration including blocked games
const GAMES: Game[] = [
  {
    id: 'minesweeper',
    title: { ru: 'Сапер', en: 'Minesweeper' },
    desc: {
      ru: 'Скоростное разминирование. Кто быстрее очистит поле?',
      en: 'Speed defusal. Who clears the grid first?'
    },
    minPlayers: 1,
    maxPlayers: 4,
    icon: <Bomb className="w-8 h-8 sm:w-10 sm:h-10" />,
    disabled: false,
  },
  {
    id: 'flager',
    title: { ru: 'Флагер', en: 'Flager' },
    desc: {
      ru: 'Географическая викторина. Угадай флаг по пикселям.',
      en: 'Geography quiz. Guess the flag pixel by pixel.'
    },
    minPlayers: 1,
    maxPlayers: 4,
    icon: <Flag className="w-8 h-8 sm:w-10 sm:h-10" />,
    disabled: false,
  },
  {
    id: 'battleship',
    title: { ru: 'Морской Бой', en: 'Battleship' },
    desc: {
      ru: 'Классическая тактика. Потопи флот противника.',
      en: 'Classic tactics. Sink the enemy fleet.'
    },
    minPlayers: 2,
    maxPlayers: 2,
    icon: <Ship className="w-8 h-8 sm:w-10 sm:h-10" />,
  },
  {
    id: 'coup',
    title: { ru: 'Переворот', en: 'Coup' },
    desc: {
      ru: 'Блеф, интриги и влияние. Останься последним.',
      en: 'Bluff, intrigue, influence. Be the last one standing.'
    },
    minPlayers: 2,
    maxPlayers: 6,
    icon: <ScrollText className="w-8 h-8 sm:w-10 sm:h-10" />,
  },
  // --- BLOCKED GAMES ---
  {
    id: 'mafia',
    title: { ru: 'Мафия', en: 'Mafia' },
    desc: {
      ru: 'Город засыпает...',
      en: 'The city falls asleep...'
    },
    minPlayers: 4,
    maxPlayers: 12,
    icon: <Users className="w-8 h-8 sm:w-10 sm:h-10" />,
    disabled: true,
  },
];

const TRANSLATIONS = {
  ru: {
    select: 'Выбор игры',
    selectSub: 'Доступные режимы',
    settings: 'Настройки',
    settingsSub: 'Параметры лобби',
    create: 'Создать',
    back: 'Назад',
    private: 'Закрытая игра',
    password: 'Пароль',
    players: 'Игроки',
    rounds: 'Раунды',
    duration: 'Время хода',
    seconds: 'сек',
    minutes: 'мин',
    comingSoon: 'Скоро',
    error: 'Ошибка',
    lobbyName: 'Название',
    enterName: 'Имя комнаты...',
    enterPass: '••••••',
    footer: 'Darhaal Games © 2026',
    // Minesweeper
    msSize: 'Размер поля',
    msMines: 'Плотность мин',
    msTime: 'Лимит времени',
    msTotalMines: 'Всего мин:',
    msTotalCells: 'Клеток:'
  },
  en: {
    select: 'Select Game',
    selectSub: 'Available modes',
    settings: 'Settings',
    settingsSub: 'Lobby configuration',
    create: 'Create',
    back: 'Back',
    private: 'Private Game',
    password: 'Password',
    players: 'Players',
    rounds: 'Rounds',
    duration: 'Turn Time',
    seconds: 's',
    minutes: 'm',
    comingSoon: 'Soon',
    error: 'Error',
    lobbyName: 'Name',
    enterName: 'Room name...',
    enterPass: '••••••',
    footer: 'Darhaal Games © 2026',
    // Minesweeper
    msSize: 'Grid Size',
    msMines: 'Mine Density',
    msTime: 'Time Limit',
    msTotalMines: 'Total Mines:',
    msTotalCells: 'Cells:'
  }
};

export default function CreatePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [lang, setLang] = useState<Lang>('ru');
  const [step, setStep] = useState<'selection' | 'settings'>('selection');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [lobbyName, setLobbyName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(6);

  // Flager settings
  const [rounds, setRounds] = useState(5);
  const [roundDuration, setRoundDuration] = useState(60);

  // Minesweeper Custom Settings
  const [msSize, setMsSize] = useState(20); // Square size (e.g. 20x20)
  const [msMineDensity, setMsMineDensity] = useState(15); // Percentage
  const [msTimeLimit, setMsTimeLimit] = useState(20); // Minutes

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const savedLang = localStorage.getItem('dg_lang') as Lang;
    if (savedLang) setLang(savedLang);
  }, []);

  useEffect(() => {
    if (selectedGame) {
        setMaxPlayers(selectedGame.maxPlayers);
        if (!lobbyName && user) {
            const userName = user.user_metadata?.username || user.email?.split('@')[0] || 'Player';
            const suffix = lang === 'ru' ? 'Лобби' : 'Lobby';
            setLobbyName(`${selectedGame.title[lang]} ${suffix} - ${userName}`);
        }

        // Reset defaults on game select
        if (selectedGame.id === 'minesweeper') {
            setMsSize(20);
            setMsMineDensity(15);
            setMsTimeLimit(20);
        }
    }
  }, [selectedGame, user, lang]);

  const t = TRANSLATIONS[lang];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame || !user) return;
    setLoading(true);

    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      let initialState: any;

      const userName = user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player';
      const userAvatar = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;

      // --- INITIAL STATE GENERATION ---

      if (selectedGame.id === 'minesweeper') {
          const totalCells = msSize * msSize;
          const minesCount = Math.floor(totalCells * (msMineDensity / 100));
          const safeMines = Math.max(1, Math.min(minesCount, totalCells - 9));

          const initialHost: MinesweeperPlayer = {
              id: user.id,
              name: userName,
              avatarUrl: userAvatar,
              isHost: true,
              board: [],
              status: 'playing',
              minesLeft: safeMines,
              score: 0
          };

          const msState: MinesweeperState = {
              players: { [user.id]: initialHost },
              status: 'waiting',
              startTime: 0,
              lastActionTime: Date.now(),
              version: 1,
              winner: null,
              gameType: 'minesweeper',
              settings: {
                  maxPlayers: maxPlayers,
                  width: msSize,
                  height: msSize,
                  minesCount: safeMines,
                  timeLimit: msTimeLimit * 60, // sec
                  difficulty: 'custom'
              }
          };
          initialState = msState;

      } else if (selectedGame.id === 'coup') {
          const initialHost: CoupPlayer = {
            id: user.id, name: userName, avatarUrl: userAvatar, coins: 2, cards: [], isDead: false, isHost: true, isReady: true
          };
          initialState = {
            players: [initialHost], deck: [], turnIndex: 0, logs: [], status: 'waiting', phase: 'choosing_action', currentAction: null, lastActionTime: Date.now(), version: 1, turnDeadline: undefined, gameType: 'coup', settings: { maxPlayers }, passedPlayers: []
          };

      } else if (selectedGame.id === 'battleship') {
          const initialHost: BattleshipPlayer = { id: user.id, name: userName, avatarUrl: userAvatar, isHost: true, isReady: false, ships: [], shots: {}, aliveShipsCount: 0 };
          initialState = { players: { [user.id]: initialHost }, turn: null, phase: 'setup', status: 'waiting', winner: null, logs: [], lastActionTime: Date.now(), version: 1, gameType: 'battleship', settings: { maxPlayers: 2 }, turnDeadline: undefined };

      } else if (selectedGame.id === 'flager') {
          const initialHost = { id: user.id, name: userName, avatarUrl: userAvatar, isHost: true, score: 0, guesses: [], hasFinishedRound: false, roundScore: 0, history: [], isReadyForNextRound: false };
          initialState = { players: [initialHost], status: 'waiting', targetChain: [], currentRoundIndex: 0, roundStartTime: Date.now(), lastActionTime: Date.now(), version: 1, gameType: 'flager', settings: { maxPlayers, totalRounds: rounds, roundDuration } };
      }

      const finalGameState = {
          ...initialState,
          gameType: selectedGame.id,
          settings: { ...initialState.settings, maxPlayers: maxPlayers }
      };

      const { data, error } = await supabase.from('lobbies').insert({
        code, name: lobbyName, host_id: user.id, is_private: isPrivate, password: isPrivate ? password : null, status: 'waiting', game_state: finalGameState,
      }).select().single();

      if (error) throw error;
      router.push(`/game/${selectedGame.id}?id=${data.id}`);
    } catch (error: any) {
      alert(t.error + error.message);
      setLoading(false);
    }
  };

  const renderSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-4xl animate-in zoom-in-95 duration-500 pb-8">
      {GAMES.map(game => (
        <button
          key={game.id}
          onClick={() => { if (!game.disabled) { setSelectedGame(game); setStep('settings'); } }}
          disabled={game.disabled}
          className={`
            group relative overflow-hidden rounded-[24px] p-1 text-left transition-all duration-300
            ${game.disabled
              ? 'opacity-60 cursor-not-allowed grayscale'
              : 'hover:scale-[1.01] hover:shadow-lg border border-[#E6E1DC] bg-white hover:border-[#9e1316]/20'
            }
          `}
        >
          <div className="relative z-20 p-5 sm:p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                 <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${game.disabled ? 'bg-gray-100 text-gray-400' : 'bg-[#F8FAFC] text-[#1A1F26] group-hover:bg-[#1A1F26] group-hover:text-white'}`}>
                   {game.icon}
                 </div>
                 {game.disabled && <span className="text-[10px] font-bold uppercase bg-gray-100 px-2 py-1 rounded text-gray-400 tracking-wide border border-gray-200">{t.comingSoon}</span>}
              </div>

              <div className="mt-auto">
                  <h3 className="text-lg font-bold text-[#1A1F26] mb-1 group-hover:text-[#9e1316] transition-colors">{game.title[lang]}</h3>
                  <p className="text-xs font-medium text-gray-500 leading-relaxed min-h-[40px]">{game.desc[lang]}</p>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1F26] mt-4 pt-4 border-t border-[#F1F5F9]">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    {game.minPlayers === game.maxPlayers ? game.minPlayers : `${game.minPlayers}-${game.maxPlayers}`}
                  </div>
              </div>
          </div>
        </button>
      ))}
    </div>
  );

  const renderSettings = () => (
    <form onSubmit={handleCreate} className="w-full max-w-lg bg-white border border-[#E6E1DC] rounded-[32px] p-6 sm:p-8 shadow-xl animate-in slide-in-from-right-8 duration-500 relative overflow-hidden mb-8">
       <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-14 h-14 bg-[#1A1F26] rounded-xl flex items-center justify-center text-white shadow-md">
             {selectedGame?.icon}
          </div>
          <div>
              <h2 className="text-lg font-bold text-[#1A1F26] leading-tight">{selectedGame?.title[lang]}</h2>
              <p className="text-xs font-medium text-gray-500">{t.settingsSub}</p>
          </div>
       </div>

       <div className="space-y-5 relative z-10">
          <div className="space-y-2">
               <label className="text-xs font-bold text-[#1A1F26] ml-1 flex items-center gap-2"><Type className="w-3.5 h-3.5 text-gray-400"/> {t.lobbyName}</label>
               <input
                   type="text"
                   value={lobbyName}
                   onChange={e => setLobbyName(e.target.value)}
                   placeholder={t.enterName}
                   className="w-full bg-[#F8FAFC] border border-gray-200 focus:bg-white focus:border-[#1A1F26] rounded-xl py-3 px-4 font-medium text-[#1A1F26] outline-none transition-all placeholder:text-gray-400 text-sm"
                   required
               />
          </div>

          {selectedGame && selectedGame.minPlayers !== selectedGame.maxPlayers && (
            <div className="space-y-3">
               <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-[#1A1F26] ml-1 flex items-center gap-2"><UserPlus className="w-3.5 h-3.5 text-gray-400"/> {t.players}</label>
                    <span className="text-xs font-bold text-white bg-[#1A1F26] px-2 py-0.5 rounded">{maxPlayers}</span>
               </div>
               <input
                   type="range"
                   min={selectedGame?.minPlayers}
                   max={selectedGame?.maxPlayers}
                   step={1}
                   value={maxPlayers}
                   onChange={e => setMaxPlayers(Number(e.target.value))}
                   className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#1A1F26]"
               />
               <div className="flex justify-between text-[10px] font-medium text-gray-400 px-1">
                   <span>{selectedGame?.minPlayers}</span>
                   <span>{selectedGame?.maxPlayers}</span>
               </div>
            </div>
          )}

          {/* MINESWEEPER MODERN SETTINGS */}
          {selectedGame?.id === 'minesweeper' && (
              <div className="space-y-5 pt-5 border-t border-[#F1F5F9] animate-in fade-in">

                  {/* Size Slider */}
                  <div className="space-y-3">
                      <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-[#1A1F26] ml-1 flex items-center gap-2"><Grid className="w-3.5 h-3.5 text-gray-400"/> {t.msSize}</label>
                          <div className="text-xs font-bold text-white bg-[#1A1F26] px-2 py-0.5 rounded tabular-nums">
                              {msSize} × {msSize}
                          </div>
                      </div>
                      <input type="range" min="10" max="100" step={1} value={msSize} onChange={e => setMsSize(Number(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#1A1F26]" />
                  </div>

                  {/* Mine Density */}
                  <div className="space-y-3">
                      <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-[#1A1F26] ml-1 flex items-center gap-2"><Bomb className="w-3.5 h-3.5 text-gray-400"/> {t.msMines}</label>
                          <div className="text-xs font-bold text-white bg-[#1A1F26] px-2 py-0.5 rounded tabular-nums">
                              {msMineDensity}%
                          </div>
                      </div>
                      <input type="range" min="10" max="40" step={1} value={msMineDensity} onChange={e => setMsMineDensity(Number(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#1A1F26]" />
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 px-2 bg-[#F8FAFC] py-1.5 rounded mt-1">
                          <span>{t.msTotalCells} {msSize * msSize}</span>
                          <span className="text-[#9e1316]">{t.msTotalMines} {Math.floor((msSize * msSize) * (msMineDensity / 100))}</span>
                      </div>
                  </div>

                  {/* Time Limit */}
                  <div className="space-y-3">
                      <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-[#1A1F26] ml-1 flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-gray-400"/> {t.msTime}</label>
                          <span className="text-xs font-bold text-white bg-[#1A1F26] px-2 py-0.5 rounded tabular-nums">{msTimeLimit} {t.minutes}</span>
                      </div>
                      <input type="range" min="1" max="180" step={1} value={msTimeLimit} onChange={e => setMsTimeLimit(Number(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#1A1F26]" />
                  </div>
              </div>
          )}

          {/* FLAGER SETTINGS */}
          {selectedGame?.id === 'flager' && (
            <div className="space-y-5 pt-5 border-t border-[#F1F5F9] animate-in fade-in">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                     <label className="text-xs font-bold text-[#1A1F26] ml-1 flex items-center gap-2"><Flag className="w-3.5 h-3.5 text-gray-400"/> {t.rounds}</label>
                     <span className="text-xs font-bold text-white bg-[#1A1F26] px-2 py-0.5 rounded">{rounds}</span>
                </div>
                <input type="range" min="1" max="20" step={1} value={rounds} onChange={e => setRounds(Number(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#1A1F26]" />
             </div>
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                     <label className="text-xs font-bold text-[#1A1F26] ml-1 flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-gray-400"/> {t.duration}</label>
                     <span className="text-xs font-bold text-white bg-[#1A1F26] px-2 py-0.5 rounded">{roundDuration} {t.seconds}</span>
                </div>
                <input type="range" min="15" max="300" step={15} value={roundDuration} onChange={e => setRoundDuration(Number(e.target.value))} className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#1A1F26]" />
             </div>
            </div>
          )}

          <div className="h-px bg-[#F1F5F9] w-full" />

          <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl cursor-pointer border border-transparent hover:border-gray-200 transition-all group" onClick={() => setIsPrivate(!isPrivate)}>
             <div className="flex items-center gap-3">
               <div className={`p-1.5 rounded-lg transition-colors ${isPrivate ? 'bg-[#1A1F26] text-white' : 'bg-gray-200 text-gray-500'}`}>
                   {isPrivate ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
               </div>
               <span className="font-bold text-[#1A1F26] text-xs uppercase tracking-wide">{t.private}</span>
             </div>
             <div className={`w-10 h-6 rounded-full transition-colors relative ${isPrivate ? 'bg-[#1A1F26]' : 'bg-gray-200'}`}>
               <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${isPrivate ? 'translate-x-4' : ''}`} />
             </div>
          </div>

          {isPrivate && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
               <label className="text-xs font-bold text-[#1A1F26] ml-1">{t.password}</label>
               <div className="relative">
                 <input
                   type={showPassword ? "text" : "password"}
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   placeholder={t.enterPass}
                   className="w-full bg-[#F8FAFC] border border-gray-200 focus:bg-white focus:border-[#1A1F26] rounded-xl py-3 px-4 font-bold text-[#1A1F26] outline-none transition-all placeholder:text-gray-400 text-sm"
                   required={isPrivate}
                 />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-[#1A1F26]">
                   {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                 </button>
               </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1F26] text-white py-4 rounded-xl font-bold uppercase tracking-wide hover:bg-[#9e1316] hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <> {t.create} <ArrowRight className="w-4 h-4" /> </>}
          </button>
       </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#9e1316]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER: STICKY & UNIFIED */}
      <header className="sticky top-0 z-30 w-full bg-[#F8FAFC]/90 backdrop-blur-xl border-b border-[#E6E1DC] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
            <button onClick={() => { if (step === 'selection') router.push('/'); else setStep('selection'); }} className="group p-2.5 md:p-3 bg-white border border-[#E6E1DC] rounded-xl hover:border-[#9e1316]/30 hover:shadow-sm transition-all">
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-[#8A9099] group-hover:text-[#9e1316]" />
            </button>
            <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-bold text-[#1A1F26] tracking-tight leading-none">{step === 'selection' ? t.select : t.settings}</h1>
                <p className="text-xs text-[#8A9099] font-medium hidden sm:block">
                    {step === 'selection' ? t.selectSub : (selectedGame ? selectedGame.title[lang] : t.settingsSub)}
                </p>
            </div>
          </div>
          {/* Spacer to mimic the Play page layout or keep it empty for clean look */}
          <div className="hidden md:block w-32" />
        </div>
      </header>

      <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10 pb-20 px-4 sm:px-6 py-8">
        {step === 'selection' && renderSelection()}
        {step === 'settings' && renderSettings()}
      </div>

      <footer className="w-full p-8 text-center z-10 opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-[#1A1F26] text-[10px] font-black uppercase tracking-[0.3em] cursor-default">
          {t.footer}
        </p>
      </footer>
    </div>
  );
}