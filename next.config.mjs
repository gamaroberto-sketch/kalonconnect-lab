/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // 🔴 TEMPORÁRIO: Desabilitado para testar compiling eterno
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
          { key: "X-Port", value: "3000" },
        ],
      },
    ];
  },
};

export default nextConfig;
