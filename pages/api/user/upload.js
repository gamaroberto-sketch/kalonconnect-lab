import fs from "fs/promises";
import path from "path";

const MEDIA_DIR = path.join(process.cwd(), "public", "user-media");

const ALLOWED_VIDEO_EXT = new Set([".mp4", ".mov", ".webm"]);
const ALLOWED_AUDIO_EXT = new Set([".mp3", ".wav", ".ogg"]);

const ensureMediaDir = async () => {
  await fs.mkdir(MEDIA_DIR, { recursive: true });
};

const getSafeFileName = (fileName = "") => {
  const base = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
  if (!base) {
    return null;
  }
  return base;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { fileName, data, overwrite = true } = body || {};

    if (!fileName || typeof data !== "string") {
      return res.status(400).json({
        message: "Requisição inválida. Envie 'fileName' e 'data' em base64."
      });
    }

    const safeName = getSafeFileName(fileName);
    if (!safeName) {
      return res.status(400).json({ message: "Nome de arquivo inválido." });
    }

    const ext = path.extname(safeName).toLowerCase();
    const isVideo = ALLOWED_VIDEO_EXT.has(ext);
    const isAudio = ALLOWED_AUDIO_EXT.has(ext);

    if (!isVideo && !isAudio) {
      return res.status(400).json({
        message: "Extensão de arquivo não suportada."
      });
    }

    await ensureMediaDir();

    const buffer = Buffer.from(
      data.replace(/^data:.*;base64,/, ""),
      "base64"
    );

    const targetPath = path.join(MEDIA_DIR, safeName);

    if (!overwrite) {
      try {
        await fs.access(targetPath);
        return res.status(409).json({
          message: "Já existe um arquivo com esse nome."
        });
      } catch {
        // Arquivo não existe, prosseguir
      }
    }

    await fs.writeFile(targetPath, buffer);

    const publicPath = `/user-media/${safeName}`;
    return res.status(200).json({
      path: publicPath,
      type: isVideo ? "video" : "audio",
      size: buffer.length
    });
  } catch (error) {
    console.error("Erro ao salvar mídia:", error);
    return res
      .status(500)
      .json({ message: "Não foi possível salvar o arquivo de mídia." });
  }
}













