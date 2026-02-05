'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LogOut, Check, X, Flag, Trophy, Search, Loader2,
  ArrowRight, Clock, Target, Zap, Crown, Home, AlertCircle,
  Book, HelpCircle, UserMinus, Keyboard, Lightbulb
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FlagerState, FlagerNotification } from '@/types/flager';
import { COUNTRIES, COUNTRY_CODES } from '@/data/flager/countries';

// ... (UI_TEXT, RulesModal, NotificationToast, FlagRevealCanvas, Podium components remain the same) ...
// Я опускаю вспомогательные компоненты для краткости, они остаются без изменений
// Фокусируемся на основном компоненте FlagerGame

const UI_TEXT = {
  ru: {
    title: 'FLAGGER',
    pro: 'by Darhaal',
    round: 'Раунд',
    of: 'из',
    time: 'Таймер',
    score: 'Очки',
    accuracy: 'Точность',
    status: 'Статус игроков',
    targetFound: 'Верно!',
    missionFailedShort: 'Ошибка',
    searching: 'Думает...',
    roundOver: 'Раунд завершен',
    results: 'Итоги раунда',
    correctAnswer: 'Это был флаг',
    yourResult: 'Ваш результат',
    success: 'Угадано',
    fail: 'Не угадано',
    accepted: 'Понятно',
    missionFailed: 'Попытки исчерпаны',
    timeUp: 'Время вышло',
    waitingOthers: 'Ждем остальных...',
    inputPlaceholder: 'Введите название страны...',
    notFound: 'Страна не найдена или уже была',
    nextRound: 'Далее',
    waitingGroup: 'Ожидание группы...',
    gameOver: 'Игра завершена',
    sessionResults: 'Итоговая таблица',
    player: 'Игрок',
    guessed: 'Флагов',
    returnMenu: 'В главное меню',
    you: '(Вы)',
    pixelMatch: 'PIXEL MATCH',
    noData: 'Введите любую страну',
    leaveGame: 'Выйти',
    rulesTitle: 'Правила игры',
    guideTitle: 'Справка',
    close: 'Закрыть',
    rules: {
       objectiveTitle: 'Цель игры',
       objectiveText: 'Угадайте скрытый флаг государства, используя метод частичного открытия (Pixel Match).',
       mechanicsTitle: 'Как играть',
       step1: 'Вводите названия ЛЮБЫХ стран.',
       step2: 'Система сравнит их флаги с загаданным.',
       step3: 'Если цвета совпадают в тех же местах — эти части флага откроются.',
       scoringTitle: 'Награда',
       scoringText: 'Вы начинаете с 1000 очков. Каждая ошибка (-50) и каждая секунда (-10) уменьшают итоговый счет.',
       tipsTitle: 'Совет',
       tipsText: 'Начинайте с флагов, где много разных цветов (например, ЮАР или Сейшелы), чтобы быстрее найти совпадения.'
    }
  },
  en: {
    title: 'FLAGGER',
    pro: 'by Darhaal',
    round: 'Round',
    of: 'of',
    time: 'Timer',
    score: 'Score',
    accuracy: 'Accuracy',
    status: 'Player Status',
    targetFound: 'Correct!',
    missionFailedShort: 'Incorrect',
    searching: 'Thinking...',
    roundOver: 'Round Over',
    results: 'Round Results',
    correctAnswer: 'Correct Flag',
    yourResult: 'Your Result',
    success: 'Guessed',
    fail: 'Missed',
    accepted: 'Got it',
    missionFailed: 'Out of attempts',
    timeUp: 'Time Up',
    waitingOthers: 'Waiting for others...',
    inputPlaceholder: 'Enter country name...',
    notFound: 'Country not found or already guessed',
    nextRound: 'Next',
    waitingGroup: 'Waiting for group...',
    gameOver: 'Game Over',
    sessionResults: 'Final Scoreboard',
    player: 'Player',
    guessed: 'Flags',
    returnMenu: 'Main Menu',
    you: '(You)',
    pixelMatch: 'PIXEL MATCH',
    noData: 'Type any country',
    leaveGame: 'Leave',
    rulesTitle: 'Game Rules',
    guideTitle: 'Guide',
    close: 'Close',
    rules: {
       objectiveTitle: 'Goal',
       objectiveText: 'Guess the hidden country flag using the pixel overlay matching method.',
       mechanicsTitle: 'How to Play',
       step1: 'Enter the name of ANY country.',
       step2: 'The system compares its flag with the target.',
       step3: 'Matching pixels (color & position) will be revealed on screen.',
       scoringTitle: 'Scoring',
       scoringText: 'Start with 1000 pts. Each error (-50) and each second (-10) reduces the score.',
       tipsTitle: 'Pro Tip',
       tipsText: 'Start with flags that have many distinct colors (like South Africa or Seychelles) to reveal pixels faster.'
    }
  }
};

interface FlagerGameProps {
  gameState: FlagerState;
  userId: string;
  makeGuess: (code: string) => void;
  handleTimeout: () => void;
  readyNextRound: () => void;
  leaveGame: () => void;
  lang: 'ru' | 'en';
}

const RulesModal = ({ onClose, t }: { onClose: () => void, t: any }) => (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 border-4 border-[#1A1F26] flex flex-col max-h-[90vh]">
            <div className="p-6 bg-[#1A1F26] text-white flex justify-between items-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <h2 className="text-xl font-black uppercase flex items-center gap-3 relative z-10 tracking-wider">
                    <Book className="w-6 h-6 text-[#9e1316]" /> {t.rulesTitle}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10">
                    <X className="w-5 h-5 text-white/60 hover:text-white" />
                </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
                <section className="flex gap-4">
                    <div className="shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-2xl bg-[#9e1316]/10 flex items-center justify-center text-[#9e1316]">
                            <Target className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-black text-[#1A1F26] uppercase text-xs tracking-widest mb-2">{t.rules.objectiveTitle}</h3>
                        <p className="text-sm font-bold text-gray-600 leading-relaxed bg-white p-3 rounded-xl border border-[#E6E1DC] shadow-sm">
                            {t.rules.objectiveText}
                        </p>
                    </div>
                </section>
                <section className="flex gap-4">
                    <div className="shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Keyboard className="w-5 h-5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-black text-[#1A1F26] uppercase text-xs tracking-widest mb-2">{t.rules.mechanicsTitle}</h3>
                        <ul className="space-y-2">
                            <li className="flex gap-3 text-xs sm:text-sm font-semibold text-gray-600 items-start">
                                <span className="bg-[#1A1F26] text-white w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                                <span>{t.rules.step1}</span>
                            </li>
                            <li className="flex gap-3 text-xs sm:text-sm font-semibold text-gray-600 items-start">
                                <span className="bg-[#1A1F26] text-white w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                                <span>{t.rules.step2}</span>
                            </li>
                            <li className="flex gap-3 text-xs sm:text-sm font-semibold text-gray-600 items-start">
                                <span className="bg-[#1A1F26] text-white w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                                <span>{t.rules.step3}</span>
                            </li>
                        </ul>
                    </div>
                </section>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <section className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                            <Trophy className="w-24 h-24 text-yellow-600" />
                        </div>
                        <h3 className="font-black text-yellow-800 uppercase text-[10px] tracking-widest mb-1 flex items-center gap-2">
                            <Trophy className="w-3 h-3" /> {t.rules.scoringTitle}
                        </h3>
                        <p className="text-xs font-bold text-yellow-900/80 leading-snug relative z-10">
                            {t.rules.scoringText}
                        </p>
                    </section>
                    <section className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                            <Lightbulb className="w-24 h-24 text-emerald-600" />
                        </div>
                        <h3 className="font-black text-emerald-800 uppercase text-[10px] tracking-widest mb-1 flex items-center gap-2">
                            <Lightbulb className="w-3 h-3" /> {t.rules.tipsTitle}
                        </h3>
                        <p className="text-xs font-bold text-emerald-900/80 leading-snug relative z-10">
                            {t.rules.tipsText}
                        </p>
                    </section>
                </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-[#E6E1DC] flex justify-center shrink-0">
                <button onClick={onClose} className="w-full bg-[#1A1F26] text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#9e1316] transition-colors shadow-lg">
                    {t.accepted}
                </button>
            </div>
        </div>
    </div>
);

const NotificationToast = ({ notifications, lang }: { notifications: FlagerNotification[], lang: 'ru' | 'en' }) => {
    const [visibleNote, setVisibleNote] = useState<FlagerNotification | null>(null);
    const lastNoteRef = useRef<number>(0);

    useEffect(() => {
        if (notifications && notifications.length > 0) {
            const latest = notifications[notifications.length - 1];
            if (latest.id > lastNoteRef.current) {
                setVisibleNote(latest);
                lastNoteRef.current = latest.id;
                const timer = setTimeout(() => setVisibleNote(null), 4000);
                return () => clearTimeout(timer);
            }
        }
    }, [notifications]);

    if (!visibleNote) return null;

    return (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-top-5 fade-in duration-300">
            <div className="bg-white/90 backdrop-blur-md border border-[#E6E1DC] shadow-xl rounded-full px-6 py-3 flex items-center gap-3">
                <div className="bg-red-100 text-red-600 p-1.5 rounded-full">
                    <UserMinus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1F26]">
                    {visibleNote.message[lang]}
                </span>
            </div>
        </div>
    );
};

const FlagRevealCanvas = ({ targetCode, guesses, isRoundDone, t }: { targetCode: string, guesses: string[], isRoundDone: boolean, t: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const WIDTH = 640;
  const HEIGHT = 426;

  useEffect(() => {
    let isMounted = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const targetPath = COUNTRIES[targetCode.toLowerCase()]?.flagPath;
    if (!targetPath) return;

    const targetImg = new Image();
    targetImg.crossOrigin = "Anonymous";
    targetImg.src = targetPath;

    targetImg.onload = () => {
        if (!isMounted) return;

        setIsLoading(false);
        ctx.fillStyle = '#1A1F26';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        if (isRoundDone) {
             ctx.drawImage(targetImg, 0, 0, WIDTH, HEIGHT);
             return;
        }

        const targetCanvas = document.createElement('canvas');
        targetCanvas.width = WIDTH;
        targetCanvas.height = HEIGHT;
        const targetCtx = targetCanvas.getContext('2d', { willReadFrequently: true });
        if(!targetCtx) return;

        targetCtx.drawImage(targetImg, 0, 0, WIDTH, HEIGHT);
        const targetData = targetCtx.getImageData(0, 0, WIDTH, HEIGHT);
        const mask = new Uint8Array(WIDTH * HEIGHT).fill(0);

        if (guesses.length === 0) {
            ctx.fillStyle = '#111';
            ctx.fillRect(0,0,WIDTH,HEIGHT);
            ctx.font = '30px monospace';
            ctx.fillStyle = '#333';
            ctx.textAlign = 'center';
            ctx.fillText(t.noData, WIDTH/2, HEIGHT/2);
            return;
        }

        let processedCount = 0;
        guesses.forEach(guessCode => {
            const guessPath = COUNTRIES[guessCode.toLowerCase()]?.flagPath;
            if (!guessPath) { processedCount++; return; }

            const guessImg = new Image();
            guessImg.crossOrigin = "Anonymous";
            guessImg.src = guessPath;

            guessImg.onload = () => {
                if (!isMounted) return;

                const guessCanvas = document.createElement('canvas');
                guessCanvas.width = WIDTH;
                guessCanvas.height = HEIGHT;
                const guessCtx = guessCanvas.getContext('2d', { willReadFrequently: true });
                if(!guessCtx) return;

                guessCtx.drawImage(guessImg, 0, 0, WIDTH, HEIGHT);
                const guessData = guessCtx.getImageData(0, 0, WIDTH, HEIGHT);

                for (let i = 0; i < targetData.data.length; i += 4) {
                    const idx = i / 4;
                    if (mask[idx] === 1) continue;
                    if (targetData.data[i+3] < 10) continue;

                    const rDist = Math.abs(targetData.data[i] - guessData.data[i]);
                    const gDist = Math.abs(targetData.data[i+1] - guessData.data[i+1]);
                    const bDist = Math.abs(targetData.data[i+2] - guessData.data[i+2]);

                    if (rDist < 45 && gDist < 45 && bDist < 45) mask[idx] = 1;
                }

                processedCount++;
                if (processedCount === guesses.length) {
                    const finalImageData = ctx.createImageData(WIDTH, HEIGHT);
                    for (let i = 0; i < mask.length; i++) {
                        const ptr = i * 4;
                        if (mask[i] === 1) {
                            finalImageData.data[ptr] = targetData.data[ptr];
                            finalImageData.data[ptr+1] = targetData.data[ptr+1];
                            finalImageData.data[ptr+2] = targetData.data[ptr+2];
                            finalImageData.data[ptr+3] = 255;
                        } else {
                            const noise = Math.random() * 20;
                            finalImageData.data[ptr] = 20 + noise;
                            finalImageData.data[ptr+1] = 25 + noise;
                            finalImageData.data[ptr+2] = 30 + noise;
                            finalImageData.data[ptr+3] = 255;
                        }
                    }
                    ctx.putImageData(finalImageData, 0, 0);
                }
            };
        });
    };

    return () => { isMounted = false; };
  }, [targetCode, guesses, isRoundDone, t]);

  return (
    <div className="relative w-full aspect-[3/2] bg-[#0F1216] rounded-xl overflow-hidden shadow-2xl border-4 border-[#1A1F26] group">
       {isLoading && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#9e1316] animate-spin" /></div>}
       <canvas ref={canvasRef} width={640} height={426} className="w-full h-full object-contain z-10 relative transition-all duration-500" />

       <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
       <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] z-30 pointer-events-none" />

       {!isRoundDone && (
         <div className="absolute top-3 right-3 bg-black/60 text-emerald-400 text-[10px] font-mono px-2 py-1 rounded backdrop-blur-sm z-40 border border-emerald-500/20 animate-pulse">
            {t.pixelMatch}
         </div>
       )}
    </div>
  );
};

const Podium = ({ players, currentUserId }: { players: any[], currentUserId: string }) => {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const [first, second, third] = sorted;

    const PodiumItem = ({ p, place, delay }: { p: any, place: number, delay: string }) => {
        if (!p) return null;
        const isMe = p.id === currentUserId;
        const height = place === 1 ? 'h-32 md:h-48' : place === 2 ? 'h-24 md:h-36' : 'h-16 md:h-24';
        const color = place === 1 ? 'bg-yellow-400' : place === 2 ? 'bg-gray-300' : 'bg-amber-600';

        return (
            <div className={`flex flex-col items-center justify-end animate-in slide-in-from-bottom-20 fade-in duration-1000 ${delay}`}>
                <div className="relative mb-2">
                    {place === 1 && <Crown className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce" />}
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-4 ${isMe ? 'border-[#9e1316]' : 'border-white'} shadow-lg overflow-hidden bg-gray-200`}>
                         <img src={p.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#1A1F26] text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border border-white/20 max-w-[80px] truncate">
                        {p.name}
                    </div>
                </div>
                <div className={`w-16 md:w-24 ${height} ${color} rounded-t-lg shadow-xl flex items-end justify-center pb-4 relative overflow-hidden group`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    <span className="text-2xl md:text-4xl font-black text-white/90 drop-shadow-md">{place}</span>
                </div>
                <div className="mt-2 font-black text-lg md:text-xl text-[#1A1F26]">{p.score}</div>
            </div>
        );
    };

    return (
        <div className="flex items-end justify-center gap-2 md:gap-4 py-8">
            <PodiumItem p={second} place={2} delay="delay-200" />
            <PodiumItem p={first} place={1} delay="delay-0" />
            <PodiumItem p={third} place={3} delay="delay-400" />
        </div>
    );
};

export default function FlagerGame({ gameState, userId, makeGuess, handleTimeout, readyNextRound, leaveGame, lang = 'ru' }: FlagerGameProps) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [shake, setShake] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const t = UI_TEXT[lang];

  const me = gameState.players.find(p => p.id === userId);
  const currentFlagCode = gameState.targetChain[gameState.currentRoundIndex];

  const isPlaying = gameState.status === 'playing';
  const isRoundEnd = gameState.status === 'round_end';
  const isFinished = gameState.status === 'finished';

  const isRoundDone = me?.hasFinishedRound;

  // Timer Logic
  const [elapsed, setElapsed] = useState(0);
  const roundDuration = gameState.settings?.roundDuration || 60;

  useEffect(() => {
      setElapsed(0);
  }, [gameState.currentRoundIndex]);

  useEffect(() => {
      if (!isPlaying || isRoundEnd || isFinished) return;

      const timer = setInterval(() => {
          const now = Date.now();
          const start = gameState.roundStartTime || now;
          // Считаем время с учетом задержки. Если start в будущем, elapsed будет отрицательным
          const secondsPassed = Math.floor((now - start) / 1000);

          setElapsed(secondsPassed);

          // TIMEOUT CHECK - Только если раунд действительно начался (время >= 0)
          if (secondsPassed >= roundDuration) {
              if (!isRoundDone) {
                 handleTimeout();
              }
              clearInterval(timer);
          }
      }, 200); // Обновляем чаще для плавной реакции на начало

      return () => clearInterval(timer);
  }, [isPlaying, isRoundEnd, isFinished, isRoundDone, gameState.roundStartTime, handleTimeout, roundDuration]);

  // Не показываем время больше лимита (если задержка)
  const timeLeft = Math.max(0, roundDuration - Math.max(0, elapsed));
  const isLowTime = timeLeft <= 10;

  // Фаза обратного отсчета
  const isCountingDown = elapsed < 0;
  const countdownValue = Math.abs(elapsed);

  const filteredCountries = useMemo(() => {
    if (!input) return [];
    const lowerInput = input.toLowerCase().trim();

    return COUNTRY_CODES.filter(code => {
      const c = COUNTRIES[code.toLowerCase()];
      if (!c) return false;

      const matchRu = c.name.ru.toLowerCase().includes(lowerInput);
      const matchEn = c.name.en.toLowerCase().includes(lowerInput);
      const matchAlias = c.aliases?.some(a => a.toLowerCase().includes(lowerInput));

      const notGuessed = !me?.guesses.includes(code.toLowerCase());

      return (matchRu || matchEn || matchAlias) && notGuessed;
    }).slice(0, 5);
  }, [input, me?.guesses]);

  const handleGuess = (code: string) => {
      const isCorrect = code.toLowerCase() === currentFlagCode.toLowerCase();
      if (!isCorrect) {
          setShake(true);
          setTimeout(() => setShake(false), 500);
      }
      makeGuess(code.toLowerCase());
      setInput('');
      setShowDropdown(false);
  };

  const calculateAccuracy = (p: any) => {
      let totalGuesses = 0;
      let correctGuesses = 0;
      p.history.forEach((h: any) => {
          totalGuesses += h.attempts;
          if (h.isCorrect) correctGuesses++;
      });
      if (p.guesses && p.guesses.length > 0) {
          totalGuesses += p.guesses.length;
          const currentTarget = currentFlagCode?.toLowerCase();
          if (p.guesses.includes(currentTarget)) {
              correctGuesses++;
          }
      }
      if (totalGuesses === 0) return 0;
      return Math.round((correctGuesses / totalGuesses) * 100);
  };

  const handleEmergencyExit = () => {
    leaveGame();
    setTimeout(() => router.push('/'), 500);
  };

  const isAttemptsFailed = (me?.guesses?.length || 0) >= 10 && me?.guesses?.[(me?.guesses?.length || 0) - 1] !== currentFlagCode.toLowerCase();
  const isTimeFailed = elapsed >= roundDuration && !me?.roundScore;
  const isRoundFailed = isRoundDone && (isAttemptsFailed || isTimeFailed);

  if (isFinished) {
      // (Код экрана завершения без изменений)
      return (
        <div className="fixed inset-0 z-[200] bg-[#F8FAFC] flex flex-col font-sans">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay pointer-events-none" />

            <div className="flex-1 overflow-y-auto pb-24">
                <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
                    <div className="bg-white rounded-[40px] shadow-2xl border border-[#E6E1DC] overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="bg-[#1A1F26] p-8 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
                            <Trophy className="w-16 h-16 text-[#9e1316] mx-auto mb-4 animate-bounce" />
                            <h2 className="text-3xl md:text-4xl font-black uppercase text-white tracking-tight">{t.gameOver}</h2>
                            <p className="text-white/60 font-bold uppercase tracking-widest text-sm mt-2">{t.sessionResults}</p>
                        </div>
                        <div className="p-4 md:p-8">
                            <Podium players={gameState.players} currentUserId={userId} />
                            <div className="mt-8 bg-[#F5F5F0] rounded-2xl p-4 md:p-6 border border-[#E6E1DC]">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black text-[#8A9099] uppercase tracking-widest border-b border-[#E6E1DC]">
                                            <th className="pb-3 pl-2">{t.player}</th>
                                            <th className="pb-3 text-center hidden sm:table-cell">{t.accuracy}</th>
                                            <th className="pb-3 text-center">{t.guessed}</th>
                                            <th className="pb-3 text-right pr-2">{t.score}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E6E1DC]">
                                        {[...gameState.players].sort((a,b) => b.score - a.score).map((p, idx) => (
                                            <tr key={p.id} className="group">
                                                <td className="py-4 pl-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-bold text-[#8A9099] w-4">{idx+1}</span>
                                                        <img src={p.avatarUrl} className="w-8 h-8 rounded-full bg-white border border-gray-200" />
                                                        <span className={`font-bold text-sm truncate max-w-[100px] sm:max-w-xs ${p.id === userId ? 'text-[#9e1316]' : 'text-[#1A1F26]'}`}>
                                                            {p.name} {p.id === userId && t.you}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-center hidden sm:table-cell">
                                                    <div className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded border border-[#E6E1DC]">
                                                        <Target className="w-3 h-3 text-emerald-500" />
                                                        <span className="text-xs font-bold">{calculateAccuracy(p)}%</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-center font-bold text-[#1A1F26]">
                                                    {p.history.filter((h:any) => h.isCorrect).length} <span className="text-[#8A9099] text-xs">/ {gameState.targetChain.length}</span>
                                                </td>
                                                <td className="py-4 text-right pr-2 font-black text-lg text-[#1A1F26]">
                                                    {p.score}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-[#E6E1DC] z-[210] flex justify-center">
                 <button onClick={handleEmergencyExit} className="w-full max-w-md py-4 bg-[#1A1F26] text-white rounded-xl font-black uppercase tracking-widest hover:bg-[#9e1316] transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2">
                    <Home className="w-4 h-4" /> {t.returnMenu}
                </button>
            </div>
        </div>
      );
  }

  // GAME SCREEN
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1A1F26] flex flex-col font-sans relative overflow-hidden selection:bg-[#9e1316] selection:text-white">
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay pointer-events-none fixed" />
       {showRules && <RulesModal onClose={() => setShowRules(false)} t={t} />}
       <NotificationToast notifications={gameState.notifications || []} lang={lang} />

       {/* COUNTDOWN OVERLAY */}
       {isCountingDown && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
               <div key={countdownValue} className="relative w-32 h-32 md:w-40 md:h-40 bg-white/90 backdrop-blur-xl rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#E6E1DC] flex items-center justify-center animate-in zoom-in-50 fade-in duration-200">
                   <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay rounded-full" />
                   <div className="absolute inset-0 rounded-full border-4 border-[#9e1316]/10" />
                   <div className="absolute -inset-1 rounded-full border border-[#9e1316]/20 opacity-0 animate-ping" />
                   <span className="text-5xl md:text-7xl font-black text-[#1A1F26] relative z-10 tabular-nums select-none">
                       {countdownValue}
                   </span>
               </div>
           </div>
       )}

       <div className="fixed top-0 left-0 right-0 h-1 bg-[#E6E1DC] z-50">
           <div
             className="h-full bg-[#9e1316] transition-all duration-1000 ease-linear"
             style={{ width: `${((gameState.currentRoundIndex) / gameState.targetChain.length) * 100}%` }}
           />
       </div>

       <header className="w-full max-w-6xl mx-auto p-4 flex justify-between items-center z-20 relative pt-8">
          <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-xl border border-[#E6E1DC] shadow-sm">
                  <Flag className="w-6 h-6 text-[#9e1316]" />
              </div>
              <div className="flex flex-col">
                  <h1 className="font-black text-lg uppercase tracking-tight leading-none">{t.title} <span className="text-[#9e1316]">{t.pro}</span></h1>
                  <span className="text-[10px] font-bold text-[#8A9099] uppercase tracking-wider">
                      {t.round} {gameState.currentRoundIndex + 1} {t.of} {gameState.targetChain.length}
                  </span>
              </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
              <button onClick={() => setShowRules(true)} className="p-3 bg-white border border-[#E6E1DC] rounded-xl text-[#8A9099] hover:text-[#9e1316] hover:border-[#9e1316] transition-colors" title={t.rulesTitle}>
                  <HelpCircle className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-[#8A9099] uppercase tracking-wider hidden md:block">{t.time}</span>
                  <div className={`font-mono font-black text-xl tabular-nums flex items-center gap-2 transition-colors ${isLowTime ? 'text-red-500 animate-pulse' : 'text-[#1A1F26]'}`}>
                      <Clock className="w-4 h-4" />
                      {String(Math.floor(timeLeft / 60)).padStart(2,'0')}:{String(timeLeft % 60).padStart(2,'0')}
                  </div>
              </div>
              <button onClick={handleEmergencyExit} className="p-3 bg-white border border-[#E6E1DC] rounded-xl text-[#8A9099] hover:text-[#9e1316] hover:border-[#9e1316] transition-colors" title={t.leaveGame}>
                  <LogOut className="w-5 h-5" />
              </button>
          </div>
       </header>

       <main className="flex-1 w-full max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 pb-24 lg:pb-12">

          <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="relative">
                 <FlagRevealCanvas
                    targetCode={currentFlagCode}
                    guesses={me?.guesses || []}
                    isRoundDone={!!isRoundDone}
                    t={t}
                 />

                 {isRoundDone && !isRoundEnd && (
                     <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center z-50 animate-in fade-in duration-500">
                         <div className={`bg-white p-6 md:p-8 rounded-3xl shadow-2xl text-center border-4 max-w-sm mx-4 transform animate-in zoom-in-95 ${isRoundFailed ? 'border-red-500' : 'border-[#9e1316]'}`}>
                             <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isRoundFailed ? 'bg-red-100' : 'bg-emerald-100'}`}>
                                 {isRoundFailed ? (
                                     isTimeFailed ? <Clock className="w-8 h-8 text-red-600" /> : <X className="w-8 h-8 text-red-600" />
                                 ) : <Check className="w-8 h-8 text-emerald-600" />}
                             </div>
                             <h3 className="text-xl md:text-2xl font-black uppercase text-[#1A1F26] mb-2">
                                 {isRoundFailed ? (isTimeFailed ? t.timeUp : t.missionFailed) : t.accepted}
                             </h3>
                             <p className="text-xs md:text-sm font-bold text-[#8A9099] uppercase tracking-wider mb-6">
                                 {t.waitingOthers}
                             </p>
                             <div className="flex justify-center gap-2">
                                 <span className="w-2 h-2 bg-[#1A1F26] rounded-full animate-bounce" />
                                 <span className="w-2 h-2 bg-[#1A1F26] rounded-full animate-bounce delay-75" />
                                 <span className="w-2 h-2 bg-[#1A1F26] rounded-full animate-bounce delay-150" />
                             </div>
                         </div>
                     </div>
                 )}
              </div>

              {/* Input Area */}
              <div className={`relative transition-all duration-300 ${isRoundDone || isCountingDown ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
                   <div className={`relative transform transition-transform ${shake ? 'translate-x-[-10px]' : ''}`}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => { setInput(e.target.value); setShowDropdown(true); }}
                            placeholder={isCountingDown ? '...' : t.inputPlaceholder}
                            className={`
                                w-full bg-white border-2 rounded-2xl py-5 pl-12 pr-6 font-black text-lg md:text-xl text-[#1A1F26]
                                placeholder:text-gray-300 focus:outline-none transition-colors shadow-lg
                                ${shake ? 'border-red-500 text-red-500' : 'border-[#E6E1DC] focus:border-[#9e1316]'}
                            `}
                            disabled={isCountingDown}
                            autoFocus
                        />
                        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${shake ? 'text-red-500' : 'text-gray-400'}`} />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex gap-1">
                            <kbd className="bg-gray-100 border border-gray-200 rounded px-2 py-1 text-[10px] font-bold text-gray-400">TAB</kbd>
                        </div>
                   </div>

                   {showDropdown && input.length > 0 && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-[#E6E1DC] rounded-2xl shadow-2xl z-[100] overflow-hidden max-h-60 md:max-h-80 overflow-y-auto animate-in slide-in-from-bottom-2">
                          {filteredCountries.map(code => (
                              <button
                                  key={code}
                                  onClick={() => handleGuess(code)}
                                  className="w-full text-left px-6 py-4 hover:bg-[#F5F5F0] font-bold text-base flex items-center gap-4 border-b border-gray-50 last:border-0 group transition-colors"
                              >
                                  <img src={COUNTRIES[code.toLowerCase()]?.flagPath} className="w-8 h-6 md:w-10 md:h-7 object-cover rounded shadow-sm group-hover:scale-110 transition-transform" />
                                  <span className="text-[#1A1F26] truncate">{COUNTRIES[code.toLowerCase()]?.name[lang]}</span>
                                  <ArrowRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-[#9e1316] -translate-x-2 group-hover:translate-x-0 transition-all hidden sm:block" />
                              </button>
                          ))}
                          {filteredCountries.length === 0 && (
                              <div className="p-6 text-center text-gray-400 text-xs font-bold uppercase">{t.notFound}</div>
                          )}
                      </div>
                   )}
              </div>

              {/* Guesses */}
              <div className="flex gap-2 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:gap-3 md:overflow-visible custom-scrollbar">
                  {me?.guesses.slice().reverse().map((code, i) => {
                      const isTarget = code === currentFlagCode.toLowerCase();
                      const cData = COUNTRIES[code];
                      return (
                          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border min-w-[220px] md:min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-300 ${isTarget ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-[#E6E1DC]'}`}>
                              <img src={cData?.flagPath} className="w-10 h-7 object-cover rounded shadow-sm grayscale-[0.2]" />
                              <div className="flex flex-col min-w-0">
                                  <span className={`font-bold text-sm truncate ${isTarget ? 'text-emerald-800' : 'text-[#1A1F26]'}`}>{cData?.name[lang]}</span>
                                  <span className="text-[10px] text-gray-400 font-bold uppercase">{cData?.continent}</span>
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-[#1A1F26] rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#9e1316] rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative z-10 flex justify-between items-end">
                      <div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t.score}</div>
                          <div className="text-4xl font-black tracking-tighter">{me?.score || 0}</div>
                      </div>
                      <div className="text-right">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t.accuracy}</div>
                          <div className={`text-xl font-bold flex items-center gap-1 justify-end ${calculateAccuracy(me) > 80 ? 'text-emerald-400' : 'text-white'}`}>
                              <Target className="w-4 h-4" /> {calculateAccuracy(me)}%
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-white rounded-[32px] border border-[#E6E1DC] p-6 flex-1 shadow-sm">
                  <h3 className="text-xs font-black text-[#8A9099] uppercase tracking-widest mb-6 flex items-center gap-2">
                      <Zap className="w-3 h-3 text-[#9e1316]" /> {t.status}
                  </h3>
                  <div className="space-y-4">
                      {gameState.players.map(p => {
                          const isDone = p.hasFinishedRound;
                          const isMe = p.id === userId;
                          const hasFailed = isDone && p.roundScore === 0;

                          return (
                              <div key={p.id} className={`flex items-center justify-between group ${isDone ? 'opacity-100' : 'opacity-80'}`}>
                                  <div className="flex items-center gap-3">
                                      <div className="relative">
                                          <div className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-all ${isDone ? (hasFailed ? 'border-red-500' : 'border-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]') : (isMe ? 'border-[#1A1F26]' : 'border-transparent bg-gray-100')}`}>
                                              <img src={p.avatarUrl} className="w-full h-full object-cover" />
                                          </div>
                                          {isDone && (
                                              <div className={`absolute -bottom-1 -right-1 border-2 border-white rounded-full p-0.5 animate-in zoom-in ${hasFailed ? 'bg-red-500' : 'bg-emerald-500'}`}>
                                                  {hasFailed ? <X className="w-2 h-2 text-white" /> : <Check className="w-2 h-2 text-white" />}
                                              </div>
                                          )}
                                      </div>
                                      <div className="flex flex-col">
                                          <span className={`font-bold text-sm ${isMe ? 'text-[#1A1F26]' : 'text-gray-600'}`}>{p.name}</span>
                                          <div className="flex items-center gap-2">
                                              <span className="text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                  {isDone ? (
                                                      hasFailed ? <span className="text-red-500">{t.missionFailedShort}</span> : <span className="text-emerald-600">{t.targetFound}</span>
                                                  ) : (
                                                      <span className="text-gray-400 animate-pulse">{t.searching}</span>
                                                  )}
                                              </span>
                                              <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">
                                                  {p.guesses?.length || 0}/10
                                              </span>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="flex flex-col items-end">
                                       <span className={`font-black text-sm ${isMe ? 'text-[#1A1F26]' : 'text-gray-500'}`}>{p.score}</span>
                                       {isDone && p.roundScore > 0 && (
                                           <span className="font-bold text-[10px] text-emerald-600">+{p.roundScore}</span>
                                       )}
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
       </main>

       {isRoundEnd && (
            <div className="fixed inset-0 z-[100] bg-[#1A1F26]/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-[32px] p-2 w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom-10 zoom-in-95 duration-500">
                    <div className="bg-[#F8FAFC] rounded-[24px] p-6 md:p-8 border border-[#E6E1DC]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black uppercase text-[#1A1F26]">{t.roundOver}</h2>
                                <p className="text-xs font-bold text-[#8A9099] uppercase tracking-wider">{t.results}</p>
                            </div>
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#9e1316] text-white rounded-xl flex items-center justify-center font-black text-lg md:text-xl shadow-lg shadow-[#9e1316]/20">
                                {gameState.currentRoundIndex + 1}
                            </div>
                        </div>

                        <div className="relative h-40 md:h-48 rounded-2xl overflow-hidden shadow-md mb-6 group">
                            <img src={COUNTRIES[currentFlagCode.toLowerCase()]?.flagPath} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-4 left-6">
                                <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">{t.correctAnswer}</div>
                                <div className="text-2xl md:text-3xl font-black text-white">{COUNTRIES[currentFlagCode.toLowerCase()]?.name[lang]}</div>
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl border-l-4 mb-6 flex items-center justify-between ${me?.history[me.history.length-1]?.isCorrect ? 'bg-emerald-50 border-emerald-500' : 'bg-red-50 border-red-500'}`}>
                             <div>
                                 <div className="font-bold text-[#1A1F26] text-sm">{t.yourResult}</div>
                                 <div className={`text-xs font-bold uppercase ${me?.history[me.history.length-1]?.isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                                     {me?.history[me.history.length-1]?.isCorrect ? t.success : t.fail}
                                 </div>
                             </div>
                             <div className="font-black text-xl text-[#1A1F26]">
                                 +{me?.history[me.history.length-1]?.points || 0} pts
                             </div>
                        </div>

                        {!me?.isReadyForNextRound ? (
                            <button onClick={readyNextRound} className="w-full py-4 bg-[#1A1F26] text-white rounded-xl font-black uppercase tracking-widest hover:bg-[#9e1316] hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 group">
                                {t.nextRound} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <div className="w-full py-4 bg-[#F5F5F0] text-[#8A9099] rounded-xl font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" /> {t.waitingGroup}
                            </div>
                        )}

                        <div className="mt-4 flex justify-center gap-2">
                            {gameState.players.map(p => (
                                <div key={p.id} className={`w-2 h-2 rounded-full transition-colors ${p.isReadyForNextRound ? 'bg-emerald-500' : 'bg-gray-200'}`} title={p.name} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
       )}
    </div>
  );
}