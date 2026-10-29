import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Cache Components (experimental) caused inconsistent AppShell widths on some
  // client-rendered pages in dev (e.g. /products/loans rendering narrower than
  // /products/fd). Nothing in this app uses "use cache"/cacheLife/cacheTag, so
  // there's no functional loss in leaving it off.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
