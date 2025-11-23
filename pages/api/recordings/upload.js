import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "200mb"
    }
  }
};

const RECORDINGS_DIR = path.join(
  process.cwd(),
  "public",
  "user-media",
  "recordings"
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { filename, mimeType, base64Data, system } = req.body ?? {};

    if (!filename || !base64Data) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing filename or base64 data." });
    }

    const cleanFilename = sanitizeFilename(filename);
    const buffer = decodeBase64(base64Data);

    await fs.promises.mkdir(RECORDINGS_DIR, { recursive: true });
    const filePath = path.join(RECORDINGS_DIR, cleanFilename);

    await fs.promises.writeFile(filePath, buffer);

    return res.status(200).json({
      ok: true,
      path: `/user-media/recordings/${cleanFilename}`,
      system,
      mimeType
    });
  } catch (error) {
    console.error("Erro ao salvar gravação:", error);
    return res
      .status(500)
      .json({ ok: false, error: "Não foi possível salvar a gravação." });
  }
}

const sanitizeFilename = (value) => {
  return value.replace(/[^a-zA-Z0-9-_\\.]/g, "_");
};

const decodeBase64 = (value) => {
  const cleaned = value.includes(",") ? value.split(",").pop() : value;
  return Buffer.from(cleaned, "base64");
};

