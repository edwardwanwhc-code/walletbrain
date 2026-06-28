import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages deploys to https://edwardwanwhc-code.github.io/walletbrain/
  basePath: "/walletbrain",
  // Static export doesn't support next/image optimization
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
