import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/constants/app';
import { absoluteUrl } from '@/lib/seo';

/**
 * Everything under the public /games tree is indexable. The application
 * screens are not: they are auth-gated, per-session or per-lobby, and would
 * only add thin, duplicated URLs to the index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/game/', // live match screens, meaningless without a lobby id
          '/play',
          '/create',
          '/achievements',
          '/reset-password',
          '/api/'
        ]
      }
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    // The Host directive expects a bare domain, not a full URL
    host: new URL(SITE_URL).host
  };
}
