/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log("Backend URL for rewrites:", backendUrl);
    const baseUrl = backendUrl.replace(/\/api\/v1\/?$/, ""); // Remove /api/v1 suffix
    
    return [
      {
        source: "/api/:path*",
        destination: `${baseUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
