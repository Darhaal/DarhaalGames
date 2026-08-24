import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';

/** Password recovery is a transactional flow — kept out of the index. */
export const metadata: Metadata = NOINDEX;

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
