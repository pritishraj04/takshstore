import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  // @ts-ignore
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
};

export default nextConfig;
