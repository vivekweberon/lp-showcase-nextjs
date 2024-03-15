/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  basePath: process.env.NODE_ENV === "production" ? "/lp-showcase" : "",
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
