import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';

/** Live match screens are meaningless without a lobby id — kept out of the index. */
export const metadata: Metadata = NOINDEX;

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return children;
}
