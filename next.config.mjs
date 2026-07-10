/** @type {import('next').NextConfig} */

const NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['http://10.0.0.130:3000', 'prelaw-rice-lukewarm.ngrok-free.dev', 'https://sandbox.minepi.com/', 'https://backend.appstudio-u7cm9zhmha0ruwv8.piappengine.com', 'https://api.minepi.com'],
}

export default NextConfig
