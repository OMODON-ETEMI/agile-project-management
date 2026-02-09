  /**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  /* config options here */

  reactStrictMode: false,

  env: {
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname : "img.clerk.com"
      },
      {
        protocol: 'https',
        hostname : "images.unsplash.com"
      }
    ]
  }
};
 
export default nextConfig