import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Semua halaman per pengguna (cookie sesi), jadi tanpa Cache Components: render dinamis biasa.
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
