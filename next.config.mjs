/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      // Force /sign-in and /sign-up to always hit our simple pages
      // This overrides any catch-all folder conflicts
      {
        source: "/sign-in",
        destination: "/sign-in",
      },
      {
        source: "/sign-up",
        destination: "/sign-up",
      },
    ]
  },
}

export default nextConfig
