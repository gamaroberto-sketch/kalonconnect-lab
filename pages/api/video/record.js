import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const RECORDINGS_DIR = path.join(PUBLIC_DIR, "user-media", "recordings");

function ensureDirectories() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR);
  }
  if (!fs.existsSync(path.join(PUBLIC_DIR, "user-media"))) {
    fs.mkdirSync(path.join(PUBLIC_DIR, "user-media"));
  }
  if (!fs.existsSync(RECORDINGS_DIR)) {
    fs.mkdirSync(RECORDINGS_DIR);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Método não suportado." });
  }

  const { fileName, data, mimeType } = req.body || {};

  if (!fileName || !data) {
    return res.status(400).json({ ok: false, error: "Dados insuficientes para salvar a gravação." });
  }

  try {
    ensureDirectories();

    const base64Data = data.includes(",") ? data.split(",")[1] : data;
    const buffer = Buffer.from(base64Data, "base64");

    const safeName = fileName.replace(/[^a-zA-Z0-9-_\\.]+/g, "_");
    const filePath = path.join(RECORDINGS_DIR, safeName || "gravacao.webm");

    fs.writeFileSync(filePath, buffer);

    return res.status(200).json({
      ok: true,
      path: `/user-media/recordings/${safeName}`
    });
  } catch (error) {
    console.error("Erro ao salvar gravação:", error);
    return res.status(500).json({ ok: false, error: "Falha ao salvar a gravação." });
  }
}



