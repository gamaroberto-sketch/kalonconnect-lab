import { promises as fs } from "fs";
import path from "path";
import OpenAI from "openai";

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

// Mock Fallback
const buildMockSummary = (transcript) => {
  return {
    summary: "RESUMO SIMULADO (Configure OPENAI_API_KEY): O cliente discutiu questões pessoais. O profissional ouviu atentamente.",
    keywords: ["Simulação", "Teste", "API Key", "Ausente", "Exemplo"],
    template: {
      temaPrincipal: "Simulação de Atendimento",
      pontosTrabalhados: "Nenhum (Mock)",
      emocoesObservadas: "Neutro",
      sugestoesTerapeuticas: "Configurar API Real"
    }
  };
};

export default async function handler(req, res) {
  if (req.method === "PUT") {
    // Manual Update (unchanged logic mostly, just ensuring persistence)
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

    let summaryData;

    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not found. Using mock summary.");
      summaryData = buildMockSummary(transcript);
    } else {
      try {
        console.log("Iniciando resumo via OpenAI GPT...");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const prompt = `
            Você é um assistente especialista em psicologia e terapia.
            Analise a seguinte transcrição de sessão e gere um resumo clínico estruturado em JSON.
            O formato deve ser exatamente:
            {
                "summary": "Resumo narrativo conciso (max 3 parágrafos) em terceira pessoa",
                "keywords": ["tag1", "tag2", "tag3", "tag4", "tag5"],
                "template": {
                    "temaPrincipal": "Tema central da sessão",
                    "pontosTrabalhados": "Pontos específicos abordados",
                    "emocoesObservadas": "Análise do estado emocional",
                    "sugestoesTerapeuticas": "Sugestões ou insights para próxima sessão"
                }
            }
            
            Transcrição:
            "${transcript.slice(0, 15000)}" 
            `;
        // Slicing to avoid token limits if transcript is huge, though GPT-4o context is large.

        const completion = await openai.chat.completions.create({
          model: "gpt-4o", // Or gpt-3.5-turbo if cost is concern, but user said "make it work!"
          messages: [
            { role: "system", content: "You are a helpful clinical assistant. Output JSON only." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        summaryData = JSON.parse(content);
        console.log("Resumo gerado com sucesso.");

      } catch (aiError) {
        console.error("Erro na OpenAI API (Summary):", aiError);
        return res.status(500).json({ error: "Falha ao gerar resumo na IA: " + aiError.message });
      }
    }

    const payload = {
      ...existing,
      transcript,
      summary: summaryData.summary,
      keywords: summaryData.keywords,
      template: summaryData.template,
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

    return res.status(200).json(summaryData);
  } catch (error) {
    console.error("Erro ao gerar resumo:", error);
    return res.status(500).json({ error: "Não foi possível gerar o resumo no momento." });
  }
}



