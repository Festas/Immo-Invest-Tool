import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Generate unique build ID based on timestamp for cache busting
  generateBuildId: async () => {
    // Use timestamp to ensure unique build ID on each deployment
    return `build-${Date.now()}`;
  },
  // CSP headers to allow OpenStreetMap tiles and Leaflet assets
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              img-src 'self' data: https://*.tile.openstreetmap.org https://unpkg.com;
              style-src 'self' 'unsafe-inline';
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              connect-src 'self' https://openplzapi.org https://overpass-api.de https://*.tile.openstreetmap.org;
            `
              .replace(/\n/g, " ")
              .replace(/\s+/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
