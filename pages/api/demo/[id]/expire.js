import { promises as fs } from "fs";
import path from "path";

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

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end("Method Not Allowed");
  }

  const {
    query: { id }
  } = req;

  if (!id) {
    return res.status(400).json({ error: "ID do convite demo é obrigatório." });
  }

  try {
    const sessions = await readSessions();
    const index = sessions.findIndex((item) => item.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Convite demo não encontrado." });
    }

    const now = new Date().toISOString();
    sessions[index] = {
      ...sessions[index],
      status: "expired",
      expiresAt: sessions[index].expiresAt < now ? sessions[index].expiresAt : now
    };

    await writeSessions(sessions);
    return res.status(200).json(sessions[index]);
  } catch (error) {
    console.error("Erro ao expirar convite demo:", error);
    return res.status(500).json({ error: "Não foi possível expirar o convite demo." });
  }
}










