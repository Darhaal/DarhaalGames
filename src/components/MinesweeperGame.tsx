'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  Bomb, Flag, Trophy, Clock,
  ZoomIn, ZoomOut, LogOut, HelpCircle, X,
  MousePointer2, Zap, LayoutGrid, Maximize, Loader2, Eye, Move,
  Keyboard, AlertCircle, Skull, UserX, Shovel
} from 'lucide-react';
import { MinesweeperState, MinesweeperPlayer, Cell } from '@/types/minesweeper';
import { useRouter } from 'next/navigation';

// --- THEME & STYLES ---
const COLORS = {
  hidden: "bg-slate-200 border-b-2 border-r-2 border-slate-300 hover:brightness-105",
  open: "bg-white border-[0.5px] border-slate-100",
  flagged: "bg-slate-200 border-b-2 border-r-2 border-slate-300",
  mine: "bg-[#9e1316] text-white border-none",
  numbers: [
    "",
    "text-blue-600", "text-emerald-600", "text-red-600", "text-indigo-700",
    "text-amber-700", "text-cyan-700", "text-black", "text-gray-600"
  ]
};

const UI_TEXT = {
  ru: {
    mines: 'МИНЫ',
    time: 'ВРЕМЯ',
    victory: 'ПОБЕДА',
    defeat: 'ВЗРЫВ',
    leave: 'ВЫЙТИ',
    start: 'НАЧАТЬ',
    waiting: 'ОЖИДАНИЕ...',
    you: '(Вы)',
    results: 'РЕЗУЛЬТАТЫ',
    player: 'Игрок',
    status: 'Статус',
    progress: 'Прогресс',
    timeStat: 'Время',
    dig: 'Копать',
    flag: 'Флаг',
    rulesTitle: 'ИНСТРУКТАЖ',
    rules: {
       objTitle: 'Цель игры',
       objText: 'Очистить сектор от мин. Любая ошибка фатальна.',
       ctrlTitle: 'Управление',
       ctrlClick: 'ЛКМ — Открыть клетку',
       ctrlFlag: 'ПКМ / Пробел — Поставить флаг',
       ctrlCam: 'WASD / Драг — Перемещение',
       ctrlZoom: 'Колесо — Масштаб',
       mechTitle: 'Механики',
       mechNum: 'Цифра = кол-во мин вокруг (3x3).',
       mechChord: 'Аккорд: Пробел или клик по открытой цифре -> открывает соседей (если флаги расставлены).',
       mechSafe: 'Первый клик всегда безопасен.'
    },
    won: 'ПОБЕДА',
    dead: 'МЕРТВ',
    alive: 'В ИГРЕ',
    left: 'ВЫШЕЛ',
    viewBoard: 'СМОТРЕТЬ КАРТУ',
    showResults: 'ИТОГИ'
  },
  en: {
    mines: 'MINES',
    time: 'TIME',
    victory: 'VICTORY',
    defeat: 'DEFEAT',
    leave: 'LEAVE',
    start: 'START',
    waiting: 'WAITING...',
    you: '(You)',
    results: 'RESULTS',
    player: 'Player',
    status: 'Status',
    progress: 'Progress',
    timeStat: 'Time',
    dig: 'Dig',
    flag: 'Flag',
    rulesTitle: 'BRIEFING',
    rules: {
       objTitle: 'Game Objective',
       objText: 'Clear the sector of mines. Any mistake is fatal.',
       ctrlTitle: 'Controls',
       ctrlClick: 'LMB — Open cell',
       ctrlFlag: 'RMB / Space — Place flag',
       ctrlCam: 'WASD / Drag — Pan camera',
       ctrlZoom: 'Wheel — Zoom',
       mechTitle: 'Mechanics',
       mechNum: 'Number = count of adjacent mines.',
       mechChord: 'Chord: Space or Click open number -> opens neighbors (if flags match).',
       mechSafe: 'First click is always safe.'
    },
    won: 'WON',
    dead: 'DEAD',
    alive: 'ALIVE',
    left: 'LEFT',
    viewBoard: 'VIEW BOARD',
    showResults: 'RESULTS'
  }
};

interface MinesweeperGameProps {
  gameState: MinesweeperState;
  userId: string;
  revealCell: (x: number, y: number) => void;
  toggleFlag: (x: number, y: number) => void;
  chordCell: (x: number, y: number) => void;
  startGame: () => void;
  leaveGame: () => void;
  handleTimeout?: () => void;
  lang: 'ru' | 'en';
}

const RulesModal = ({ onClose, t }: { onClose: () => void, t: any }) => (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl border-4 border-[#1A1F26] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-[#1A1F26] text-white flex justify-between items-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <h2 className="text-xl font-black uppercase flex items-center gap-3 relative z-10 tracking-widest">
                    <HelpCircle className="w-6 h-6 text-[#9e1316]" /> {t.rulesTitle}
                </h2>
                <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
                <section>
                    <h3 className="text-xs font-black text-[#8A9099] uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Trophy className="w-3 h-3" /> {t.rules.objTitle}
                    </h3>
                    <div className="bg-white p-4 rounded-2xl border border-[#E6E1DC] shadow-sm text-sm font-bold text-[#1A1F26] leading-relaxed">
                        {t.rules.objText}
                    </div>
                </section>
                <section>
                    <h3 className="text-xs font-black text-[#8A9099] uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Keyboard className="w-3 h-3" /> {t.rules.ctrlTitle}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#E6E1DC] text-xs font-bold text-[#1A1F26]">
                            <MousePointer2 className="w-4 h-4 text-[#9e1316]" /> {t.rules.ctrlClick}
                        </div>
                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#E6E1DC] text-xs font-bold text-[#1A1F26]">
                            <Flag className="w-4 h-4 text-[#9e1316]" /> {t.rules.ctrlFlag}
                        </div>
                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#E6E1DC] text-xs font-bold text-[#1A1F26]">
                            <Move className="w-4 h-4 text-[#8A9099]" /> {t.rules.ctrlCam}
                        </div>
                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-[#E6E1DC] text-xs font-bold text-[#1A1F26]">
                            <Maximize className="w-4 h-4 text-[#8A9099]" /> {t.rules.ctrlZoom}
                        </div>
                    </div>
                </section>
                <section>
                    <h3 className="text-xs font-black text-[#8A9099] uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Zap className="w-3 h-3" /> {t.rules.mechTitle}
                    </h3>
                    <ul className="space-y-2 text-xs font-medium text-gray-600">
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 mt-1.5 bg-[#9e1316] rounded-full shrink-0"/> {t.rules.mechNum}</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 mt-1.5 bg-[#9e1316] rounded-full shrink-0"/> {t.rules.mechChord}</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 mt-1.5 bg-[#9e1316] rounded-full shrink-0"/> {t.rules.mechSafe}</li>
                    </ul>
                </section>
            </div>

            <div className="p-4 border-t border-[#E6E1DC] bg-white shrink-0">
                <button onClick={onClose} className="w-full bg-[#1A1F26] text-white py-4 rounded-2xl font-black uppercase hover:bg-[#9e1316] transition-colors shadow-lg tracking-widest text-sm">
                    OK
                </button>
            </div>
        </div>
    </div>
);

const CellComponent = memo(({ cell, onClick, onContextMenu, onMouseEnter }: { cell: Cell, onClick: () => void, onContextMenu: (e: React.MouseEvent) => void, onMouseEnter?: () => void }) => {
  let content = null;
  let styleClass = COLORS.hidden;

  if (cell.isOpen) {
    styleClass = COLORS.open;
    if (cell.isMine) {
      styleClass = COLORS.mine;
      content = <Bomb className="w-1/2 h-1/2 fill-current animate-bounce" />;
    } else if (cell.neighborCount > 0) {
      content = <span className={`font-black text-sm sm:text-base select-none ${COLORS.numbers[cell.neighborCount]}`}>{cell.neighborCount}</span>;
    }
  } else if (cell.isFlagged) {
    styleClass = COLORS.flagged;
    content = <Flag className="w-1/2 h-1/2 text-[#9e1316] fill-[#9e1316]" />;
  }

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      className={`${styleClass} w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center cursor-pointer transition-all duration-75 rounded-sm sm:rounded-md select-none relative`}
    >
      {content}
    </div>
  );
});
CellComponent.displayName = 'Cell';

const BoardView = ({ player, isMe, onReveal, onFlag, onChord, scale = 1, isTouchModeFlag }: any) => {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredCell = useRef<{x: number, y: number} | null>(null);

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const startOffset = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const clampOffset = (newX: number, newY: number, z: number) => {
      if (!player.board[0]) return { x: 0, y: 0 };
      const boardW = player.board[0].length * 32 * z * scale;
      const boardH = player.board.length * 32 * z * scale;
      const limitX = boardW / 1.5 + 100;
      const limitY = boardH / 1.5 + 100;
      return {
          x: Math.max(-limitX, Math.min(limitX, newX)),
          y: Math.max(-limitY, Math.min(limitY, newY))
      };
  };

  useEffect(() => {
      if (!isMe) return;
      const handleKeyDown = (e: KeyboardEvent) => {
          if (player.status !== 'playing') return;
          if (e.code === 'Space') {
              e.preventDefault();
              if (hoveredCell.current) {
                  const { x, y } = hoveredCell.current;
                  const cell = player.board[y]?.[x];
                  if (cell) {
                      if (cell.isOpen) onChord(x, y);
                      else onFlag(x, y);
                  }
              }
              return;
          }
          const step = 40 / zoom;
          let newX = offset.x;
          let newY = offset.y;
          switch(e.code) {
              case 'KeyW': newY += step; break;
              case 'KeyS': newY -= step; break;
              case 'KeyA': newX += step; break;
              case 'KeyD': newX -= step; break;
              default: return;
          }
          setOffset(clampOffset(newX, newY, zoom));
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMe, zoom, offset, player.status, onFlag, onChord]);

  const onPointerDown = (e: React.PointerEvent) => {
      isDragging.current = true;
      hasMoved.current = false;
      dragStart.current = { x: e.clientX, y: e.clientY };
      startOffset.current = { ...offset };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      const dx = (e.clientX - dragStart.current.x) / zoom;
      const dy = (e.clientY - dragStart.current.y) / zoom;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true;
      const nextX = startOffset.current.x + dx;
      const nextY = startOffset.current.y + dy;
      setOffset(clampOffset(nextX, nextY, zoom));
  };

  const onPointerUp = (e: React.PointerEvent) => {
      isDragging.current = false;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleCellClick = (cell: Cell) => {
      if (hasMoved.current) return;
      if (!isMe || player.status !== 'playing') return;
      if (cell.isOpen) onChord(cell.x, cell.y);
      else {
          if (isTouchModeFlag) onFlag(cell.x, cell.y);
          else onReveal(cell.x, cell.y);
      }
  };

  const handleCellContext = (e: React.MouseEvent, cell: Cell) => {
      e.preventDefault();
      if (hasMoved.current) return;
      if (!isMe || player.status !== 'playing') return;
      onFlag(cell.x, cell.y);
  };

  const handleWheel = (e: React.WheelEvent) => {
      if (e.ctrlKey || !isMe) {
          e.preventDefault();
          const delta = -e.deltaY * 0.001;
          const nextZoom = Math.min(Math.max(0.5, zoom + delta), 4);
          setZoom(nextZoom);
          setOffset(prev => clampOffset(prev.x, prev.y, nextZoom));
      }
  };

  const borderColor = player.status === 'won' ? 'border-emerald-500 shadow-emerald-500/20' : (player.status === 'lost' || player.status === 'left') ? 'border-red-500 shadow-red-500/20' : 'border-[#E6E1DC] shadow-[#1A1F26]/5';

  // Removed darkening for 'lost', kept for 'left'
  const overlayOpacity = (player.status === 'left') ? 'grayscale opacity-75' : '';

  return (
    <div className={`relative flex flex-col h-full bg-white rounded-[32px] border-4 overflow-hidden shadow-xl transition-all ${borderColor} ${overlayOpacity}`}>
        <div className="shrink-0 p-3 border-b border-[#F1F5F9] flex justify-between items-center bg-white/90 backdrop-blur-md z-20">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden relative">
                    <img src={player.avatarUrl} className="w-full h-full object-cover" />
                    {player.status === 'won' && <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center animate-in zoom-in"><Trophy className="w-5 h-5 text-white" /></div>}
                    {player.status === 'lost' && <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center animate-in zoom-in"><Skull className="w-5 h-5 text-white" /></div>}
                    {player.status === 'left' && <div className="absolute inset-0 bg-gray-500/80 flex items-center justify-center animate-in zoom-in"><UserX className="w-5 h-5 text-white" /></div>}
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-black uppercase text-[#1A1F26] truncate max-w-[100px]">{player.name} {isMe && '(Вы)'}</span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded w-fit">
                        <Flag className="w-3 h-3 text-[#9e1316]" /> {player.minesLeft}
                    </span>
                </div>
            </div>
            {isMe && (
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                    <button onClick={() => setZoom(z => Math.min(4, z + 0.5))} className="p-1.5 hover:bg-white rounded-lg transition-all shadow-sm"><ZoomIn className="w-4 h-4 text-gray-600"/></button>
                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.5))} className="p-1.5 hover:bg-white rounded-lg transition-all shadow-sm"><ZoomOut className="w-4 h-4 text-gray-600"/></button>
                </div>
            )}
        </div>

        <div
            ref={containerRef}
            className="flex-1 overflow-hidden relative bg-[#F8FAFC] cursor-grab active:cursor-grabbing touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onWheel={handleWheel}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            <div
                className="absolute transition-transform duration-75 ease-linear will-change-transform origin-center"
                style={{
                    transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom * scale})`,
                    left: '50%', top: '50%',
                    marginLeft: `-${(player.board[0]?.length * 32) / 2}px`,
                    marginTop: `-${(player.board.length * 32) / 2}px`
                }}
            >
                <div className="inline-grid gap-[2px] bg-slate-300 p-[2px] rounded shadow-2xl"
                     style={{ gridTemplateColumns: `repeat(${player.board[0]?.length || 10}, min-content)` }}>
                    {player.board.map((row: Cell[], y: number) => row.map((cell: Cell, x: number) => (
                        <CellComponent
                            key={`${x}-${y}`}
                            cell={cell}
                            onClick={() => handleCellClick(cell)}
                            onContextMenu={(e) => handleCellContext(e, cell)}
                            onMouseEnter={() => { if(isMe) hoveredCell.current = {x, y}; }}
                        />
                    )))}
                </div>
            </div>
        </div>

        {/* BIG BOARD OVERLAY FOR DEAD/WON/LEFT */}
        {player.status !== 'playing' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
                {/* Removed global backdrop for LOST/WON to allow viewing the board */}
                {player.status === 'left' && <div className="bg-black/40 backdrop-blur-[1px] absolute inset-0" />}

                {player.status === 'won' && <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl font-black uppercase tracking-widest shadow-xl animate-bounce flex items-center gap-2 z-40 transform -rotate-6 border-4 border-white"><Trophy className="w-6 h-6" /> WON</div>}
                {player.status === 'lost' && <div className="bg-red-600 text-white px-4 py-2 rounded-2xl font-black uppercase tracking-widest shadow-xl animate-in zoom-in flex items-center gap-2 z-40 transform rotate-6 border-4 border-white"><Skull className="w-6 h-6" /> DEAD</div>}
                {player.status === 'left' && <div className="bg-gray-700 text-white px-4 py-2 rounded-2xl font-black uppercase tracking-widest shadow-xl animate-pulse flex items-center gap-2 z-40 border-4 border-white"><UserX className="w-6 h-6" /> LEFT</div>}
            </div>
        )}
    </div>
  );
};

export default function MinesweeperGame({ gameState, userId, revealCell, toggleFlag, chordCell, startGame, leaveGame, handleTimeout, lang }: MinesweeperGameProps) {
  const router = useRouter();
  const [showRules, setShowRules] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const t = UI_TEXT[lang];
  const [timeLeft, setTimeLeft] = useState(gameState.settings.timeLimit || 600);
  const [isTouchModeFlag, setIsTouchModeFlag] = useState(false);

  const players = Object.values(gameState.players);
  const me = gameState.players[userId];
  const opponents = players.filter(p => p.id !== userId);

  useEffect(() => {
      if (gameState.status === 'finished') setShowResults(true);
  }, [gameState.status]);

  useEffect(() => {
      if (gameState.status !== 'playing') return;
      const interval = setInterval(() => {
          const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
          const remaining = Math.max(0, (gameState.settings.timeLimit || 600) - elapsed);
          setTimeLeft(remaining);
          if (remaining === 0 && me?.status === 'playing' && handleTimeout) handleTimeout();
      }, 1000);
      return () => clearInterval(interval);
  }, [gameState.status, gameState.startTime, handleTimeout]);

  const getSortedPlayers = () => {
      return [...players].sort((a, b) => {
          if (a.status === 'won' && b.status !== 'won') return -1;
          if (b.status === 'won' && a.status !== 'won') return 1;
          if (a.status === 'won') return (a.score || 0) - (b.score || 0);
          const getProg = (p: MinesweeperPlayer) => p.board.flat().filter(c => c.isOpen && !c.isMine).length;
          return getProg(b) - getProg(a);
      });
  };

  const getProgress = (p: MinesweeperPlayer) => {
      const totalSafe = (gameState.settings.width * gameState.settings.height) - gameState.settings.minesCount;
      const opened = p.board.flat().filter(c => c.isOpen && !c.isMine).length;
      return Math.min(100, Math.round((opened / totalSafe) * 100));
  };

  if (!me) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#9e1316]" /></div>;

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none" />
        {showRules && <RulesModal onClose={() => setShowRules(false)} t={t} />}

        <header className="shrink-0 h-20 px-6 flex justify-between items-center z-30 relative bg-white/80 backdrop-blur-md border-b border-[#E6E1DC]">
            <div className="flex items-center gap-6">
                <button onClick={() => { leaveGame(); router.push('/'); }} className="group p-3 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100">
                    <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                </button>
                <div>
                    <h1 className="font-black text-xl text-[#1A1F26] uppercase tracking-tight">Minesweeper</h1>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-[#8A9099] tracking-widest mt-0.5">
                        <span className="bg-[#F1F5F9] px-2 py-0.5 rounded">{gameState.settings.width}x{gameState.settings.height}</span>
                        <span className="bg-[#F1F5F9] px-2 py-0.5 rounded text-[#9e1316]">{gameState.settings.minesCount} {t.mines}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsTouchModeFlag(!isTouchModeFlag)}
                    className={`flex sm:hidden items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all border ${isTouchModeFlag ? 'bg-[#1A1F26] text-white border-[#1A1F26]' : 'bg-white text-[#1A1F26] border-[#E6E1DC]'}`}
                >
                    {isTouchModeFlag ? <Flag className="w-4 h-4" /> : <MousePointer2 className="w-4 h-4" />}
                    <span>{isTouchModeFlag ? t.flag : t.dig}</span>
                </button>

                <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all ${timeLeft < 60 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-[#F8FAFC] border-[#E6E1DC] text-[#1A1F26]'}`}>
                    <Clock className="w-5 h-5" />
                    <span className="font-mono font-black text-xl tabular-nums">
                        {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                </div>

                <button onClick={() => setShowRules(true)} className="p-3 bg-white border border-[#E6E1DC] hover:border-[#1A1F26] rounded-2xl text-[#1A1F26] transition-all shadow-sm hidden sm:block">
                    <HelpCircle className="w-5 h-5" />
                </button>

                {gameState.status === 'finished' && !showResults && (
                    <button onClick={() => setShowResults(true)} className="p-3 bg-[#1A1F26] text-white rounded-2xl font-bold uppercase text-xs shadow-lg animate-in slide-in-from-top-2">
                        {t.showResults}
                    </button>
                )}

                {gameState.status === 'waiting' && me.isHost && (
                    <button onClick={startGame} className="bg-[#1A1F26] text-white px-8 py-3 rounded-2xl font-black uppercase text-sm hover:bg-[#9e1316] transition-all shadow-lg hover:shadow-[#9e1316]/20">
                        {t.start}
                    </button>
                )}
                {gameState.status === 'waiting' && !me.isHost && (
                    <div className="px-6 py-3 bg-[#F1F5F9] text-[#8A9099] font-bold text-xs uppercase rounded-2xl animate-pulse tracking-widest">
                        {t.waiting}
                    </div>
                )}
            </div>
        </header>

        <main className={`flex-1 p-4 sm:p-6 grid gap-6 ${players.length === 1 ? 'grid-cols-1' : players.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2'} overflow-hidden`}>
            <div className={`relative ${players.length > 2 ? 'col-span-2 row-span-2 md:col-span-1 md:row-span-1' : ''}`}>
               <BoardView
                  player={me}
                  isMe={true}
                  onReveal={revealCell}
                  onFlag={toggleFlag}
                  onChord={chordCell}
                  isTouchModeFlag={isTouchModeFlag}
               />
            </div>
            {opponents.map(p => (
                <div key={p.id} className="relative opacity-90 hover:opacity-100 transition-opacity">
                    <BoardView player={p} isMe={false} onReveal={()=>{}} onFlag={()=>{}} onChord={()=>{}} scale={players.length > 2 ? 0.8 : 1} />
                </div>
            ))}
        </main>

        {showResults && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-500">
                <div className="bg-white rounded-[40px] overflow-hidden shadow-2xl max-w-2xl w-full border border-[#E6E1DC] flex flex-col max-h-[85vh]">
                    <div className="bg-[#1A1F26] p-8 text-white text-center relative shrink-0">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                        <h2 className="text-4xl font-black uppercase tracking-widest text-white mb-2 relative z-10">
                            {gameState.winner ? t.victory : t.defeat}
                        </h2>
                        {gameState.winner && <div className="text-[#FBBF24] font-bold flex justify-center gap-2 items-center text-sm uppercase tracking-wider relative z-10"><Trophy className="w-4 h-4"/> {gameState.winner}</div>}

                        <button onClick={() => setShowResults(false)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-20" title={t.viewBoard}>
                            <Eye className="w-5 h-5 text-white" />
                        </button>
                    </div>

                    <div className="p-8 bg-[#F8FAFC] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] font-black text-[#8A9099] uppercase tracking-widest border-b border-[#E6E1DC]">
                                    <th className="pb-4 pl-4">{t.player}</th>
                                    <th className="pb-4 text-center">{t.status}</th>
                                    <th className="pb-4 text-center">{t.timeStat}</th>
                                    <th className="pb-4 text-right pr-4">{t.progress}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E6E1DC]">
                                {getSortedPlayers().map((p, idx) => (
                                    <tr key={p.id} className={`group transition-colors hover:bg-white ${p.id === userId ? 'bg-white' : ''}`}>
                                        <td className="py-4 pl-4 font-bold text-[#1A1F26] flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100"><img src={p.avatarUrl} className="w-full h-full object-cover"/></div>
                                            <div>
                                                <div className="text-sm">{p.name}</div>
                                                {idx === 0 && gameState.winner && <div className="text-[9px] text-[#FBBF24] font-black uppercase flex items-center gap-1"><Trophy className="w-3 h-3"/> Winner</div>}
                                            </div>
                                        </td>
                                        <td className="py-4 text-center">
                                            {p.status === 'won' && <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">{t.won}</span>}
                                            {p.status === 'lost' && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">{t.dead}</span>}
                                            {p.status === 'left' && <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">{t.left}</span>}
                                            {p.status === 'playing' && <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">{t.alive}</span>}
                                        </td>
                                        <td className="py-4 text-center font-mono text-sm font-bold text-[#1A1F26]">
                                            {p.score ? `${Math.floor(p.score/60)}:${(p.score%60).toString().padStart(2,'0')}` : '—'}
                                        </td>
                                        <td className="py-4 text-right pr-4">
                                            <div className="flex items-center justify-end gap-3">
                                                <span className="font-black text-sm text-[#1A1F26]">{getProgress(p)}%</span>
                                                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${p.status === 'lost' ? 'bg-red-500' : 'bg-[#1A1F26]'}`} style={{ width: `${getProgress(p)}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 bg-white border-t border-[#E6E1DC] flex justify-center shrink-0">
                        <button onClick={() => { leaveGame(); router.push('/'); }} className="w-full max-w-sm py-4 bg-[#1A1F26] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-[#9e1316] transition-colors shadow-xl shadow-[#1A1F26]/10">
                            {t.leave}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}