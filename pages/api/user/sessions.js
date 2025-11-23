import { promises as fs } from "fs";
import path from "path";

const sessionsFile = path.join(process.cwd(), "data", "user-sessions.json");

const ensureFile = async () => {
  try {
    await fs.access(sessionsFile);
  } catch {
    const initial = { sessions: [] };
    await fs.mkdir(path.dirname(sessionsFile), { recursive: true });
    await fs.writeFile(sessionsFile, JSON.stringify(initial, null, 2), "utf-8");
  }
};

const readSessions = async () => {
  await ensureFile();
  const raw = await fs.readFile(sessionsFile, "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return { sessions: [] };
  }
};

const writeSessions = async (data) => {
  await ensureFile();
  await fs.writeFile(sessionsFile, JSON.stringify(data, null, 2), "utf-8");
};

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const data = await readSessions();
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const payload = req.body;
      if (!payload?.sessionId) {
        return res.status(400).json({ error: "sessionId é obrigatório." });
      }

      const data = await readSessions();
      const existingIndex = data.sessions.findIndex((session) => session.sessionId === payload.sessionId);
      const merged = {
        sessionId: payload.sessionId,
        recording: payload.recording ?? false,
        transcribed: payload.transcribed ?? false,
        summary: payload.summary ?? false,
        recordingMode: payload.recordingMode ?? "unknown",
        updatedAt: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        data.sessions[existingIndex] = { ...data.sessions[existingIndex], ...merged };
      } else {
        data.sessions.unshift(merged);
      }

      await writeSessions(data);
      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end("Method Not Allowed");
  } catch (error) {
    console.error("Erro no endpoint de sessões:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
}



















