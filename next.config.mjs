/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  output: "standalone",
  allowedDevOrigins: ['192.168.18.87', 'localhost', '127.0.0.1'],
};
export default nextConfig;
