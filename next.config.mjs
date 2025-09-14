import { withPWA } from 'next-pwa';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  pwa: {
    dest: 'public',
    disable: isDev,
    register: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^https?.*/, // cache all HTTP/S requests
        handler: 'NetworkFirst',
        options: {
          cacheName: 'http-cache',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
          },
        },
      },
    ],
  },
};

export default withPWA(nextConfig);
