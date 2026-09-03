import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },      // country flags (Flager)
      { protocol: "https", hostname: "**.supabase.co" },   // uploaded avatars (storage)
    ],
    // Avatars are now rendered by our own /avatar/[seed] route, so no external
    // host is needed for them. SVG stays enabled for that route, behind a strict CSP.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
