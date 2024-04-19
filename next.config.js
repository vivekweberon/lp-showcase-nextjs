const nextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  basePath: "/lp-showcase",
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["images.pexels.com"],
  },
};

module.exports = nextConfig;
