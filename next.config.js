/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  // Ajout de la configuration pour les fichiers statiques
  async rewrites() {
    return [
      {
      source: '/uploads/:path*',
        destination: '/src/app/uploads/:path*',
      },
    ];
  },
};

module.exports = nextConfig;