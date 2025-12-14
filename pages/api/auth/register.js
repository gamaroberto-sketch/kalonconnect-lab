import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const USERS_FILE = path.join(process.cwd(), "data", "test-users.json");

const loadUsers = () => {
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : (data.users || []);
  } catch (error) {
    return [];
  }
};

const saveUsers = (users) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { name, email, password, referredBy } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  const users = loadUsers();

  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: "Email já cadastrado." });
  }

  // 7 Days Trial Logic
  const trialDays = 7;
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password, // Storing plaintext as per existing pattern for MVP
    type: "professional",
    version: "normal", // Start with NORMAL trial
    referredBy: referredBy || null,
    trialEndsAt: trialEndsAt.toISOString(),
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  console.log(`✅ Novo usuário registrado: ${name} (${email}) - Trial até ${trialEndsAt.toISOString()}`);

  return res.status(201).json({
    ok: true,
    message: "Cadastro realizado com sucesso! Aproveite seus 7 dias de acesso Standard grátis."
  });
}
