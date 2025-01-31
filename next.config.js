/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // trailingSlash: true,
  basePath: "/lp-bestbuys",
  output: "export",

  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["images.pexels.com"],
  },
  env: {
    siteToBuild: 'lp-bestbuys',
  },
};

module.exports = nextConfig;
