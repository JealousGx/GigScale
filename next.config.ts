import type { NextConfig } from "next";

import "./lib/env";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.gigscale.app",
      },
    ],
  },
};

export default nextConfig;
