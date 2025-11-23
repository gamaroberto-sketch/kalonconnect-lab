import { promises as fs } from "fs";
import path from "path";

const DATA_ROOT = path.join(process.cwd(), "data");
const TEMP_DIR = path.join(DATA_ROOT, "recordings", "temp");
const CLIENTS_DIR = path.join(DATA_ROOT, "clients");

const sanitize = (value = "") =>
  value
    .toString()
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .slice(0, 64) || "default";

const ensureDir = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

const fileExists = async (target) => {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
};

const getSessionDir = async (clientId, sessionId) => {
  const safeClient = sanitize(clientId);
  const safeSession = sanitize(sessionId);
  const dir = path.join(CLIENTS_DIR, safeClient, "sessions", safeSession);
  await ensureDir(dir);
  return dir;
};

const saveTempRecording = async ({ sessionId, data, mimeType, timestamp }) => {
  if (!sessionId || !data) {
    throw new Error("sessionId e data são obrigatórios.");
  }

  await ensureDir(TEMP_DIR);
  const safeSession = sanitize(sessionId);
  const safeTimestamp = sanitize(timestamp || Date.now().toString());
  const extension = mimeType && mimeType.includes("audio") && !mimeType.includes("video") ? "webm" : "webm";
  const fileName = `session-${safeSession}-${safeTimestamp}.${extension}`;
  const buffer = Buffer.from(data, "base64");
  const targetPath = path.join(TEMP_DIR, fileName);
  await fs.writeFile(targetPath, buffer);
  return { fileName, tempPath: targetPath };
};

const finalizeRecording = async ({
  clientId,
  sessionId,
  tempFileName,
  duration,
  recordingMode,
  notifyClient,
  professionalId
}) => {
  if (!clientId || !sessionId || !tempFileName) {
    throw new Error("clientId, sessionId e tempFileName são obrigatórios.");
  }

  const safeTemp = sanitize(tempFileName);
  const originPath = path.join(TEMP_DIR, safeTemp);
  try {
    await fs.access(originPath);
  } catch {
    throw new Error("Arquivo temporário não encontrado.");
  }

  const sessionDir = await getSessionDir(clientId, sessionId);
  const targetPath = path.join(sessionDir, "recording.webm");
  await fs.rename(originPath, targetPath);

  const stats = await fs.stat(targetPath);
  const metadata = {
    clientId: sanitize(clientId),
    sessionId: sanitize(sessionId),
    professionalId: professionalId ? sanitize(professionalId) : null,
    savedAt: new Date().toISOString(),
    duration: Number(duration) || 0,
    recordingMode: recordingMode || "audio-video",
    notifyClient: Boolean(notifyClient),
    size: stats.size,
    transcriptionStatus: "pending",
    summaryStatus: "pending"
  };

  await fs.writeFile(
    path.join(sessionDir, "metadata.json"),
    JSON.stringify(metadata, null, 2),
    "utf-8"
  );

  return { metadata, recordingPath: targetPath };
};

const deleteTempRecording = async ({ tempFileName }) => {
  if (!tempFileName) return;
  const safeTemp = sanitize(tempFileName);
  const target = path.join(TEMP_DIR, safeTemp);
  try {
    await fs.unlink(target);
  } catch {
    // ignore
  }
};

const listClientSessions = async (clientId) => {
  const safeClient = sanitize(clientId);
  const sessionsDir = path.join(CLIENTS_DIR, safeClient, "sessions");
  try {
    const entries = await fs.readdir(sessionsDir, { withFileTypes: true });
    const results = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const sessionId = entry.name;
      const sessionPath = path.join(sessionsDir, sessionId);
      const metadataPath = path.join(sessionPath, "metadata.json");
      const transcriptPath = path.join(sessionPath, "transcript.txt");
      const summaryPath = path.join(sessionPath, "summary.json");

      let metadata = {};
      try {
        const raw = await fs.readFile(metadataPath, "utf-8");
        metadata = JSON.parse(raw);
      } catch {
        metadata = {};
      }

      let size = metadata.size || null;
      try {
        const stats = await fs.stat(path.join(sessionPath, "recording.webm"));
        size = stats.size;
      } catch {
        size = null;
      }

      results.push({
        sessionId,
        metadata,
        recordingExists: size != null,
        size,
        transcriptExists: await fileExists(transcriptPath),
        summaryExists: await fileExists(summaryPath)
      });
    }
    return results.sort((a, b) =>
      (b.metadata?.savedAt || "").localeCompare(a.metadata?.savedAt || "")
    );
  } catch {
    return [];
  }
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { clientId } = req.query || {};
    if (!clientId) {
      return res.status(400).json({ message: "clientId é obrigatório para consulta." });
    }
    const sessions = await listClientSessions(clientId);
    return res.status(200).json({ sessions });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const action = body.action || "save-temp";

    if (action === "save-temp") {
      const result = await saveTempRecording(body);
      return res.status(200).json(result);
    }

    if (action === "finalize") {
      const result = await finalizeRecording(body);
      return res.status(200).json(result);
    }

    if (action === "delete-temp") {
      await deleteTempRecording(body);
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ message: "Ação inválida." });
  } catch (error) {
    console.error("Erro no endpoint /api/recordings:", error);
    return res.status(500).json({ error: "Não foi possível processar a requisição." });
  }
}







