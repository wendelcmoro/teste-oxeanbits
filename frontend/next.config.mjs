/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    GIPHY_API_KEY: process.env.GIPHY_API_KEY,
    API_URL: process.env.API_URL,
  },
};

export default nextConfig;
