import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "user-banks.json");

const ensureDataFile = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch (error) {
    const fallback = { banks: {} };
    await fs.writeFile(DATA_FILE, JSON.stringify(fallback, null, 2), "utf-8");
  }
};

const normalizeBankData = (bankData = {}) => {
  const pixKeys = Array.isArray(bankData.pixKeys)
    ? bankData.pixKeys.map((key) => String(key))
    : [];

  const accounts = Array.isArray(bankData.accounts)
    ? bankData.accounts.map((account) => ({
        agency: String(account?.agency ?? ""),
        number: String(account?.number ?? ""),
        type: String(account?.type ?? "CC"),
        holderName: String(account?.holderName ?? ""),
        holderDoc: String(account?.holderDoc ?? "")
      }))
    : [];

  return { pixKeys, accounts };
};

const readBanksPayload = async () => {
  try {
    await ensureDataFile();
    const content = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== "object") {
      return { banks: {} };
    }

    const normalizedBanks = Object.entries(parsed.banks ?? {}).reduce((acc, [code, data]) => {
      const normalizedCode = String(code).padStart(3, "0");
      acc[normalizedCode] = normalizeBankData(data);
      return acc;
    }, {});

    return { banks: normalizedBanks };
  } catch (error) {
    return { banks: {} };
  }
};

const writeBanksPayload = async (payload) => {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), "utf-8");
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    const payload = await readBanksPayload();
    return res.status(200).json(payload);
  }

  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      if (!body || typeof body !== "object" || !body.banks || typeof body.banks !== "object") {
        return res.status(400).json({ message: "O corpo da requisição deve conter um objeto 'banks'." });
      }

      const normalizedBanks = Object.entries(body.banks).reduce((acc, [code, data]) => {
        const normalizedCode = String(code).padStart(3, "0");
        acc[normalizedCode] = normalizeBankData(data);
        return acc;
      }, {});

      const payload = { banks: normalizedBanks };
      await writeBanksPayload(payload);
      return res.status(200).json(payload);
    } catch (error) {
      return res.status(500).json({ message: "Não foi possível salvar as informações bancárias." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}
