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
};

export default nextConfig;
