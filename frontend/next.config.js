// @ts-check
const path = require('node:path');

/**
 * @type {import('next').NextConfig}
 * */
const nextConfig = {
  images: {
    domains: ['s4.anilist.co', 'media.kitsu.io'],
  },
  poweredByHeader: false,
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../'),
};

module.exports = nextConfig;
