import { promises as fs } from "fs";
import path from "path";

const DATA_ROOT = path.join(process.cwd(), "data");
const TRANSCRIPTS_DIR = path.join(DATA_ROOT, "session-transcripts");

const sanitize = (value = "") =>
  value
    .toString()
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .slice(0, 80) || "default";

const ensureDir = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

const getTranscriptPath = async (sessionId) => {
  await ensureDir(TRANSCRIPTS_DIR);
  return path.join(TRANSCRIPTS_DIR, `${sanitize(sessionId)}.json`);
};

const readTranscriptData = async (sessionId) => {
  const filePath = await getTranscriptPath(sessionId);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeTranscriptData = async (sessionId, payload) => {
  const filePath = await getTranscriptPath(sessionId);
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf-8");
  return filePath;
};

const extractKeywords = (text) => {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^a-záàâãéêíóôõúç\s]/gi, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4);

  const counter = new Map();
  words.forEach((word) => {
    counter.set(word, (counter.get(word) || 0) + 1);
  });

  return [...counter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
};

const buildSummary = (transcript) => {
  const paragraphs = transcript.split(/[.!?]+/).filter(Boolean);

  const summary = [
    "Resumo da Sessão:",
    paragraphs[0]?.trim() || "Sessão focada em escuta ativa e acolhimento.",
    paragraphs[1]?.trim() || "Cliente relatou avanços e desafios recentes.",
    "Profissional sugeriu práticas de autorregulação e um plano de continuidade."
  ].join(" ");

  const template = {
    temaPrincipal: "",
    pontosTrabalhados: "",
    emocoesObservadas: "",
    sugestoesTerapeuticas: "",
    palavrasChaveEnergeticas: ""
  };

  return { summary, template };
};

export default async function handler(req, res) {
  if (req.method === "PUT") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const { sessionId, summary, transcript, keywords } = body;
      if (!sessionId) {
        return res.status(400).json({ error: "sessionId é obrigatório." });
      }
      const data = (await readTranscriptData(sessionId)) || {
        sessionId,
        duration: "00:00:00",
        mode: "áudio e vídeo",
        transcript: transcript || "",
        summary: "",
        keywords: []
      };
      const updated = {
        ...data,
        summary: summary ?? data.summary,
        transcript: transcript ?? data.transcript,
        keywords: Array.isArray(keywords)
          ? keywords
          : data.keywords,
        generatedAt: new Date().toISOString()
      };
      await writeTranscriptData(sessionId, updated);
      return res.status(200).json(updated);
    } catch (error) {
      console.error("Erro ao atualizar resumo:", error);
      return res.status(500).json({ error: "Não foi possível atualizar o resumo." });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "PUT"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { sessionId, transcript, clientId, clientName, professionalId, recordedAt, metadata } = body;

    if (!sessionId || !transcript) {
      return res.status(400).json({ error: "sessionId e transcript são obrigatórios." });
    }

    const existing = (await readTranscriptData(sessionId)) || {
      sessionId,
      duration: "00:00:00",
      mode: "áudio e vídeo",
      transcript: "",
      summary: "",
      keywords: []
    };

    const { summary, template } = buildSummary(transcript);
    const keywords = extractKeywords(transcript);

    const payload = {
      ...existing,
      transcript,
      summary,
      keywords,
      template,
      generatedAt: new Date().toISOString(),
      clientId: clientId ?? existing.clientId ?? null,
      clientName: clientName ?? existing.clientName ?? "",
      professionalId: professionalId ?? existing.professionalId ?? null,
      recordedAt: recordedAt ?? existing.recordedAt ?? new Date().toISOString(),
      metadata: {
        ...(existing.metadata || {}),
        ...(metadata || {})
      }
    };

    await writeTranscriptData(sessionId, payload);

    return res.status(200).json({
      summary,
      keywords,
      template
    });
  } catch (error) {
    console.error("Erro ao gerar resumo:", error);
    return res.status(500).json({ error: "Não foi possível gerar o resumo no momento." });
  }
}



