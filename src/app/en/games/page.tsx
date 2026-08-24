import type { Metadata } from 'next';
import GamesHub from '@/components/seo/GamesHub';
import { hubMetadata } from '@/lib/seo';

export const metadata: Metadata = hubMetadata('en');

export default function GamesHubPageEn() {
  return <GamesHub locale="en" />;
}
