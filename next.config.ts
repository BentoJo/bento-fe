import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal self-contained server output → small, runtime-clean Docker image.
  output: "standalone",
  images: {
    // Workspace logos + user avatars are arbitrary remote https URLs.
    // TODO: narrow hostname to the actual asset/CDN host once finalized.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
