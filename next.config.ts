import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration for reverse proxy access through HMS Gateway
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            // Allow embedding in frames from the HMS Gateway
            value: 'ALLOW-FROM http://localhost:6900',
          },
          {
            key: 'Content-Security-Policy',
            // Restrict direct access, only allow framing from HMS Gateway
            value: "frame-ancestors 'self' http://localhost:6900;",
          },
        ],
      },
    ];
  },
  // Handle auth token when receiving it in URL parameters
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'query',
            key: 'auth_token',
          },
        ],
        destination: '/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
