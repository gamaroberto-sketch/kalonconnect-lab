import { promises as fs } from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "data", "system");
const LOG_FILE = path.join(LOG_DIR, "performance.log");

const ensureLogFile = async () => {
  try {
    await fs.access(LOG_DIR);
  } catch {
    await fs.mkdir(LOG_DIR, { recursive: true });
  }

  try {
    await fs.access(LOG_FILE);
  } catch {
    await fs.writeFile(LOG_FILE, "", "utf-8");
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    await ensureLogFile();
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const timestamp = new Date().toISOString();
    const sessionId = body.sessionId || "unknown";
    const details = body.details || "mode: low-power";
    const line = `[${timestamp}] -> ${sessionId} | ${details}\n`;
    await fs.appendFile(LOG_FILE, line, "utf-8");
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Erro ao registrar performance:", error);
    return res.status(500).json({ error: "Não foi possível registrar o evento." });
  }
}













