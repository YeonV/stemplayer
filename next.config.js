/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production' && process.env.PROD_ENV === 'github'

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  assetPrefix: isProd ? '/stemplayer/' : '',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
