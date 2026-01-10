import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["prettier"],
};

export default nextConfig;
