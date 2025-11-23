import fs from "fs";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "data", "test-users.json");

const loadUsers = () => {
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data;
    }
    if (Array.isArray(data?.users)) {
      return data.users;
    }
    return [];
  } catch (error) {
    console.error("Erro ao carregar users.json:", error);
    return [];
  }
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Credenciais inválidas" });
  }

  const users = loadUsers();
  const user = users.find(
    (item) =>
      item.email?.toLowerCase() === email.toLowerCase() && item.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Acesso não autorizado" });
  }

  const timestamp = new Date().toLocaleString("pt-BR");
  console.log(
    `✅ Login realizado: ${user.name || "Usuário"} (${user.email}) - ${timestamp}`
  );

  return res.status(200).json({
    ok: true,
    user: {
      id: user.id || user.email,
      name: user.name,
      email: user.email,
      version: (user.version || "PRO").toUpperCase(),
      type: user.type || "professional"
    }
  });
}
