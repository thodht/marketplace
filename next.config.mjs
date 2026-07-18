/** @type {import('next').NextConfig} */

const NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['http://10.0.0.93:3000', 'https://thodht.a.pinggy.link'],
  reactStrictMode: true,

  // ✅ Move infrastructureLogging here to the top level
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // ✅ Next.js top-level option to suppress Dev logs/warnings
  infrastructureLogging: {
    level: 'error',
  },

  // Disables the HMR connection error overlay widget in the browser
  devIndicators: false,

  // Keep your custom webpack watch options if you still want them
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
}

export default NextConfig
