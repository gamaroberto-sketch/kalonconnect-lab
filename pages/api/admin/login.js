import fs from "fs";
import path from "path";

const ADMIN_DATA_PATH = path.join(process.cwd(), "data", "admin.json");

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Método não permitido" });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ ok: false, error: "Informe e-mail e senha válidos." });
  }

  // Strategy 1: Environment Variables (Vercel Best Practice)
  const envEmail = process.env.ADMIN_EMAIL;
  const envPassword = process.env.ADMIN_PASSWORD;

  if (envEmail && envPassword) {
    if (email === envEmail && password === envPassword) {
      const tokenPayload = `${email}:${Date.now()}`;
      const token = Buffer.from(tokenPayload).toString("base64");
      return res.status(200).json({ ok: true, token });
    }
  }

  // Strategy 2: Local File (Legacy/Dev)
  try {
    if (fs.existsSync(ADMIN_DATA_PATH)) {
      const raw = fs.readFileSync(ADMIN_DATA_PATH, "utf8");
      const credentials = JSON.parse(raw);
      if (credentials?.email === email && credentials?.password === password) {
        const tokenPayload = `${email}:${Date.now()}`;
        const token = Buffer.from(tokenPayload).toString("base64");
        return res.status(200).json({ ok: true, token });
      }
    }
  } catch (err) {
    console.warn("Falha ao ler arquivo de credenciais:", err);
  }

  // Strategy 3: Hardcoded Fallback (Emergency Rescue for Lab)
  const fallbackEmail = "bobgama@uol.com.br";
  // Simple obfuscation to prevent plain text search scraping of this file (base64)
  // "Bobgama6" -> Qm9iZ2FtYTY=
  const fallbackPass = Buffer.from("Qm9iZ2FtYTY=", 'base64').toString('utf-8');

  if (email === fallbackEmail && password === fallbackPass) {
    const tokenPayload = `${email}:${Date.now()}`;
    const token = Buffer.from(tokenPayload).toString("base64");
    return res.status(200).json({ ok: true, token });
  }

  return res.status(401).json({ ok: false, error: "Credenciais inválidas" });
}






