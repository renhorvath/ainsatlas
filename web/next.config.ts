import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // App lives in web/; postbuild sync copies traced assets to repo root for Vercel
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
