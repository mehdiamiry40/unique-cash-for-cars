import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    const consolidatedSuburbs = [
      "ashmore",
      "burleigh-heads",
      "carrara",
      "helensvale",
      "ipswich",
      "labrador",
      "logan",
      "mermaid-waters",
      "mudgeeraba",
      "nerang",
      "pacific-pines",
      "palm-beach",
      "robina",
      "southport",
      "surfers-paradise",
      "toowoomba",
      "upper-coomera",
      "varsity-lakes",
      "cash-for-cars-adelaide",
    ];
    return consolidatedSuburbs.map((suburb) => ({
      source: `/cash-for-cars/${suburb}`,
      destination: "/cash-for-cars/",
      permanent: true,
    }));
  },
};

export default nextConfig;
