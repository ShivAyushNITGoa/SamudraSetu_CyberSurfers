/** @type {import('next').NextConfig} */
const nextConfig = {
  // appDir is now stable in Next.js 14, no need for experimental flag
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    const path = require('path')
    // Alias Leaflet CSS to a local empty file to avoid Next parsing legacy IE filters
    config.resolve = config.resolve || {}
    config.resolve.alias = config.resolve.alias || {}
    config.resolve.alias['leaflet/dist/leaflet.css'] = path.resolve(__dirname, 'styles/leaflet-empty.css')
    return config
  }
}

module.exports = nextConfig