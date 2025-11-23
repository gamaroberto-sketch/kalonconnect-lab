import { promises as fs } from "fs";
import path from "path";

const USAGE_DIR = path.join(process.cwd(), "data", "usage");
const SUMMARY_FILE = path.join(USAGE_DIR, "summary.json");

const ensureUsageDir = async () => {
  await fs.mkdir(USAGE_DIR, { recursive: true });
  try {
    await fs.access(SUMMARY_FILE);
  } catch {
    await fs.writeFile(
      SUMMARY_FILE,
      JSON.stringify(
        {
          totalSessions: 0,
          demoSessions: 0,
          normalSessions: 0,
          proSessions: 0,
          averageDuration: 0,
          mostUsedPanel: null,
          mostUsedFeature: null
        },
        null,
        2
      ),
      "utf-8"
    );
  }
};

const usageFilePath = (sessionId) =>
  path.join(USAGE_DIR, `usage-${sessionId}.json`);

const readJsonFile = async (filePath, fallback = null) => {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeJsonFile = async (filePath, data) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
};

const computeSummary = async () => {
  const files = await fs.readdir(USAGE_DIR);
  const sessionFiles = files.filter(
    (name) => name.startsWith("usage-") && name.endsWith(".json")
  );

  let totalSessions = 0;
  let demoSessions = 0;
  let normalSessions = 0;
  let proSessions = 0;
  let totalDuration = 0;
  const panelUsage = new Map();
  const featureUsage = new Map();

  for (const fileName of sessionFiles) {
    const payload = await readJsonFile(path.join(USAGE_DIR, fileName));
    if (!payload) continue;

    if (!payload.endedAt || typeof payload.durationMinutes !== "number") {
      continue;
    }

    totalSessions += 1;
    totalDuration += payload.durationMinutes;

    switch ((payload.version || "").toUpperCase()) {
      case "DEMO":
        demoSessions += 1;
        break;
      case "PRO":
        proSessions += 1;
        break;
      case "NORMAL":
        normalSessions += 1;
        break;
      default:
        break;
    }

    if (Array.isArray(payload.actions)) {
      for (const action of payload.actions) {
        if (action.panel) {
          const current = panelUsage.get(action.panel) || 0;
          panelUsage.set(action.panel, current + 1);
        }
        if (action.featureKey) {
          const current = featureUsage.get(action.featureKey) || 0;
          featureUsage.set(action.featureKey, current + 1);
        }
      }
    }
  }

  const averageDuration =
    totalSessions === 0 ? 0 : Math.round(totalDuration / totalSessions);

  const mostUsedPanel =
    panelUsage.size === 0
      ? null
      : [...panelUsage.entries()].sort((a, b) => b[1] - a[1])[0][0];

  const mostUsedFeature =
    featureUsage.size === 0
      ? null
      : [...featureUsage.entries()].sort((a, b) => b[1] - a[1])[0][0];

  await writeJsonFile(SUMMARY_FILE, {
    totalSessions,
    demoSessions,
    normalSessions,
    proSessions,
    averageDuration,
    mostUsedPanel,
    mostUsedFeature
  });
};

const parseBody = (req) => {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
};

const normalizeDetailLevel = (version, detailLevel) => {
  const normalizedVersion = (version || "").toUpperCase();
  if (detailLevel) return detailLevel;
  switch (normalizedVersion) {
    case "DEMO":
      return "full";
    case "PRO":
      return "advanced";
    case "NORMAL":
      return "basic";
    default:
      return "basic";
  }
};

const sanitizeActionPayload = (action) => {
  if (!action) return {};
  const allowedKeys = [
    "time",
    "timestamp",
    "type",
    "panel",
    "featureKey",
    "notes",
    "metadata"
  ];
  return Object.fromEntries(
    Object.entries(action).filter(([key]) => allowedKeys.includes(key))
  );
};

const handleStartSession = async (payload) => {
  const {
    sessionId,
    userEmail,
    userName,
    version,
    startedAt = new Date().toISOString(),
    detailLevel
  } = payload;

  if (!sessionId || !userEmail) {
    return { status: 400, body: { error: "sessionId e userEmail são obrigatórios." } };
  }

  const sessionFile = usageFilePath(sessionId);
  const existing = await readJsonFile(sessionFile);

  if (existing?.startedAt && !existing?.endedAt) {
    return { status: 409, body: { error: "Sessão já iniciada." } };
  }

  const sessionData = {
    sessionId,
    userEmail,
    userName,
    version: (version || "NORMAL").toUpperCase(),
    startedAt,
    endedAt: null,
    durationMinutes: null,
    detailLevel: normalizeDetailLevel(version, detailLevel),
    actions: []
  };

  await writeJsonFile(sessionFile, sessionData);

  return { status: 201, body: { ok: true, session: sessionData } };
};

const handleRegisterAction = async (payload) => {
  const { sessionId, action } = payload;
  if (!sessionId || !action) {
    return { status: 400, body: { error: "sessionId e action são obrigatórios." } };
  }

  const sessionFile = usageFilePath(sessionId);
  const sessionData = await readJsonFile(sessionFile);

  if (!sessionData) {
    return { status: 404, body: { error: "Sessão não encontrada." } };
  }

  const detailLevel = sessionData.detailLevel || "basic";
  const sanitizedAction = sanitizeActionPayload(action);

  const nowIso = new Date().toISOString();

  const actionEntry = {
    time: sanitizedAction.time || nowIso,
    type: sanitizedAction.type || "unknown",
    panel: sanitizedAction.panel || null,
    featureKey: sanitizedAction.featureKey || null,
    metadata:
      detailLevel === "advanced" || detailLevel === "full"
        ? {
            ...sanitizedAction.metadata,
            notes: sanitizedAction.notes || undefined
          }
        : undefined
  };

  if (detailLevel === "basic") {
    actionEntry.metadata = undefined;
  }

  sessionData.actions = Array.isArray(sessionData.actions)
    ? [...sessionData.actions, actionEntry]
    : [actionEntry];

  await writeJsonFile(sessionFile, sessionData);

  return { status: 200, body: { ok: true } };
};

const handleEndSession = async (payload) => {
  const {
    sessionId,
    endedAt = new Date().toISOString(),
    durationMinutes,
    summary
  } = payload;

  if (!sessionId) {
    return { status: 400, body: { error: "sessionId é obrigatório." } };
  }

  const sessionFile = usageFilePath(sessionId);
  const sessionData = await readJsonFile(sessionFile);

  if (!sessionData) {
    return { status: 404, body: { error: "Sessão não encontrada." } };
  }

  if (sessionData.endedAt) {
    return { status: 409, body: { error: "Sessão já encerrada." } };
  }

  sessionData.endedAt = endedAt;
  if (typeof durationMinutes === "number") {
    sessionData.durationMinutes = durationMinutes;
  } else if (sessionData.startedAt) {
    const elapsedMs =
      new Date(endedAt).getTime() - new Date(sessionData.startedAt).getTime();
    sessionData.durationMinutes = Math.max(
      0,
      Math.round((elapsedMs || 0) / 60000)
    );
  } else {
    sessionData.durationMinutes = 0;
  }

  if (summary && typeof summary === "object") {
    sessionData.sessionSummary = summary;
  }

  await writeJsonFile(sessionFile, sessionData);
  await computeSummary();

  return { status: 200, body: { ok: true, session: sessionData } };
};

const handleListSessions = async (limit = 100) => {
  const files = await fs.readdir(USAGE_DIR);
  const sessionFiles = files
    .filter((name) => name.startsWith("usage-") && name.endsWith(".json"))
    .slice(0, 500); // safety upper bound

  const sessions = [];
  for (const name of sessionFiles) {
    const data = await readJsonFile(path.join(USAGE_DIR, name));
    if (data) {
      sessions.push(data);
    }
  }

  sessions.sort((a, b) => {
    const aDate = new Date(a.endedAt || a.startedAt || 0).getTime();
    const bDate = new Date(b.endedAt || b.startedAt || 0).getTime();
    return bDate - aDate;
  });

  return sessions.slice(0, Number(limit) || 100);
};

export default async function handler(req, res) {
  await ensureUsageDir();

  if (req.method === "GET") {
    try {
      const { limit = 100 } = req.query || {};
      const sessions = await handleListSessions(limit);
      const summary = await readJsonFile(SUMMARY_FILE, {});
      return res.status(200).json({ summary, sessions });
    } catch (error) {
      console.error("Erro ao listar sessões de uso:", error);
      return res
        .status(500)
        .json({ error: "Não foi possível carregar os relatórios de uso." });
    }
  }

  if (req.method === "POST") {
    const payload = parseBody(req);
    const event = payload?.event;

    try {
      switch (event) {
        case "start": {
          const { status, body } = await handleStartSession(payload);
          return res.status(status).json(body);
        }
        case "action": {
          const { status, body } = await handleRegisterAction(payload);
          return res.status(status).json(body);
        }
        case "end": {
          const { status, body } = await handleEndSession(payload);
          return res.status(status).json(body);
        }
        default:
          return res
            .status(400)
            .json({ error: "Evento inválido para a API de uso." });
      }
    } catch (error) {
      console.error("Erro na API de uso:", error);
      return res
        .status(500)
        .json({ error: "Falha ao processar evento de uso." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}

