/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Proxy browser API calls through our own domain so the auth cookie is
    // same-origin from the browser's point of view. The frontend and backend
    // are on different domains (vercel.app / onrender.com); without this,
    // browsers that block third-party/cross-site cookies (Safari by default,
    // Firefox, Chrome with strict privacy settings) would silently refuse to
    // store the session cookie after login.
    const backend = process.env.API_URL ?? "http://localhost:3001/api";
    return [{ source: "/api/:path*", destination: `${backend}/:path*` }];
  },
};

module.exports = nextConfig;
