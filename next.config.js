/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable compression
  compress: true,
  
  // Optimize production builds
  swcMinify: true,
  
  // Optimize images (if any are added in the future)
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 480, 768, 1024, 1280],
    imageSizes: [16, 32, 48, 64, 96],
  },
  
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize bundle
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
}

module.exports = nextConfig
