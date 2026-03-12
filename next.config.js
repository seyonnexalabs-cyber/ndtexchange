
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    // Set to false to hide build errors.
    // Recommended to set to true for production builds.
    ignoreBuildErrors: false,
  },
  eslint: {
    // Set to false to hide lint errors.
    // Recommended to set to true for production builds.
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'as2.ftcdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.shutterstock.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  allowedDevOrigins: [
      "https://9000-firebase-studio-1768384484103.cluster-a6zx3cwnb5hnuwbgyxmofxpkfe.cloudworkstations.dev",
      "http://9000-firebase-studio-1768384484103.cluster-a6zx3cwnb5hnuwbgyxmofxpkfe.cloudworkstations.dev",
  ],
};

module.exports = nextConfig;
