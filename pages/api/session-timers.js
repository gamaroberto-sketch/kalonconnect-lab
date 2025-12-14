import { promises as fs } from "fs";
import path from "path";

const DEFAULT_DATA = {
  lastSession: {
    start: null,
    elapsed: 0,
    status: "idle"
  },
  history: []
};

const getDataFilePath = () => path.join(process.cwd(), "data", "session-timers.json");

const normalizeData = (data) => {
  const lastSession = {
    ...DEFAULT_DATA.lastSession,
    ...(data?.lastSession || {})
  };

  return {
    lastSession,
    history: Array.isArray(data?.history) ? data.history : DEFAULT_DATA.history
  };
};

const ensureFileExists = async () => {
  const filePath = getDataFilePath();
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(DEFAULT_DATA, null, 2), "utf-8");
  }
  return filePath;
};

export default async function handler(req, res) {
  try {
    const filePath = await ensureFileExists();

    if (req.method === "GET") {
      const raw = await fs.readFile(filePath, "utf-8");
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = DEFAULT_DATA;
      }
      return res.status(200).json(normalizeData(data));
    }

    if (req.method === "POST") {
      if (typeof req.body !== "object" || req.body === null) {
        return res.status(400).json({ error: "Invalid payload" });
      }

      const normalized = normalizeData(req.body);
      try {
        await fs.writeFile(filePath, JSON.stringify(normalized, null, 2), "utf-8");
      } catch (writeErr) {
        console.warn("⚠️ Cannot write to filesystem (Vercel/ReadOnly):", writeErr.message);
        // Não retornar 500, pois isso é esperado em serverless. Apenas ignore.
      }
      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end("Method Not Allowed");
  } catch (error) {
    console.error("Session timers API error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}



















