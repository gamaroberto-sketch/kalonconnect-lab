/** @type {import('next').NextConfig} */
const nextConfig = {
    // Test: Vercel auto-deploy verification (2026-01-19 - Morning Check)
    reactStrictMode: false,
    // 🟢 Disable Strict Mode to differentiate real double-invokes from dev mode
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
    // 🔧 TEMPORARY: Disable minification to debug TDZ errors
    swcMinify: false,
    // 🟢 Debug Settings
    productionBrowserSourceMaps: true,
};

module.exports = nextConfig;
