'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import UniversalLobby, { LobbyPlayer } from '@/components/UniversalLobby';
import { useMinesweeperGame } from '@/hooks/useMinesweeperGame';
import MinesweeperGame from '@/components/MinesweeperGame';

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

function MinesweeperContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lobbyId = searchParams.get('id');

  const [userId, setUserId] = useState<string>();
  const [userName, setUserName] = useState<string>('');
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [isLeaving, setIsLeaving] = useState(false);
  const [lang, setLang] = useState<Lang>('ru');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
            setUserId(data.user.id);
            setUserName(data.user.user_metadata?.username || 'Player');
            setUserAvatar(data.user.user_metadata?.avatar_url || '');
        }
    });
    const savedLang = localStorage.getItem('dg_lang') as Lang;
    if (savedLang) setLang(savedLang);
  }, []);

  const {
    gameState, roomMeta, loading, lobbyDeleted,
    initGame, startGame, revealCell, toggleFlag, chordCell, leaveGame, handleTimeout
  } = useMinesweeperGame(lobbyId, userId);

  // Инициализация игрока при входе
  useEffect(() => {
      // Инициализируем только если пользователь загружен и состояние игры доступно
      if (userId && gameState && !gameState.players[userId]) {
          initGame({ name: userName, avatarUrl: userAvatar });
      }
  }, [userId, gameState, userName, userAvatar, initGame]); // Зависимости важны

  const handleLeave = async () => {
      if (isLeaving) return;
      setIsLeaving(true);
      await leaveGame();
      router.push('/');
  };

  const t = UI_TEXT[lang];

  if (loading || isLeaving) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-[#9e1316] w-8 h-8" /></div>;

  if (lobbyDeleted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-bold text-gray-400 bg-[#F8FAFC]">
          <span className="mb-4 text-xl text-[#1A1F26] uppercase">{t.gameFinished}</span>
          <button onClick={() => router.push('/')} className="px-6 py-3 bg-[#1A1F26] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#9e1316] transition-colors shadow-lg">
              {t.toMenu}
          </button>
      </div>
    );
  }

  if (!gameState) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400">{t.lobbyNotFound}</div>;

  // ЛОББИ: Показываем если статус waiting
  if (gameState.status === 'waiting') {
      const playersList: LobbyPlayer[] = Object.values(gameState.players).map(p => ({
          id: p.id,
          name: p.name,
          avatarUrl: p.avatarUrl,
          isHost: p.isHost,
          isReady: true
      }));

      return (
        <UniversalLobby
          roomCode={roomMeta?.code || ''}
          roomName={roomMeta?.name || 'Minesweeper'}
          gameType="minesweeper"
          players={playersList}
          currentUserId={userId}
          minPlayers={1}
          maxPlayers={gameState.settings.maxPlayers}
          onStart={startGame}
          onLeave={handleLeave}
          lang={lang}
        />
      );
  }

  if (userId) {
      return (
        <MinesweeperGame
          gameState={gameState}
          userId={userId}
          revealCell={revealCell}
          toggleFlag={toggleFlag}
          chordCell={chordCell}
          startGame={startGame}
          leaveGame={handleLeave}
          handleTimeout={handleTimeout}
          lang={lang}
        />
      );
  }
  return null;
}

export default function MinesweeperPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-[#9e1316] w-8 h-8" /></div>}>
      <MinesweeperContent />
    </Suspense>
  );
}