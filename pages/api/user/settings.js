import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "user-settings.json");

const DEFAULT_SETTINGS = {
  waitingRoom: {
    mediaType: "video",
    mediaSrc: "",
    music: "",
    message: "",
    allowClientPreview: true,
    alertOnClientJoin: true,
    multiSpecialty: false,
    animatedMessage: false,
    specialtyOverrides: {}
  }
};

const ensureDataFile = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(
      DATA_FILE,
      JSON.stringify(DEFAULT_SETTINGS, null, 2),
      "utf-8"
    );
  }
};

const readSettings = async () => {
  await ensureDataFile();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const writeSettings = async (payload) => {
  await ensureDataFile();
  const settings = {
    ...DEFAULT_SETTINGS,
    ...payload,
    waitingRoom: {
      ...DEFAULT_SETTINGS.waitingRoom,
      ...(payload.waitingRoom || {})
    }
  };

  await fs.writeFile(DATA_FILE, JSON.stringify(settings, null, 2), "utf-8");
  return settings;
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    const settings = await readSettings();
    return res.status(200).json(settings);
  }

  if (req.method === "POST") {
    try {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      if (!body || typeof body !== "object") {
        return res.status(400).json({
          message: "O corpo da requisição deve ser um objeto JSON válido."
        });
      }

      const settings = await writeSettings(body);
      return res.status(200).json(settings);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      return res
        .status(500)
        .json({ message: "Não foi possível salvar as configurações." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}

