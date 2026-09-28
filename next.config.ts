import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // `*.live.ts` files are server-only routes (the AI chat API). Static export can't serve them,
  // so they're only picked up in normal (Vercel / next start) builds.
  pageExtensions: process.env.STATIC_EXPORT ? ["tsx", "ts"] : ["live.ts", "tsx", "ts"],
  // STATIC_EXPORT=1 npm run build → plain static files in /out (for static hosts / previews)
  // (export has no image optimiser, so images are served as-is from their pre-sized WebP files)
  ...(process.env.STATIC_EXPORT ? { output: "export" as const, images: { unoptimized: true } } : {}),
  experimental: {
    optimizePackageImports: ["framer-motion"],
    // Inline the (small) Tailwind stylesheet to remove the render-blocking request.
    inlineCss: !process.env.STATIC_EXPORT,
  },
};

export default nextConfig;
