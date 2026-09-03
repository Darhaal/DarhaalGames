import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';

/**
 * Renders a generated avatar locally instead of calling api.dicebear.com.
 *
 * The previous implementation put the DiceBear API URL straight into
 * `profiles.avatar_url` and the auth metadata, which meant two things: every
 * avatar render was a request to a third party, and the seed we were sending
 * them is the Supabase user id. That handed a external service a list of our
 * user identifiers for no benefit.
 *
 * This keeps the stored value short — `/avatar/<seed>` rather than a 3 KB data
 * URI in every row — while the SVG itself is produced here. Output is a pure
 * function of the seed, so it is marked immutable and served from the edge
 * cache after the first render; the function runs once per seed, not per view.
 */

/*
 * Deliberately NOT `force-static`: the seed space is unbounded, so with no
 * `generateStaticParams` that would prerender zero paths and every request
 * would 404 — which is exactly what happened on the first deploy. Caching
 * comes from the immutable header below instead, which the edge honours after
 * the first render.
 */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ seed: string }> }
) {
  const { seed } = await params;

  const svg = createAvatar(avataaars, {
    seed,
    backgroundColor: ['transparent']
  }).toString();

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      // Deterministic for a given seed, so it never needs revalidating.
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
