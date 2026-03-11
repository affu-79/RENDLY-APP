/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    instrumentationHook: true,
    optimizePackageImports: [
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
    ],
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'api.example.com' },
      { protocol: 'https', hostname: '**.example.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
  // compiler.removeConsole not supported with Turbopack; omit to use --turbo
  webpack: (config, { dev }) => {
    if (dev) {
      // Use memory cache to avoid ENOENT / missing chunk (e.g. 276.js) on Windows
      config.cache = { type: 'memory' };
    }
    return config;
  },
};

module.exports = nextConfig;
