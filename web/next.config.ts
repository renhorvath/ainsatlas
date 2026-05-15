import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Monorepo: trace files from web/ when the repo root has its own package-lock.json
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
