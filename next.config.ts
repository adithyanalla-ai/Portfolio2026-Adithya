import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // STATIC_EXPORT=1 npm run build → plain static files in /out (for static hosts / previews)
  ...(process.env.STATIC_EXPORT ? { output: "export" as const } : {}),
  experimental: {
    optimizePackageImports: ["framer-motion"],
    // Inline the (small) Tailwind stylesheet to remove the render-blocking request.
    inlineCss: !process.env.STATIC_EXPORT,
  },
};

export default nextConfig;
