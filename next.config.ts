import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Source maps are only useful to us in local dev; emitting them lengthens every build
  // and deploy without changing what ships to the browser.
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Avatars are content-addressed uploads and Google profile URLs — effectively
    // immutable. The 60s default re-optimizes the same images all day.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xmwhwexuqajglbjgwute.supabase.co",
        pathname: "/storage/v1/object/public/profile-pictures/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    // lucide-react is already in Next's default list; the Radix dropdown is not.
    optimizePackageImports: ["@radix-ui/react-dropdown-menu"],
    // Default is 0, which re-fetches a dynamic route's RSC payload on every back/forward.
    staleTimes: { dynamic: 30 },
  },
};

export default nextConfig;
