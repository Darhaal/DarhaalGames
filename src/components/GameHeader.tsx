'use client';

import React from 'react';
import { LogOut, HelpCircle, Clock, Book } from 'lucide-react';

interface GameHeaderProps {
  title: string;
  icon: React.ElementType;
  timeLeft?: number;
  showTime?: boolean;
  onLeave: () => void;
  onShowRules?: () => void;
  onShowGuide?: () => void;
  lang: 'ru' | 'en';
  accentColor?: string;
}

export default function GameHeader({
  title,
  icon: Icon,
  timeLeft,
  showTime = true,
  onLeave,
  onShowRules,
  onShowGuide,
  lang,
}: GameHeaderProps) {

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const t = {
    ru: { leave: 'Выйти', rules: 'Правила', guide: 'Гайд' },
    en: { leave: 'Leave', rules: 'Rules', guide: 'Guide' }
  }[lang];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-[#E6E1DC] transition-all">
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">

        {/* Left: Identity */}
        <div className="flex items-center gap-4 group cursor-default">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#F5F5F0] rounded-2xl flex items-center justify-center border border-[#E6E1DC] shadow-sm group-hover:border-[#9e1316]/20 transition-colors">
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-[#1A1F26] group-hover:text-[#9e1316] transition-colors" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-black text-[#1A1F26] uppercase tracking-tight leading-none">
              {title}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
               <span className="w-1.5 h-1.5 rounded-full bg-[#9e1316]" />
               <span className="text-[10px] font-bold text-[#8A9099] uppercase tracking-[0.2em] group-hover:text-[#1A1F26] transition-colors">
                 by Darhaal
               </span>
            </div>
          </div>
        </div>

        {/* Center: Timer */}
        {showTime && timeLeft !== undefined && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex flex-col items-center pointer-events-none">
            <div className={`text-3xl font-black tabular-nums tracking-tight leading-none ${timeLeft < 10 ? 'text-[#9e1316] animate-pulse' : 'text-[#1A1F26]'}`}>
               {formatTime(timeLeft)}
            </div>
          </div>
        )}

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile Timer */}
          {showTime && timeLeft !== undefined && (
             <div className={`md:hidden font-mono font-black text-lg mr-2 ${timeLeft < 10 ? 'text-[#9e1316] animate-pulse' : 'text-[#1A1F26]'}`}>
                {formatTime(timeLeft)}
             </div>
          )}

          {onShowGuide && (
            <button onClick={onShowGuide} className="p-3 rounded-xl text-[#8A9099] hover:bg-[#F5F5F0] hover:text-[#1A1F26] transition-all border border-transparent hover:border-[#E6E1DC]" title={t.guide}>
              <Book className="w-5 h-5" />
            </button>
          )}

          {onShowRules && (
            <button onClick={onShowRules} className="p-3 rounded-xl text-[#8A9099] hover:bg-[#F5F5F0] hover:text-[#1A1F26] transition-all border border-transparent hover:border-[#E6E1DC]" title={t.rules}>
              <HelpCircle className="w-5 h-5" />
            </button>
          )}

          <div className="h-8 w-px bg-[#E6E1DC] mx-2 hidden md:block" />

          <button
            onClick={onLeave}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E6E1DC] text-[#1A1F26] rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#F5F5F0] hover:text-[#9e1316] hover:border-[#9e1316]/20 transition-all shadow-sm active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">{t.leave}</span>
          </button>
        </div>

      </div>
    </header>
  );
}