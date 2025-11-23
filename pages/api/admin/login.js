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

  if (!fs.existsSync(ADMIN_DATA_PATH)) {
    console.error("Arquivo data/admin.json não encontrado.");
    return res
      .status(500)
      .json({ ok: false, error: "Configuração administrativa ausente." });
  }

  try {
    const raw = fs.readFileSync(ADMIN_DATA_PATH, "utf8");
    const credentials = JSON.parse(raw);

    const isValid =
      credentials?.email === email && credentials?.password === password;

    if (!isValid) {
      return res
        .status(401)
        .json({ ok: false, error: "Credenciais inválidas" });
    }

    const tokenPayload = `${email}:${Date.now()}`;
    const token = Buffer.from(tokenPayload).toString("base64");

    return res.status(200).json({ ok: true, token });
  } catch (error) {
    console.error("Erro ao validar credenciais administrativas:", error);
    return res
      .status(500)
      .json({ ok: false, error: "Erro interno ao validar acesso." });
  }
}






