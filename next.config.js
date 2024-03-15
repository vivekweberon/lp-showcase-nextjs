/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  output: "export",

  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["images.pexels.com"],
  },
};

module.exports = nextConfig;
