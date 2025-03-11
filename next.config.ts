import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
    // eslint: {
    //     ignoreDuringBuilds: true, // Disable ESLint during build
    // },
    // typescript: {
    //     ignoreBuildErrors: true, // Disable TypeScript type checking during build
    // },
};

export default nextConfig;
