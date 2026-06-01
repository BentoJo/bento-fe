import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Workspace logos and user avatars are remote URLs from the backend.
    // TODO: restrict hostname to the actual asset/CDN host once known.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
