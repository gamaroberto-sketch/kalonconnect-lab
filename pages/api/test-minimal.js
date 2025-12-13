export default function handler(req, res) {
    res.status(200).json({
        message: "Minimal test route is working!",
        time: new Date().toISOString(),
        env_check: {
            has_url: !!process.env.LIVEKIT_URL,
            has_key: !!process.env.LIVEKIT_API_KEY
        }
    });
}
