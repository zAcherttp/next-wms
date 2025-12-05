import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
  reactCompiler: true,
  transpilePackages: ["prettier"],
};

export default nextConfig;
