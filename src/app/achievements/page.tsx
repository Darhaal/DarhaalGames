'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft, Calendar, Trophy, Skull,
  Gamepad2, Medal, Clock, TrendingUp, Loader2, User, Star,
  Flag, Bomb, Zap, Fingerprint
} from 'lucide-react';

type Lang = 'ru' | 'en';

// Базовая статистика одной категории
type BaseStats = {
    wins: number;
    lost: number;
    time: number; // в минутах
    extra?: number; // Доп. метрика (мины/флаги)
};

// Данные игры: могут быть плоскими или разделенными на режимы
type GameStatsData = BaseStats | {
    single?: BaseStats;
    multi?: BaseStats;
    // Для совместимости со старым форматом
    wins?: number;
    lost?: number;
    time?: number;
    extra?: number;
};

// Полная структура из БД
type UserStats = {
    total_games: number;
    details: {
        minesweeper?: GameStatsData;
        flager?: GameStatsData;
        battleship?: BaseStats; // Всегда плоский
        coup?: BaseStats;       // Всегда плоский
        spyfall?: BaseStats;    // Всегда плоский
    }
};

function AchievementsContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Lang>('ru');

  useEffect(() => {
    const savedLang = localStorage.getItem('dg_lang') as Lang;
    if (savedLang) setLang(savedLang);

    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
          // Сохраняем текущий путь
          const currentPath = window.location.pathname + window.location.search;
          // Перекидываем на главную, добавляя returnUrl
          router.push(`/?returnUrl=${encodeURIComponent(currentPath)}`);
          return;
      }
      setUser(user);

      const { data: statsData } = await supabase
          .from('player_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

      if (statsData) {
          setStats(statsData);
      } else {
          // Инициализация нулями, если записи нет
          setStats({
              total_games: 0,
              details: {
                  minesweeper: { wins: 0, lost: 0, time: 0 },
                  flager: { wins: 0, lost: 0, time: 0 },
                  battleship: { wins: 0, lost: 0, time: 0 },
                  coup: { wins: 0, lost: 0, time: 0 },
                  spyfall: { wins: 0, lost: 0, time: 0 }
              }
          });
      }
      setLoading(false);
    };
    fetchData();
  }, [router]);

  const t = {
    ru: {
      headerTitle: 'Прогресс',
      headerSub: 'Ваша статистика',
      back: 'Назад',
      profile: 'Статистика игрока',
      regDate: 'Дата регистрации',
      totalGames: 'Матчей',
      winRate: 'Винрейт',
      games: 'Дисциплины',
      wins: 'Побед',
      losses: 'Поражений',
      playTime: 'В игре',
      guest: 'Гость',
      guestDesc: 'Статистика не сохраняется',
      noStats: 'Нет данных',
      footer: '© 2026 Darhaal Games Inc.',
      modes: {
          single: 'Одиночный',
          multi: 'Мультиплеер'
      },
      gamesNames: {
          minesweeper: 'Сапер',
          flager: 'Флагер',
          battleship: 'Морской Бой',
          coup: 'Переворот',
          spyfall: 'Шпион'
      },
      extra: {
          minesweeper: 'Мин найдено',
          flager: 'Флагов угадано'
      }
    },
    en: {
      headerTitle: 'Progress',
      headerSub: 'Your Statistics',
      back: 'Back',
      profile: 'Player Statistics',
      regDate: 'Registered',
      totalGames: 'Matches',
      winRate: 'Win Rate',
      games: 'Disciplines',
      wins: 'Wins',
      losses: 'Losses',
      playTime: 'Play Time',
      guest: 'Guest',
      guestDesc: 'Stats not saved',
      noStats: 'No data',
      footer: '© 2026 Darhaal Games Inc.',
      modes: {
          single: 'Solo',
          multi: 'Multiplayer'
      },
      gamesNames: {
          minesweeper: 'Minesweeper',
          flager: 'Flager',
          battleship: 'Battleship',
          coup: 'Coup',
          spyfall: 'Spyfall'
      },
      extra: {
          minesweeper: 'Mines found',
          flager: 'Flags guessed'
      }
    }
  }[lang];

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="w-8 h-8 animate-spin text-[#9e1316]" /></div>;

  const regDate = new Date(user.created_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
  });

  // --- Helpers for Aggregation ---

  const getAggregatedStats = (gameData: any): BaseStats => {
      if (!gameData) return { wins: 0, lost: 0, time: 0 };

      // Если это новый формат с разделением
      if (gameData.single || gameData.multi) {
          const s = gameData.single || { wins: 0, lost: 0, time: 0 };
          const m = gameData.multi || { wins: 0, lost: 0, time: 0 };
          return {
              wins: (s.wins || 0) + (m.wins || 0),
              lost: (s.lost || 0) + (m.lost || 0),
              time: (s.time || 0) + (m.time || 0)
          };
      }

      // Старый плоский формат
      return {
          wins: gameData.wins || 0,
          lost: gameData.lost || 0,
          time: gameData.time || 0
      };
  };

  let totalWins = 0;
  let totalLost = 0;
  let totalTime = 0;

  if (stats?.details) {
      Object.values(stats.details).forEach((g: any) => {
          const agg = getAggregatedStats(g);
          totalWins += agg.wins;
          totalLost += agg.lost;
          totalTime += agg.time;
      });
  }

  const globalWinRate = totalWins + totalLost > 0 ? Math.round((totalWins / (totalWins + totalLost)) * 100) : 0;
  const hoursPlayed = Math.floor(totalTime / 60);

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
      <div className="bg-white p-5 rounded-3xl border border-[#E6E1DC] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} text-white shadow-md group-hover:scale-110 transition-transform`}>
              <Icon className="w-6 h-6" />
          </div>
          <div>
              <div className="text-[10px] font-bold text-[#8A9099] tracking-wider uppercase">{label}</div>
              <div className="text-xl font-black text-[#1A1F26]">{value}</div>
          </div>
      </div>
  );

  const GameStatCard = ({ title, data, modeLabel, gameKey }: { title: string, data: BaseStats, modeLabel?: string, gameKey: string }) => {
      const total = data.wins + data.lost;
      const wr = total > 0 ? Math.round((data.wins / total) * 100) : 0;

      const extraLabel = t.extra[gameKey as keyof typeof t.extra];
      const ExtraIcon = gameKey === 'minesweeper' ? Bomb : (gameKey === 'flager' ? Flag : null);

      return (
        <div className="bg-white rounded-[32px] p-6 border border-[#E6E1DC] shadow-lg hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gray-100 to-transparent rounded-bl-[100px] pointer-events-none group-hover:from-[#9e1316]/5 transition-colors" />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-xl font-black text-[#1A1F26] flex items-center gap-2">
                        {gameKey === 'spyfall' && <Fingerprint className="w-5 h-5 text-[#9e1316]"/>}
                        {title}
                    </h3>
                    {modeLabel && (
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wider mt-1 inline-block ${modeLabel === t.modes.single ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                            {modeLabel}
                        </span>
                    )}
                </div>
                {total === 0 && <span className="text-[10px] font-bold bg-[#F5F5F0] text-[#8A9099] px-3 py-1 rounded-full tracking-wider">{t.noStats}</span>}
            </div>

            <div className={`grid grid-cols-2 gap-y-4 gap-x-2 relative z-10 ${total === 0 ? 'opacity-40 grayscale' : ''}`}>
                <div>
                    <div className="text-[10px] font-bold text-[#8A9099] mb-1 uppercase tracking-wider">{t.wins}</div>
                    <div className="text-xl font-black text-emerald-600 flex items-center gap-1">
                        {data.wins} <Trophy className="w-3 h-3" />
                    </div>
                </div>
                <div>
                    <div className="text-[10px] font-bold text-[#8A9099] mb-1 uppercase tracking-wider">{t.losses}</div>
                    <div className="text-xl font-black text-red-500 flex items-center gap-1">
                        {data.lost} <Skull className="w-3 h-3" />
                    </div>
                </div>
                <div>
                    <div className="text-[10px] font-bold text-[#8A9099] mb-1 uppercase tracking-wider">{t.playTime}</div>
                    <div className="text-xl font-black text-[#1A1F26] flex items-center gap-1">
                        {Math.round(data.time)}m
                    </div>
                </div>

                {extraLabel && ExtraIcon && (
                    <div>
                        <div className="text-[10px] font-bold text-[#8A9099] mb-1 uppercase tracking-wider">{extraLabel}</div>
                        <div className="text-xl font-black text-[#1A1F26] flex items-center gap-1">
                            {data.extra || 0}
                            <ExtraIcon className="w-3 h-3 text-[#9e1316]" />
                        </div>
                    </div>
                )}
            </div>

            {total > 0 && (
                <div className="mt-6 relative z-10">
                    <div className="flex justify-between text-[9px] font-bold text-[#8A9099] mb-2">
                        <span>Winrate</span>
                        <span>{wr}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#F5F5F0] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#9e1316] to-orange-500 transition-all duration-1000"
                            style={{ width: `${wr}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
      );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#1A1F26] overflow-x-hidden selection:bg-[#9e1316] selection:text-white flex flex-col">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay pointer-events-none fixed" />

      {/* HEADER: STICKY */}
      <header className="sticky top-0 z-30 w-full bg-[#F8FAFC]/90 backdrop-blur-xl border-b border-[#E6E1DC] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
            <button onClick={() => router.push('/')} className="group p-2.5 md:p-3 bg-white border border-[#E6E1DC] rounded-xl hover:border-[#9e1316]/30 hover:shadow-sm transition-all">
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-[#8A9099] group-hover:text-[#9e1316]" />
            </button>
            <div className="flex flex-col">
                <h1 className="text-lg md:text-xl font-bold text-[#1A1F26] tracking-tight leading-none">{t.headerTitle}</h1>
                <p className="text-xs text-[#8A9099] font-medium hidden sm:block">{t.headerSub}</p>
            </div>
          </div>
          <div className="hidden md:block w-32" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 pb-20 relative z-10 flex-1">
          {/* Header Profile */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12 animate-in slide-in-from-bottom-8 duration-500">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-[#F5F5F0] relative group ring-4 ring-[#E6E1DC]/50">
                  {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                      <User className="w-16 h-16 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                  {user.is_anonymous && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#1A1F26] text-white text-[9px] font-bold text-center py-1 tracking-wider">{t.guest}</div>
                  )}
              </div>
              <div className="text-center md:text-left">
                  <div className="text-[10px] font-black text-[#9e1316] tracking-[0.2em] mb-2 flex items-center justify-center md:justify-start gap-2 uppercase">
                    <Star className="w-3 h-3 fill-current" /> {t.profile}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black text-[#1A1F26] tracking-tighter leading-none mb-4">
                      {user.user_metadata?.username || user.email?.split('@')[0] || 'Player'}
                  </h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#8A9099] bg-white px-4 py-2 rounded-xl border border-[#E6E1DC] shadow-sm">
                          <Calendar className="w-4 h-4" /> {t.regDate}: <span className="text-[#1A1F26]">{regDate}</span>
                      </div>
                      {user.is_anonymous && (
                          <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                              <User className="w-4 h-4" /> {t.guestDesc}
                          </div>
                      )}
                  </div>
              </div>
          </div>

          {/* Global Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-in slide-in-from-bottom-10 duration-700 delay-100">
              <StatCard label={t.totalGames} value={totalWins + totalLost} icon={Gamepad2} color="bg-[#9e1316]" />
              <StatCard label={t.winRate} value={`${globalWinRate}%`} icon={TrendingUp} color="bg-emerald-600" />
              <StatCard label={t.playTime} value={`${hoursPlayed}h`} icon={Clock} color="bg-blue-600" />
              <StatCard label={t.wins} value={totalWins} icon={Trophy} color="bg-yellow-500" />
          </div>

          {/* Games Grid */}
          <h2 className="text-xl font-black text-[#1A1F26] tracking-tight mb-6 flex items-center gap-3">
              <Medal className="w-6 h-6 text-[#9e1316]" /> {t.games}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-12 duration-700 delay-200">
              {['minesweeper', 'flager', 'battleship', 'coup', 'spyfall'].map((gameKey) => {
                  const data: any = stats?.details?.[gameKey as keyof typeof stats.details];
                  const gameName = t.gamesNames[gameKey as keyof typeof t.gamesNames];

                  if (!data) return <GameStatCard key={gameKey} title={gameName} data={{ wins: 0, lost: 0, time: 0 }} gameKey={gameKey} />;

                  // Если данные имеют структуру single/multi (Сапер, Флагер)
                  if (data.single || data.multi) {
                      return (
                          <React.Fragment key={gameKey}>
                              <GameStatCard
                                  title={gameName}
                                  modeLabel={t.modes.single}
                                  data={data.single || { wins: 0, lost: 0, time: 0 }}
                                  gameKey={gameKey}
                              />
                              <GameStatCard
                                  title={gameName}
                                  modeLabel={t.modes.multi}
                                  data={data.multi || { wins: 0, lost: 0, time: 0 }}
                                  gameKey={gameKey}
                              />
                          </React.Fragment>
                      );
                  }

                  // Стандартный (плоский) вид для Coup/Battleship/Spyfall
                  return <GameStatCard key={gameKey} title={gameName} data={data} gameKey={gameKey} />;
              })}
          </div>
      </main>

      <footer className="w-full p-8 text-center z-10 mt-auto opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-[#1A1F26] text-[10px] font-black tracking-[0.3em] cursor-default flex items-center justify-center gap-2">
            <Zap className="w-3 h-3 text-[#9e1316]" /> {t.footer}
        </p>
      </footer>
    </div>
  );
}

export default function AchievementsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="w-10 h-10 animate-spin text-[#9e1316]" /></div>}>
       <AchievementsContent />
    </Suspense>
  );
}