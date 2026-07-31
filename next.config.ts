import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/github-control-tower-audit",
          destination: "/github-control-tower-audit/current",
        },
        {
          source: "/api/revenue/pilot",
          destination: "/api/revenue/pilot/current",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
