import { useEffect, useState, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface PresenceState {
  onlineUserIds: string[];
  isSynced: boolean;
}

export const usePresenceHeartbeat = (roomCode: string, userId?: string) => {
  const [state, setState] = useState<PresenceState>({
    onlineUserIds: [],
    isSynced: false
  });

  // Use a ref to track if we've already subscribed to avoid double-subscriptions in React.StrictMode
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!roomCode || !userId) return;

    // Clean up previous subscription if it exists
    if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
    }

    const channelId = `presence:${roomCode}`;
    const channel = supabase.channel(channelId, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        // The presence state object keys are the userIds because we set 'key: userId' in config
        const userIds = Object.keys(newState);
        setState({ onlineUserIds: userIds, isSynced: true });
      })
      .on('presence', { event: 'join' }, () => {
      })
      .on('presence', { event: 'leave' }, () => {
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            user_id: userId,
          });
        }
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [roomCode, userId]);

  return state;
};