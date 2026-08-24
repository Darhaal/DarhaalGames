import type { Metadata } from 'next';
import GamesHub from '@/components/seo/GamesHub';
import { hubMetadata } from '@/lib/seo';

export const metadata: Metadata = hubMetadata('ru');

export default function GamesHubPage() {
  return <GamesHub locale="ru" />;
}
