/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  basePath: "/lp-bayrentals",
  output: "export",

  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["images.pexels.com"],
  },
  env: {
    siteName: 'lp-bayrentals',
  },
};

module.exports = nextConfig;