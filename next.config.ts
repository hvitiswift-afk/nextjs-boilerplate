import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath: isGitHubPages ? "/nextjs-boilerplate" : undefined,
  assetPrefix: isGitHubPages ? "/nextjs-boilerplate/" : undefined,
  images: {
    unoptimized: isGitHubPages,
  },
};

export default nextConfig;
