import { promises as fs } from "fs";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "data", "test-users.json");

const ensureFile = async () => {
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    await fs.writeFile(USERS_FILE, "[]", "utf-8");
  }
};

const loadUsers = async () => {
  await ensureFile();
  const raw = await fs.readFile(USERS_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.users)) return parsed.users;
    return [];
  } catch (error) {
    console.error("Erro ao ler test-users.json:", error);
    return [];
  }
};

const saveUsers = async (users) => {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
};

const isAdmin = (req) => {
  const header = req.headers["x-test-user"];
  if (header) {
    try {
      const parsed = JSON.parse(header);
      return parsed?.email === "bobgama@uol.com.br";
    } catch {
      return false;
    }
  }
  const body = req.body;
  if (body && typeof body === "object" && body.adminEmail) {
    return body.adminEmail === "bobgama@uol.com.br";
  }
  return false;
};

export default async function handler(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ error: "Acesso restrito." });
  }

  try {
    if (req.method === "GET") {
      const users = await loadUsers();
      return res.status(200).json(users);
    }

    if (req.method === "POST") {
      const { name, email, password } =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

      if (!name || !email || !password) {
        return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
      }

      const users = await loadUsers();
      if (users.find((user) => user.email?.toLowerCase() === email.toLowerCase())) {
        return res.status(409).json({ error: "E-mail já cadastrado." });
      }

      const nextUsers = [...users, { name, email, password }];
      await saveUsers(nextUsers);
      return res.status(201).json({ ok: true });
    }

    if (req.method === "PUT") {
      const { email, updates } =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};

      if (!email || !updates) {
        return res.status(400).json({ error: "E-mail e dados atualizados são obrigatórios." });
      }

      const users = await loadUsers();
      const index = users.findIndex(
        (item) => item.email?.toLowerCase() === email.toLowerCase()
      );
      if (index === -1) {
        return res.status(404).json({ error: "Usuária não encontrada." });
      }

      users[index] = {
        ...users[index],
        ...updates
      };
      await saveUsers(users);
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const { email } =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      if (!email) {
        return res.status(400).json({ error: "E-mail é obrigatório para remover." });
      }
      const users = await loadUsers();
      const nextUsers = users.filter(
        (item) => item.email?.toLowerCase() !== email.toLowerCase()
      );
      if (nextUsers.length === users.length) {
        return res.status(404).json({ error: "Usuária não encontrada." });
      }

      await saveUsers(nextUsers);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    return res.status(405).end("Method Not Allowed");
  } catch (error) {
    console.error("Erro no endpoint /api/test-users:", error);
    return res.status(500).json({ error: "Falha ao processar a requisição." });
  }
}








