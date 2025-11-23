import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const DATA_FILE = path.join(process.cwd(), "data", "demo-sessions.json");

const ensureDataFile = async () => {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
};

const readSessions = async () => {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeSessions = async (sessions) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(sessions, null, 2), "utf-8");
};

const withUpdatedStatus = (sessions) => {
  const now = Date.now();
  return sessions.map((item) => {
    if (item.status === "expired" || item.status === "used") {
      return item;
    }
    const expiresAt = new Date(item.expiresAt).getTime();
    if (Number.isFinite(expiresAt) && expiresAt < now) {
      return { ...item, status: "expired" };
    }
    return item;
  });
};

export default async function handler(req, res) {
  try {
    const sessions = withUpdatedStatus(await readSessions());

    if (req.method === "GET") {
      await writeSessions(sessions);
      const { id } = req.query || {};
      if (id) {
        const target = sessions.find((item) => item.id === id);
        if (!target) {
          return res.status(404).json({ error: "Convite demo não encontrado." });
        }
        return res.status(200).json(target);
      }
      return res.status(200).json(sessions);
    }

    if (req.method === "POST") {
      const { email, name, hours = 48 } =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

      if (!email || !name) {
        return res
          .status(400)
          .json({ error: "Nome e e-mail são obrigatórios para gerar o convite demo." });
      }

      const durationMs = Number(hours) * 3600000 || 48 * 3600000;
      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + durationMs);
      const id = `demo-${randomUUID().slice(0, 8)}`;
      const version = "demo";

      const newSession = {
        id,
        email,
        name,
        version,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        status: "active"
      };

      const nextSessions = [...sessions, newSession];
      await writeSessions(nextSessions);

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;

      return res.status(201).json({
        ...newSession,
        link: `${baseUrl.replace(/\/$/, "")}/login?demoId=${encodeURIComponent(id)}`
      });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end("Method Not Allowed");
  } catch (error) {
    console.error("Erro na API de demos:", error);
    return res.status(500).json({ error: "Falha ao processar convites de demonstração." });
  }
}

