import { promises as fs } from "fs";
import { createWriteStream } from "fs";
import path from "path";

const DATA_ROOT = path.join(process.cwd(), "data");
const TRANSCRIPTS_DIR = path.join(DATA_ROOT, "session-transcripts");
const NOTES_DIR = path.join(DATA_ROOT, "session-notes");
const REPORTS_DIR = path.join(DATA_ROOT, "reports");

const STOP_WORDS = new Set([
  "de",
  "a",
  "o",
  "que",
  "e",
  "do",
  "da",
  "em",
  "um",
  "para",
  "com",
  "não",
  "uma",
  "os",
  "no",
  "se",
  "na",
  "por",
  "mais",
  "as",
  "dos",
  "como",
  "mas",
  "foi",
  "ao",
  "ser",
  "tem",
  "já",
  "dos",
  "das",
  "entre",
  "quando",
  "sobre"
]);

const ensureDir = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

const safeReadDir = async (dirPath) => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json"));
  } catch {
    return [];
  }
};

const readJsonFromDir = async (dirPath) => {
  const files = await safeReadDir(dirPath);
  const results = [];
  for (const file of files) {
    try {
      const raw = await fs.readFile(path.join(dirPath, file.name), "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.sessionId) {
        results.push(parsed);
      }
    } catch {
      // ignora arquivos inválidos
    }
  }
  return results;
};

const durationToSeconds = (duration) => {
  if (!duration) return 0;
  if (typeof duration === "number") return duration;
  const parts = duration.split(":").map((value) => Number(value) || 0);
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }
  return Number(duration) || 0;
};

const secondsToHours = (seconds) => Number((seconds / 3600).toFixed(2));

const normalizeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
};

const wordCountFromText = (texts = []) => {
  const counter = new Map();
  texts
    .filter(Boolean)
    .forEach((text) => {
      text
        .toLowerCase()
        .replace(/[^a-zà-ú0-9\s]/gi, " ")
        .split(/\s+/)
        .filter((token) => token.length > 3 && !STOP_WORDS.has(token))
        .forEach((token) => {
          counter.set(token, (counter.get(token) || 0) + 1);
        });
    });
  return [...counter.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => ({ word, count }));
};

const resolveDateRange = ({ startDate, endDate, period }) => {
  let start = startDate ? new Date(startDate) : null;
  let end = endDate ? new Date(endDate) : null;

  if (period && !startDate && !endDate) {
    const now = new Date();
    end = now;
    const durationMap = {
      "7d": 7,
      "15d": 15,
      "30d": 30,
      "90d": 90,
      "180d": 180,
      "365d": 365
    };
    const days = durationMap[period] || 30;
    start = new Date(now);
    start.setDate(start.getDate() - days);
  }

  return {
    start: start && !Number.isNaN(start.getTime()) ? start : null,
    end: end && !Number.isNaN(end.getTime()) ? end : null
  };
};

const normalizeSessionRecord = ({ transcript, note }) => {
  const recordedAt =
    normalizeDate(
      note?.date ||
        transcript?.recordedAt ||
        transcript?.metadata?.savedAt ||
        transcript?.generatedAt
    ) || new Date().toISOString();

  const base = {
    sessionId: transcript?.sessionId || note?.sessionId,
    clientId: note?.clientId || transcript?.clientId || "cliente-desconhecido",
    clientName:
      note?.clientName ||
      transcript?.clientName ||
      note?.clientId ||
      transcript?.clientId ||
      "Cliente sem identificação",
    professionalId: transcript?.professionalId || note?.professionalId || null,
    duration: transcript?.duration || note?.duration || "00:00:00",
    summary: transcript?.summary || "",
    keywords: Array.isArray(transcript?.keywords) ? transcript.keywords : [],
    transcript: transcript?.transcript || "",
    notes: note?.notes || "",
    moodScore:
      typeof note?.moodScore === "number"
        ? note.moodScore
        : transcript?.metadata?.moodScore ?? null,
    mode: transcript?.mode || note?.mode || "áudio e vídeo",
    date: recordedAt,
    recordedAt,
    createdAt: normalizeDate(transcript?.generatedAt) || recordedAt,
    metadata: {
      ...(note?.metadata || {}),
      ...(transcript?.metadata || {})
    }
  };

  if (note?.extraKeywords?.length) {
    base.keywords = Array.from(
      new Set([...(base.keywords || []), ...note.extraKeywords])
    );
  }

  return base;
};

const buildReportData = async ({ professionalId, filters = {} }) => {
  const [transcripts, notes] = await Promise.all([
    readJsonFromDir(TRANSCRIPTS_DIR),
    readJsonFromDir(NOTES_DIR)
  ]);

  const notesBySession = new Map(
    notes.filter((item) => item?.sessionId).map((item) => [item.sessionId, item])
  );

  const sessionsMap = new Map();

  transcripts
    .filter((item) => item?.sessionId)
    .forEach((item) => {
      sessionsMap.set(item.sessionId, normalizeSessionRecord({ transcript: item, note: notesBySession.get(item.sessionId) }));
    });

  notes
    .filter((item) => item?.sessionId)
    .forEach((item) => {
      if (!sessionsMap.has(item.sessionId)) {
        sessionsMap.set(
          item.sessionId,
          normalizeSessionRecord({ transcript: null, note: item })
        );
      }
    });

  let sessions = [...sessionsMap.values()]
    .filter((session) => session.sessionId)
    .sort((a, b) => {
      const dateA = new Date(a.date || a.recordedAt || 0).getTime();
      const dateB = new Date(b.date || b.recordedAt || 0).getTime();
      return dateB - dateA;
    });

  const { clientId, keyword, search, startDate, endDate, period } = filters;

  const { start, end } = resolveDateRange({ startDate, endDate, period });

  if (professionalId) {
    sessions = sessions.filter(
      (session) =>
        !session.professionalId || session.professionalId === professionalId
    );
  }

  if (clientId && clientId !== "all") {
    sessions = sessions.filter((session) => session.clientId === clientId);
  }

  if (keyword && keyword !== "all") {
    const keywordLower = keyword.toLowerCase();
    sessions = sessions.filter(
      (session) =>
        session.keywords?.some((kw) => kw.toLowerCase() === keywordLower) ||
        session.summary?.toLowerCase().includes(keywordLower) ||
        session.notes?.toLowerCase().includes(keywordLower)
    );
  }

  if (search) {
    const target = search.toLowerCase();
    sessions = sessions.filter((session) => {
      const haystack = [
        session.sessionId,
        session.clientName,
        session.summary,
        session.notes,
        session.transcript,
        ...(session.keywords || [])
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(target);
    });
  }

  if (start || end) {
    sessions = sessions.filter((session) => {
      const date = new Date(session.date || session.recordedAt || 0);
      if (Number.isNaN(date.getTime())) return false;
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });
  }

  const totalSeconds = sessions.reduce(
    (acc, session) => acc + durationToSeconds(session.duration),
    0
  );
  const totalHours = secondsToHours(totalSeconds);

  const clientsMap = new Map();
  sessions.forEach((session) => {
    if (!clientsMap.has(session.clientId)) {
      clientsMap.set(session.clientId, {
        clientId: session.clientId,
        clientName: session.clientName
      });
    }
  });

  const keywordCounter = new Map();
  sessions.forEach((session) => {
    (session.keywords || []).forEach((kw) => {
      const normalized = kw.toLowerCase();
      keywordCounter.set(normalized, (keywordCounter.get(normalized) || 0) + 1);
    });
  });

  const modeCounter = new Map();
  sessions.forEach((session) => {
    const mode = session.mode || "áudio e vídeo";
    modeCounter.set(mode, (modeCounter.get(mode) || 0) + 1);
  });

  const moodTrend = sessions
    .filter((session) => typeof session.moodScore === "number")
    .map((session) => ({
      sessionId: session.sessionId,
      clientId: session.clientId,
      clientName: session.clientName,
      moodScore: session.moodScore,
      date: session.date || session.recordedAt
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const wordFrequency = wordCountFromText(
    sessions.flatMap((session) => [session.summary, session.notes, session.transcript])
  ).slice(0, 40);

  const topKeywords = [...keywordCounter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  const modeDistribution = [...modeCounter.entries()].map(([name, value]) => ({
    name,
    value
  }));

  const recentSessions = sessions
    .slice()
    .sort(
      (a, b) =>
        new Date(b.date || b.recordedAt || 0) -
        new Date(a.date || a.recordedAt || 0)
    )
    .slice(0, 5)
    .map((session) => ({
      sessionId: session.sessionId,
      clientName: session.clientName,
      date: session.date || session.recordedAt,
      duration: session.duration,
      summary: session.summary
    }));

  const averageMood =
    moodTrend.length > 0
      ? Number(
          (
            moodTrend.reduce((total, item) => total + item.moodScore, 0) /
            moodTrend.length
          ).toFixed(2)
        )
      : null;

  return {
    sessions,
    summary: {
      totals: {
        sessions: sessions.length,
        durationHours: totalHours,
        clients: clientsMap.size,
        averageMood
      },
      topKeywords,
      wordFrequency,
      modeDistribution,
      recentSessions,
      moodTrend
    },
    filtersMeta: {
      clients: [...clientsMap.values()],
      keywords: topKeywords.map((item) => item.word),
      availablePeriods: ["7d", "15d", "30d", "90d", "180d", "365d"]
    }
  };
};

const generatePdfReport = async ({ professionalId, sessions, summary, filters }) => {
  if (!sessions.length) {
    throw new Error("Não há dados suficientes para gerar o relatório.");
  }

  await ensureDir(REPORTS_DIR);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `relatorio-${timestamp}.pdf`;
  const filePath = path.join(REPORTS_DIR, fileName);

  const { default: PDFDocument } = await import("pdfkit");
  const doc = new PDFDocument({ margin: 50 });
  const stream = createWriteStream(filePath);
  doc.pipe(stream);

  const now = new Date();
  doc
    .fontSize(20)
    .text("Relatório Terapêutico KalonConnect", { align: "center" })
    .moveDown();
  doc
    .fontSize(12)
    .text(`Profissional: ${professionalId || "não informado"}`)
    .text(`Gerado em: ${now.toLocaleString("pt-BR")}`)
    .moveDown();

  doc.fontSize(14).text("Resumo Geral", { underline: true }).moveDown(0.5);
  doc
    .fontSize(12)
    .list(
      [
        `Total de sessões analisadas: ${summary?.totals?.sessions ?? 0}`,
        `Total de horas em sessão: ${summary?.totals?.durationHours ?? 0}`,
        `Clientes acompanhados: ${summary?.totals?.clients ?? 0}`,
        `Humor médio (moodScore): ${
          summary?.totals?.averageMood ?? "sem dados"
        }`
      ],
      { bulletRadius: 2 }
    )
    .moveDown();

  if (summary?.topKeywords?.length) {
    doc.fontSize(14).text("Palavras-chave em destaque", { underline: true });
    summary.topKeywords.slice(0, 10).forEach((item) => {
      doc.fontSize(12).text(`• ${item.word} (${item.count} ocorrências)`);
    });
    doc.moveDown();
  }

  if (summary?.recentSessions?.length) {
    doc.fontSize(14).text("Sessões Recentes", { underline: true }).moveDown(0.5);
    summary.recentSessions.forEach((session) => {
      doc
        .fontSize(12)
        .text(
          `${session.date ? new Date(session.date).toLocaleString("pt-BR") : "Data não informada"} • ${session.clientName} • ${session.sessionId}`
        );
      if (session.summary) {
        doc.fontSize(11).fillColor("#555555").text(session.summary, {
          indent: 12
        });
      }
      doc.fillColor("#000000").moveDown(0.5);
    });
  }

  doc.addPage().fontSize(16).text("Detalhamento das Sessões", { align: "center" }).moveDown();

  sessions.slice(0, 40).forEach((session, index) => {
    doc
      .fontSize(12)
      .text(
        `${index + 1}. ${session.clientName} (${session.sessionId})`,
        { underline: true }
      );
    doc
      .fontSize(11)
      .text(
        `Data: ${
          session.date ? new Date(session.date).toLocaleString("pt-BR") : "não informada"
        }`
      )
      .text(`Duração: ${session.duration || "00:00:00"}`)
      .text(`Modo: ${session.mode}`)
      .text(
        `Humor: ${
          typeof session.moodScore === "number" ? session.moodScore : "não informado"
        }`
      );
    if (session.summary) {
      doc.moveDown(0.3).fontSize(11).fillColor("#555555").text(session.summary);
    }
    if (session.notes) {
      doc.moveDown(0.3).fontSize(11).fillColor("#444444").text(session.notes, {
        oblique: true
      });
    }
    doc.fillColor("#000000").moveDown();
    if (doc.y > doc.page.height - 100) {
      doc.addPage();
    }
  });

  if (sessions.length > 40) {
    doc.fontSize(10).text("... (relatório truncado para manter a legibilidade)");
  }

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return {
    fileName,
    filePath,
    publicPath: `/data/reports/${fileName}`,
    generatedAt: now.toISOString(),
    filters
  };
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const {
        professionalId,
        clientId,
        keyword,
        search,
        startDate,
        endDate,
        period
      } = req.query || {};

      const report = await buildReportData({
        professionalId,
        filters: { clientId, keyword, search, startDate, endDate, period }
      });

      return res.status(200).json(report);
    } catch (error) {
      console.error("Erro ao carregar dados de relatórios:", error);
      return res
        .status(500)
        .json({ error: "Não foi possível carregar os relatórios no momento." });
    }
  }

  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      const { professionalId, filters } = body;

      const report = await buildReportData({ professionalId, filters });
      const pdf = await generatePdfReport({
        professionalId,
        sessions: report.sessions,
        summary: report.summary,
        filters
      });

      return res.status(200).json({
        success: true,
        report: pdf
      });
    } catch (error) {
      console.error("Erro ao gerar relatório em PDF:", error);
      return res
        .status(500)
        .json({ error: "Não foi possível gerar o relatório completo." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}












