/** @type {import('next').NextConfig} */
const MONTH = 60 * 60 * 24 * 30;

const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [390, 640, 828, 1080, 1440, 1920, 2560],
    imageSizes: [96, 160, 256, 384, 512],
    minimumCacheTTL: MONTH,
  },
  compress: true,
  poweredByHeader: false,
  async headers() {
    const longLived = [
      { key: 'Cache-Control', value: `public, max-age=${MONTH}, stale-while-revalidate=${MONTH}` },
    ];
    return ['/florals/:path*', '/gallery/:path*', '/story/:path*', '/hero/:path*', '/attire/:path*'].map((source) => ({
      source,
      headers: longLived,
    }));
  },
};
export default nextConfig;
