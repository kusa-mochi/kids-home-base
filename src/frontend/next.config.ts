import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // dockerfile_runner/Dockerfile が src/frontend/dist を静的配信用にコピーするため、静的エクスポートを有効にする。
  output: "export",
  distDir: "dist",
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
