import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Generate unique build ID based on timestamp for cache busting
  generateBuildId: async () => {
    // Use timestamp to ensure unique build ID on each deployment
    return `build-${Date.now()}`;
  },
  // TODO: CSP headers temporarily removed to restore Next.js client-side functionality
  // The previous CSP configuration was blocking Next.js dynamic scripts (hydration, navigation, etc.)
  // CSP should be reconfigured later with proper Next.js compatibility (e.g., using nonces or 'unsafe-inline' for scripts)
};

export default nextConfig;
