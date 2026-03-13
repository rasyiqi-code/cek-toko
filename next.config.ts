import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  devIndicators: {
    position: 'top-left',
  },
};

export default nextConfig;
