import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Token logos from DexScreener.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.dexscreener.com",
        pathname: "/cms/images/**",
      },
    ],
  },
};

export default nextConfig;
