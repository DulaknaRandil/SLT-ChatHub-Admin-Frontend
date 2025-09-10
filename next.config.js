/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // allow images served from your backend/railway host
    domains: ['chathubbackend-production.up.railway.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'chathubbackend-production.up.railway.app',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
