import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';

/** Personal statistics are private to each account — kept out of the index. */
export const metadata: Metadata = NOINDEX;

export default function AchievementsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
