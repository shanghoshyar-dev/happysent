/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: false,
  },
  async redirects() {
    return [
      // Old marketing URL kept around for any external links.
      { source: "/om", destination: "/om-oss", permanent: true },
      // Convenience redirect so /admin/login also works (auth lives at /login).
      { source: "/admin/login", destination: "/login", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "private, no-cache, no-store, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
