// pages/api/test/livekit.js

export default async function handler(req, res) {
  try {
    const { AccessToken } = require("livekit-server-sdk");

    const wsUrl = process.env.LIVEKIT_URL;

    // Derivar URL HTTP a partir da URL WS (wss -> https, ws -> http)
    const httpUrl = wsUrl
      ?.replace(/^wss:/, "https:")
      ?.replace(/^ws:/, "http:");

    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity: "test-client" }
    );

    token.ttl = 300;
    token.addGrant({ roomJoin: true });

    const jwt = await token.toJwt();

    const region = await fetch(`${httpUrl}/settings/regions`).then((r) => r.status);

    return res.status(200).json({
      url: wsUrl,
      httpUrl,
      apiKey: process.env.LIVEKIT_API_KEY,
      regionStatus: region,
      tokenPreview: jwt.substring(0, 30) + "...",
    });

  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
}

