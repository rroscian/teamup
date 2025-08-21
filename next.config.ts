import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  images: {
    domains: ['https://teamup-rroscian.onrender.com'],
  },
};

export default nextConfig;
