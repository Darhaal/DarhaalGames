import type { MetadataRoute } from 'next';
import { APP_NAME, APP_TAGLINE } from '@/constants/app';

/** Web app manifest — installability plus richer mobile search presentation. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: 'Darhaal',
    description: APP_TAGLINE.ru,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#F8FAFC',
    theme_color: '#9e1316',
    lang: 'ru',
    categories: ['games', 'entertainment'],
    icons: [
      {
        src: '/logo512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/logo512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  };
}
