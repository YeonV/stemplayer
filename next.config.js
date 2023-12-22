/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  assetPrefix: isProd ? '/stemplayer/' : '',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
