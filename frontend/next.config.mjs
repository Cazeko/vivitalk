/** @type {import('next').NextConfig} */
const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";
const nextConfig = {
  reactStrictMode: false,
  experimental: { optimizePackageImports: ["framer-motion", "@react-three/drei"] },
  async rewrites() {
    return [
      { source: "/api/v1/:path*", destination: `${BACKEND}/api/v1/:path*` },
      { source: "/widget.js", destination: `${BACKEND}/widget.js` },
    ];
  },
};

export default nextConfig;
