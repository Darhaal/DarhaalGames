import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';

/** The lobby browser is session-specific — kept out of the index. */
export const metadata: Metadata = NOINDEX;

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
