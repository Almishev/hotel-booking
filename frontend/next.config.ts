import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // Production optimizations for Render deployment
  output: 'standalone',
  // Ensure proper routing in production
  trailingSlash: false,
  // Enable proper static file serving
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
