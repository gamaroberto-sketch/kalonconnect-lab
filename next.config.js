/** @type {import('next').NextConfig} */
// Teste Vercel: Commit Real (Não vazio) - Tentativa Final
// next.config.jst integration fixed! Auto-deploy verification (2026-01-18 13:51)
const nextConfig = {
    reactStrictMode: false, // 🟢 Disable Strict Mode to differentiate real double-invokes from dev mode
    generateBuildId: async () => {
        return 'v11.22-cache-buster-' + Date.now();
    },
    headers: async () => {
        return [
            {
                // 🟢 Force No-Cache for Consultation Pages
                source: '/consultations/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    },
                    {
                        key: 'Pragma',
                        value: 'no-cache',
                    },
                    {
                        key: 'Expires',
                        value: '0',
                    },
                ],
            },
            {
                source: '/api/:path*',
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                ]
            }
        ];
    },
};

module.exports = nextConfig;
