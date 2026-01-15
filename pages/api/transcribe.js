import { promises as fs, createReadStream } from "fs";
import path from "path";
import OpenAI from "openai";

const DATA_ROOT = path.join(process.cwd(), "data");
const TRANSCRIPTS_DIR = path.join(DATA_ROOT, "session-transcripts");
const CLIENTS_DIR = path.join(DATA_ROOT, "clients");

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

const readTranscriptFile = async (sessionId) => {
  const filePath = await getTranscriptPath(sessionId);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const writeTranscriptFile = async (sessionId, payload) => {
  const filePath = await getTranscriptPath(sessionId);
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf-8");
  return filePath;
};

const buildTranscriptPayload = ({
  existing = {},
  sessionId,
  duration,
  mode,
  transcript,
  summary,
  keywords,
  clientId,
  clientName,
  professionalId,
  recordedAt,
  metadata = {}
}) => {
  const now = new Date().toISOString();
  return {
    ...existing,
    sessionId,
    clientId: clientId ?? existing.clientId ?? null,
    clientName: clientName ?? existing.clientName ?? "",
    professionalId: professionalId ?? existing.professionalId ?? null,
    duration: duration || existing.duration || "00:00:00",
    mode: mode || existing.mode || "áudio e vídeo",
    transcript: transcript ?? existing.transcript ?? "",
    summary: summary ?? existing.summary ?? "",
    keywords: Array.isArray(keywords)
      ? keywords
      : Array.isArray(existing.keywords)
        ? existing.keywords
        : [],
    recordedAt: recordedAt || existing.recordedAt || now,
    generatedAt: now,
    metadata: {
      ...(existing.metadata || {}),
      ...metadata
    }
  };
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { sessionId } = req.query || {};
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId é obrigatório." });
    }
    const data = await readTranscriptFile(sessionId);
    if (!data) {
      return res.status(404).json({ error: "Transcrição não encontrada." });
    }
    return res.status(200).json(data);
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { sessionId, duration, mode, clientId, transcript: incomingTranscript } = body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId é obrigatório." });
    }

    const existing = await readTranscriptFile(sessionId);

    let transcriptText = incomingTranscript;

    // If no text provided, attempt to Generate via OpenAI
    if (!transcriptText) {
      if (!process.env.OPENAI_API_KEY) {
        // Fallback to mock if no key, but warn in log
        console.warn("OPENAI_API_KEY not found. Using mock transcription.");
        transcriptText = [
          "[MOCK - Configure OPENAI_API_KEY para real]",
          "Transcrição automática (simulada) – início da sessão.",
          "Profissional acolhe e valida emoções do cliente.",
          "Cliente relata avanços, recaídas e novas percepções.",
          "Profissional oferece estratégias de autorregulação.",
          "Conclusão com reforço de conquistas."
        ].join(" ");
      } else {
        // Real Transcription Logic
        // 🟢 v5.75: Check Credits
        const { hasSufficientCredits, deductCredits, AI_COSTS } = require("../../lib/credits");
        const professionalId = body.professionalId; // Ensure this is passed from frontend

        if (!professionalId) {
          // Try to infer or fail? 
          // Transcribe is usually called by the professional.
          console.warn("ProfessionalId missing in transcribe request. Charging might fail.");
          // For strictness:
          return res.status(400).json({ error: "professionalId é obrigatório para cobrança de créditos." });
        }

        const canProceed = await hasSufficientCredits(professionalId, AI_COSTS.TRANSCRIPTION);
        if (!canProceed) {
          return res.status(402).json({
            error: "Créditos insuficientes.",
            message: `Transcrição requer ${AI_COSTS.TRANSCRIPTION} créditos. Recarregue sua conta.`
          });
        }

        if (!clientId) {
          return res.status(400).json({ error: "clientId é obrigatório para localizar a gravação." });
        }

        const recordingPath = path.join(
          CLIENTS_DIR,
          sanitize(clientId),
          "sessions",
          sanitize(sessionId),
          "recording.webm"
        );

        try {
          await fs.access(recordingPath);
        } catch {
          return res.status(404).json({ error: "Arquivo de gravação não encontrado para esta sessão." });
        }

        try {
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

          console.log(`Iniciando transcrição real para: ${recordingPath}`);
          const transcription = await openai.audio.transcriptions.create({
            file: createReadStream(recordingPath),
            model: "whisper-1",
            language: "pt", // Force Portuguese
            response_format: "text"
          });

          transcriptText = transcription; // It returns string if response_format is text

          // 🟢 v5.75: Deduct Credits on Success
          await deductCredits(professionalId, AI_COSTS.TRANSCRIPTION);
          console.log(`Transcrição concluída. ${AI_COSTS.TRANSCRIPTION} Créditos descontados de ${professionalId}`);

        } catch (aiError) {
          console.error("Erro na OpenAI API:", aiError);
          return res.status(500).json({ error: "Falha ao processar áudio na IA: " + aiError.message });
        }
      }
    }

    const payload = buildTranscriptPayload({
      existing,
      sessionId,
      duration: duration || "00:00:00",
      mode: mode || "áudio e vídeo",
      transcript: transcriptText,
      summary: existing?.summary,
      keywords: existing?.keywords,
      clientId: body.clientId,
      clientName: body.clientName,
      professionalId: body.professionalId,
      recordedAt: body.recordedAt,
      metadata: body.metadata
    });

    await writeTranscriptFile(sessionId, payload);

    return res.status(200).json(payload);
  } catch (error) {
    console.error("Erro na transcrição:", error);
    return res
      .status(500)
      .json({ error: "Não foi possível gerar a transcrição no momento." });
  }
}



