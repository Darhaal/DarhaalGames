import { ImageResponse } from 'next/og';
import { APP_NAME } from '@/constants/app';

/**
 * Shared Open Graph card renderer.
 *
 * Used by the root card and by every game page's `opengraph-image` route, so
 * social previews stay visually identical across the site. Rendered at build
 * time — these routes sit on statically generated pages.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

export function renderOgImage({
  title,
  subtitle,
  accent = '#9e1316'
}: {
  title: string;
  subtitle: string;
  accent?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#1A1F26',
          padding: '72px 80px',
          fontFamily: 'sans-serif'
        }}
      >
        <div style={{ display: 'flex', width: 96, height: 12, borderRadius: 999, backgroundColor: accent }} />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 82,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: 1.05
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 28,
              fontSize: 34,
              color: '#9BA3AF',
              lineHeight: 1.35,
              maxWidth: 900
            }}
          >
            {subtitle}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', width: 14, height: 14, borderRadius: 999, backgroundColor: accent }} />
          <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, color: '#ffffff', letterSpacing: '0.12em' }}>
            {APP_NAME.toUpperCase()}
          </div>
        </div>
      </div>
    ),
    OG_SIZE
  );
}
