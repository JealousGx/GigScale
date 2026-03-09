import type { NextConfig } from "next";

import "./lib/env";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    domains: ["assets.gigscale.app"],
  },
};

export default nextConfig;
