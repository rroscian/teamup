import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  images: {
    domains: ['teamup-rroscian.onrender.com', 'images.unsplash.com'],
  },
};

export default nextConfig;
