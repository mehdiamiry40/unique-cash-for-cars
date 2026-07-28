import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  trailingSlash: true,
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/wp-content/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/wp-includes/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/:asset(mirror-enhancements.js|site-enhancements.css)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
