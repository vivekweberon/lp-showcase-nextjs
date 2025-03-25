/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  basePath: "/lp-showcase",
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