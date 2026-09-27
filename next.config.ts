import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["framer-motion"],
    // Inline the (small) Tailwind stylesheet to remove the render-blocking request.
    inlineCss: true,
  },
};

export default nextConfig;
