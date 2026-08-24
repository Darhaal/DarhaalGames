import type { User } from '@supabase/supabase-js';

/** UI-layer user (mapped from supabase auth) */
export interface UiUser {
  id: string;
  email?: string;
  name: string;
  avatarUrl: string | null;
  isAnonymous?: boolean;
  user_metadata?: User['user_metadata'];
  created_at?: string;
}
