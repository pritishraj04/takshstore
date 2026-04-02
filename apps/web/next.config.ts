import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // In Next.js 15, this is a top-level property
  outputFileTracingRoot: path.join(__dirname, "../../"),

  turbopack: {
    // This tells Turbopack where the monorepo root (and node_modules) is
    root: path.join(__dirname, "../../"),
  },
};

export default nextConfig;
