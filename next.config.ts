import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "flagcdn.com" },      // country flags (Flager)
      { protocol: "https", hostname: "api.dicebear.com" }, // generated avatars
      { protocol: "https", hostname: "**.supabase.co" },   // uploaded avatars (storage)
    ],
    // dicebear serves SVG — allowed deliberately, with a strict CSP against malicious SVG
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
