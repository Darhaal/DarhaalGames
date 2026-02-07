'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import UniversalLobby, { LobbyPlayer } from '@/components/UniversalLobby';
import { useSpyfallGame } from '@/hooks/useSpyfallGame';
import SpyfallGame from '@/components/SpyfallGame';

type Lang = 'ru' | 'en';

const UI_TEXT = {
  ru: {
    lobbyNotFound: 'Лобби не найдено',
    gameFinished: 'Игра завершена',
    toMenu: 'В меню',
    loading: 'Загрузка...',
  },
  en: {
    lobbyNotFound: 'LOBBY NOT FOUND',
    gameFinished: 'Game Finished',
    toMenu: 'Main Menu',
    loading: 'Loading...',
  }
};

function SpyfallContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lobbyId = searchParams.get('id');

  const [userId, setUserId] = useState<string>();
  const [userName, setUserName] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [authLoading, setAuthLoading] = useState(true);

  const [isLeaving, setIsLeaving] = useState(false);
  const [lang, setLang] = useState<Lang>('ru');

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
          setUserId(data.user.id);
          const meta = data.user.user_metadata;
          // Fix: Fallback to 'Player' instead of 'Agent'
          const name = meta?.username || (data.user.is_anonymous ? 'Player' : 'Player');
          // Fix: Generate avatar if missing
          const avatar = meta?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.id}&backgroundColor=transparent`;

          setUserName(name);
          setUserAvatar(avatar);
      } else {
          const currentPath = window.location.pathname + window.location.search;
          router.push(`/?returnUrl=${encodeURIComponent(currentPath)}`);
      }
      setAuthLoading(false);
    };
    checkUser();

    const savedLang = localStorage.getItem('dg_lang') as Lang;
    if (savedLang) setLang(savedLang);
  }, [router]);

  const {
    gameState, roomMeta, loading, lobbyDeleted,
    initGame, startGame, endGame, restartGame, leaveGame,
    startNomination, vote
  } = useSpyfallGame(lobbyId, userId);

  useEffect(() => {
      if (userId && gameState && !gameState.players.find(p => p.id === userId)) {
          initGame({ name: userName, avatarUrl: userAvatar });
      }
  }, [userId, gameState, initGame, userName, userAvatar]);

  const handleLeave = async () => {
      if (isLeaving) return;
      setIsLeaving(true);
      try {
        await leaveGame();
      } catch (error) {
        console.error("Leave game failed", error);
      }
      router.push('/play');
  };

  // Safe window close handling
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
       // We can't await here, but we can try to leave if supported
       // Note: Reliable "leave on close" requires Beacon API or similar, which is complex for Supabase.
       // This prevents accidental closing.
       // e.preventDefault();
       // e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const t = UI_TEXT[lang];

  if (authLoading || loading || isLeaving) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-[#9e1316] w-8 h-8" /></div>;

  if (!userId) return null;

  if (lobbyDeleted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-bold text-gray-400 bg-[#F8FAFC]">
          <span className="mb-4 text-xl text-[#1A1F26] uppercase">{t.gameFinished}</span>
          <button onClick={() => router.push('/play')} className="px-6 py-3 bg-[#1A1F26] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#9e1316] transition-colors shadow-lg">
              {t.toMenu}
          </button>
      </div>
    );
  }

  if (!gameState) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">{t.lobbyNotFound}</div>;

  if (gameState.status === 'waiting') {
      const playersList: LobbyPlayer[] = gameState.players.map(p => ({
          id: p.id,
          name: p.name,
          avatarUrl: p.avatarUrl,
          isHost: p.isHost,
          isReady: true
      }));

      return (
        <UniversalLobby
          roomCode={roomMeta?.code || ''}
          roomName={roomMeta?.name || 'Spyfall'}
          gameType="spyfall"
          players={playersList}
          currentUserId={userId}
          minPlayers={3}
          maxPlayers={12}
          onStart={startGame}
          onLeave={handleLeave}
          lang={lang}
        />
      );
  }

  return (
    <SpyfallGame
      gameState={gameState}
      userId={userId}
      startGame={startGame}
      endGame={endGame}
      restartGame={restartGame}
      leaveGame={handleLeave}
      startNomination={startNomination}
      vote={vote}
      lang={lang}
    />
  );
}

export default function SpyfallPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-[#9e1316] w-8 h-8" /></div>}>
      <SpyfallContent />
    </Suspense>
  );
}