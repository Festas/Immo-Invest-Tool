import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Generate unique build ID based on timestamp for cache busting
  generateBuildId: async () => {
    // Use timestamp to ensure unique build ID on each deployment
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
