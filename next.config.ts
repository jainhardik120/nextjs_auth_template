import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "document-export.canva.com",
      },
    ],
  },
  webpack: (
    /** @type {import('webpack').Configuration & { externals: string[] }} */
    config,
    { isServer },
  ) => {
    if (isServer) {
      config.externals.push("esbuild");
    }

    return config;
  },
};

export default nextConfig;
