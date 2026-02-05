import { supabase } from '@/lib/supabase';

export type GameType = 'minesweeper' | 'flager' | 'battleship' | 'coup';
export type GameResult = 'win' | 'loss';
export type GameMode = 'single' | 'multi';

interface GameSessionStats {
    gameType: GameType;
    result: GameResult;
    durationSeconds: number;
    mode?: GameMode;
    extraCount?: number; // Новое поле для "стран угадано" или "мин найдено"
}

export async function updatePlayerStats(userId: string, session: GameSessionStats) {
    if (!userId) return;

    try {
        const { data: currentStats, error: fetchError } = await supabase
            .from('player_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (fetchError && fetchError.code === 'PGRST116') {
             console.warn('Stats record not found for user');
             return;
        }

        const stats = currentStats || {};
        const details = stats.details || {
            minesweeper: { wins: 0, lost: 0, time: 0 },
            flager: { wins: 0, lost: 0, time: 0 },
            battleship: { wins: 0, lost: 0, time: 0 },
            coup: { wins: 0, lost: 0, time: 0 }
        };

        const { gameType, result, durationSeconds, mode, extraCount } = session;
        const minutesPlayed = Math.max(1, Math.round(durationSeconds / 60));

        if (mode && (gameType === 'minesweeper' || gameType === 'flager')) {
            if (!details[gameType]) {
                details[gameType] = {
                    single: { wins: 0, lost: 0, time: 0, extra: 0 },
                    multi: { wins: 0, lost: 0, time: 0, extra: 0 }
                };
            }

            // Миграция старых данных
            if (typeof details[gameType].wins === 'number') {
                const oldStats = { ...details[gameType], extra: 0 };
                details[gameType] = {
                    single: oldStats,
                    multi: { wins: 0, lost: 0, time: 0, extra: 0 }
                };
            }

            if (!details[gameType][mode]) {
                details[gameType][mode] = { wins: 0, lost: 0, time: 0, extra: 0 };
            }

            const targetStat = details[gameType][mode];
            if (result === 'win') targetStat.wins++;
            else targetStat.lost++;
            targetStat.time += minutesPlayed;
            // Обновляем доп. статистику
            if (extraCount) {
                targetStat.extra = (targetStat.extra || 0) + extraCount;
            }

        } else {
            if (!details[gameType]) details[gameType] = { wins: 0, lost: 0, time: 0 };

            if (result === 'win') details[gameType].wins++;
            else details[gameType].lost++;
            details[gameType].time += minutesPlayed;
        }

        const newTotalGames = (stats.total_games || 0) + 1;

        const { error: updateError } = await supabase
            .from('player_stats')
            .update({
                total_games: newTotalGames,
                details: details,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (updateError) console.error('Error updating stats:', updateError);

    } catch (e) {
        console.error('Unexpected error in updatePlayerStats:', e);
    }
}