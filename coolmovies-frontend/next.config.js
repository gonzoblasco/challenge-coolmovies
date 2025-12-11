/** @type {import('next').NextConfig} */
module.exports = {
  // compiler: { emotion: true }, // Removed for Tailwind
  async rewrites() {
    return [
      {
        source: '/graphql',
        destination: process.env.GRAPHQL_API_URL || 'http://localhost:5001/graphql',
      },
    ];
  },
  reactStrictMode: true,
};
