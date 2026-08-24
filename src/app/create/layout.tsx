import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';

/** Room creation is an authenticated action — kept out of the index. */
export const metadata: Metadata = NOINDEX;

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
