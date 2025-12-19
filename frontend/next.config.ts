import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable standalone output for Docker
  output: 'standalone',
  // Ensure proper routing in production
  trailingSlash: false,
  // Enable proper static file serving
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
