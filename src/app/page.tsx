'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  Gamepad2,
  Plus,
  Settings as SettingsIcon,
  Trophy,
  User,
  LogOut,
  Loader2,
  Sparkles,
  Activity,
  Globe,
  Info,
  GitCommit,
  Clock,
  ChevronRight,
  Zap,
  Play
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AuthForm from '@/components/AuthForm';
import Settings from '@/components/Settings';
import { APP_VERSION, VERSION_HISTORY, VersionType } from '@/constants/version';

type Lang = 'ru' | 'en';

function HomeContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [lang, setLang] = useState<Lang>('ru');

  useEffect(() => {
    const savedLang = localStorage.getItem('dg_lang') as Lang;
    if (savedLang) setLang(savedLang);
  }, []);

  const t = {
    ru: {
      welcome: 'С возвращением,',
      status: 'ОНЛАЙН',
      menu: {
        play: { title: 'ИГРАТЬ', sub: 'Поиск матча', desc: 'Начать битву' },
        create: { title: 'СОЗДАТЬ', sub: 'Свои правила', desc: 'Новое лобби' },
        achievements: { title: 'ПРОГРЕСС', sub: 'Статистика', desc: 'Твой путь' },
        settings: { title: 'СИСТЕМА', sub: 'Настройки', desc: 'Опции' }
      },
      footer: '© 2026 Darhaal Games Inc.',
      changelog: 'Хронология',
      latest: 'Последнее'
    },
    en: {
      welcome: 'Welcome back,',
      status: 'ONLINE',
      menu: {
        play: { title: 'PLAY', sub: 'Find Match', desc: 'Start Battle' },
        create: { title: 'CREATE', sub: 'Custom Rules', desc: 'New Lobby' },
        achievements: { title: 'PROGRESS', sub: 'Stats', desc: 'Your Path' },
        settings: { title: 'SYSTEM', sub: 'Settings', desc: 'Options' }
      },
      footer: '© 2026 Darhaal Games Inc.',
      changelog: 'Timeline',
      latest: 'Latest'
    }
  }[lang];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        updateLocalUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) updateLocalUser(session.user);
      else setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateLocalUser = (authUser: any) => {
      const name = authUser.user_metadata?.username || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Player';
      const avatar = authUser.user_metadata?.avatar_url || null;
      setUser({
        id: authUser.id,
        email: authUser.email,
        name: name,
        avatarUrl: avatar,
        isAnonymous: authUser.is_anonymous,
        user_metadata: authUser.user_metadata,
        created_at: authUser.created_at
      });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleProfileUpdate = (updates: { name?: string; avatarUrl?: string }) => {
    if (!user) return;
    setUser((prev: any) => ({
      ...prev,
      name: updates.name || prev.name,
      avatarUrl: updates.avatarUrl || prev.avatarUrl,
      user_metadata: {
        ...prev.user_metadata,
        username: updates.name || prev.user_metadata?.username,
        avatar_url: updates.avatarUrl || prev.user_metadata?.avatar_url
      }
    }));
  };

  const getVerColor = (type: VersionType) => {
      switch(type) {
          case 'init': return 'bg-purple-500 shadow-purple-500/50';
          case 'major': return 'bg-[#9e1316] shadow-[#9e1316]/50';
          case 'minor': return 'bg-blue-500 shadow-blue-500/50';
          case 'patch': return 'bg-emerald-500 shadow-emerald-500/50';
          default: return 'bg-gray-400';
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-[#8A9099]">
        <Loader2 className="w-10 h-10 animate-spin text-[#9e1316]" />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] text-[#1A1F26] flex flex-col items-center justify-center relative overflow-hidden font-sans p-4">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#9e1316]/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse pointer-events-none delay-1000" />

        <div className="relative z-10 w-full flex justify-center scale-100 transition-transform">
           <AuthForm />
        </div>

        <div className="absolute bottom-8 text-[#8A9099] text-[10px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-2">
           <GitCommit className="w-3 h-3" /> v{APP_VERSION} Stable
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#1A1F26] flex flex-col items-center relative overflow-hidden font-sans selection:bg-[#9e1316] selection:text-white">

      {/* --- BACKGROUND FX --- */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-0" />

      <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-[#9e1316]/5 rounded-full blur-[100px] pointer-events-none" />

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
        currentLang={lang}
        setLang={setLang}
        onProfileUpdate={handleProfileUpdate}
      />

      {/* --- HEADER --- */}
      <header className="w-full max-w-7xl px-4 py-4 md:p-6 flex justify-between items-start z-20 relative">
        {/* Profile Pill */}
        <button
            onClick={() => setShowSettings(true)}
            className="group flex items-center gap-2 md:gap-4 bg-white/60 backdrop-blur-xl border border-[#E6E1DC] p-1.5 pr-3 md:p-2 md:pr-6 rounded-full hover:border-[#9e1316]/30 hover:shadow-xl hover:shadow-[#9e1316]/5 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#F5F5F0] border-2 border-white rounded-full flex items-center justify-center overflow-hidden relative shadow-sm group-hover:scale-105 transition-transform z-10">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-[#8A9099]" />
            )}
          </div>
          <div className="flex flex-col items-start z-10 max-w-[100px] md:max-w-none">
            <span className="font-black text-xs md:text-sm text-[#1A1F26] group-hover:text-[#9e1316] transition-colors tracking-tight truncate w-full hidden md:block">
                {user.name}
            </span>
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[9px] font-bold text-[#8A9099] uppercase tracking-wider hidden md:block">
                  {t.status}
                </span>
            </div>
          </div>
        </button>

        {/* Right Actions */}
        <div className="flex flex-col items-end gap-2 md:gap-3">
            <button
              onClick={handleLogout}
              className="p-2.5 md:p-3 bg-white/60 backdrop-blur-xl border border-[#E6E1DC] text-[#8A9099] hover:text-[#9e1316] hover:border-[#9e1316]/30 hover:bg-red-50 rounded-full transition-all shadow-sm group"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* VERSION (Right under logout) */}
            <div className="relative group/version hidden md:block">
                 <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/50 backdrop-blur-md border border-[#E6E1DC] rounded-full cursor-help hover:border-[#9e1316]/30 transition-colors">
                    <span className="text-[9px] font-black tracking-widest uppercase text-[#8A9099] group-hover/version:text-[#9e1316]">v{APP_VERSION}</span>
                 </div>

                 {/* Timeline Popover */}
                 <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-2xl border border-[#E6E1DC] rounded-2xl shadow-2xl p-0 opacity-0 invisible group-hover/version:opacity-100 group-hover/version:visible transition-all duration-300 transform group-hover/version:translate-y-0 -translate-y-2 z-50 text-left overflow-hidden">
                     <div className="p-4 border-b border-[#F5F5F0] bg-gray-50/50 flex items-center justify-between">
                         <h4 className="text-[10px] font-black uppercase text-[#1A1F26] tracking-[0.2em]">{t.changelog}</h4>
                         <Clock className="w-3 h-3 text-[#9e1316]" />
                     </div>

                     <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-5 space-y-5">
                        {VERSION_HISTORY.map((log, i) => (
                            <div key={i} className="relative pl-5 border-l-2 border-[#E6E1DC] last:border-transparent pb-1">
                               <div className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${getVerColor(log.type)} ring-4 ring-white shadow-sm`} />
                               <div className="flex justify-between items-center mb-1">
                                   <span className="text-[10px] font-black text-[#1A1F26] bg-[#F5F5F0] px-1.5 py-0.5 rounded">{log.ver}</span>
                                   <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">{log.date}</span>
                               </div>
                               <div className="text-xs font-bold text-[#1A1F26] mb-1">{log.title?.[lang]}</div>
                               <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                                   {log.desc?.[lang]}
                               </p>
                            </div>
                        ))}
                     </div>
                 </div>
            </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl px-4 md:px-6 z-10 py-4 pb-20">

        {/* Welcome Block */}
        <div className="text-center mb-8 md:mb-12 animate-in slide-in-from-bottom-8 duration-700 fade-in w-full">
          <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter text-[#1A1F26] leading-none drop-shadow-sm">
            {t.welcome} <br className="md:hidden" />
            <span className="text-[#9e1316] relative inline-block">
                {user.name}
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-[#9e1316] absolute -top-2 -right-6 md:-right-8 animate-pulse opacity-50" />
            </span>
          </h1>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 w-full h-auto md:h-[450px]">

          {/* PLAY BUTTON (Light & Premium Red Accent) */}
          <button
            onClick={() => router.push('/play')}
            className="group md:col-span-5 relative flex flex-col justify-between p-6 md:p-8 rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl shadow-[#1A1F26]/5 transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl bg-white border-4 border-[#F5F5F0] hover:border-[#9e1316]/20 min-h-[200px] md:min-h-0"
          >
             {/* Background Texture */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 mix-blend-overlay" />
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#9e1316]/5 rounded-full blur-[80px] group-hover:bg-[#9e1316]/10 transition-colors duration-700" />

             {/* Icon */}
             <div className="w-fit p-4 bg-[#9e1316] text-white rounded-3xl shadow-lg shadow-[#9e1316]/30 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 mb-8 md:mb-0">
                 <Gamepad2 className="w-8 h-8" />
             </div>

             <div className="relative z-20 text-left mt-auto">
                 <div className="flex items-center gap-2 mb-2">
                     <span className="w-2 h-2 bg-[#9e1316] rounded-full animate-pulse" />
                     <span className="text-[#9e1316] text-[10px] font-black uppercase tracking-widest">{t.menu.play.sub}</span>
                 </div>
                 <h3 className="text-4xl md:text-5xl font-black text-[#1A1F26] mb-2 tracking-tighter">{t.menu.play.title}</h3>
                 <div className="flex items-center justify-between mt-4">
                     <p className="text-[#8A9099] text-sm font-bold tracking-wide group-hover:text-[#1A1F26] transition-colors">{t.menu.play.desc}</p>
                     <div className="w-10 h-10 rounded-full bg-[#F5F5F0] flex items-center justify-center group-hover:bg-[#9e1316] group-hover:text-white transition-all duration-300">
                        <Play className="w-4 h-4 fill-current" />
                     </div>
                 </div>
             </div>
          </button>

          {/* CREATE (Blue Accent) & ACHIEVEMENTS (Gold Accent) */}
          <div className="md:col-span-4 flex flex-col gap-4 md:gap-5">
             <button
                onClick={() => router.push('/create')}
                className="group flex-1 bg-white border border-[#E6E1DC] rounded-[24px] md:rounded-[32px] p-6 text-left relative overflow-hidden transition-all duration-300 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 min-h-[140px]"
             >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] transition-colors group-hover:bg-blue-100/50" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="p-3 bg-blue-50 text-blue-600 w-fit rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                        <Plus className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-[#8A9099] uppercase tracking-wider mb-1 group-hover:text-blue-500 transition-colors">{t.menu.create.sub}</div>
                        <h3 className="text-2xl font-black text-[#1A1F26]">{t.menu.create.title}</h3>
                    </div>
                </div>
             </button>

             <button
                onClick={() => router.push('/achievements')}
                className="group flex-1 bg-white border border-[#E6E1DC] rounded-[24px] md:rounded-[32px] p-6 text-left relative overflow-hidden transition-all duration-300 hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 min-h-[140px]"
             >
                 <div className="absolute bottom-0 right-0 w-24 h-24 bg-amber-50 rounded-tl-[100px] group-hover:bg-amber-100/50 transition-colors" />
                 <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-amber-50 text-amber-600 w-fit rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                            <Trophy className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-[#8A9099] uppercase tracking-wider mb-1 group-hover:text-amber-600 transition-colors">{t.menu.achievements.sub}</div>
                        <h3 className="text-2xl font-black text-[#1A1F26]">{t.menu.achievements.title}</h3>
                    </div>
                </div>
             </button>
          </div>

          {/* SETTINGS (Green Accent Updated) */}
          <button
            onClick={() => setShowSettings(true)}
            className="md:col-span-3 bg-white border border-[#E6E1DC] rounded-[24px] md:rounded-[32px] p-6 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:border-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/5 hover:-translate-y-1 min-h-[140px]"
          >
             <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[100px] transition-colors group-hover:bg-emerald-100/50" />
             <div className="relative z-10 w-full flex justify-end">
                 <div className="p-3 bg-emerald-50 text-emerald-600 w-fit rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <SettingsIcon className="w-6 h-6 group-hover:rotate-90 transition-all duration-700 ease-out" />
                 </div>
             </div>
             <div className="relative z-10 text-left">
                 <div className="text-[10px] font-bold text-[#8A9099] uppercase tracking-wider mb-1 group-hover:text-emerald-600 transition-colors">{t.menu.settings.sub}</div>
                 <h3 className="text-xl font-black text-[#1A1F26]">{t.menu.settings.title}</h3>
             </div>
          </button>

        </div>
      </div>

      <footer className="w-full p-8 text-center z-10 mt-auto opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-[#1A1F26] text-[10px] font-black tracking-[0.3em] cursor-default flex items-center justify-center gap-2">
            <Zap className="w-3 h-3 text-[#9e1316]" /> {t.footer}
        </p>
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#9e1316]" /></div>}>
      <HomeContent />
    </Suspense>
  );
}