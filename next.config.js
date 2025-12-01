/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./ni18n/request.ts');

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs']
  },
  images: {
    domains: ['localhost', 'vercel.app'],
    formats: ['image/webp', 'image/avif']
  }
};

module.exports = withNextIntl(nextConfig);
