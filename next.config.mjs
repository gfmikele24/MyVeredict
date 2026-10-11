/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: ["192.168.1.14"],
    experimental: {
        optimizePackageImports: ["@untitledui/icons"],
    },
};

export default nextConfig;
