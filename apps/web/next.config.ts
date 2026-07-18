import type { NextConfig } from "next";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["prettier"],
  images: {
    remotePatterns: (() => {
      if (!convexUrl) return [];
      try {
        const url = new URL(convexUrl);
        return [
          {
            protocol: url.protocol.replace(":", "") as "http" | "https",
            hostname: url.hostname,
            port: url.port,
            pathname: "/**",
          },
        ];
      } catch {
        return [];
      }
    })(),
  },
};

export default nextConfig;
