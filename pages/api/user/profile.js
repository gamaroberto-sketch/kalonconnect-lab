import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "user-profile.json");

const ensureDataFile = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch (error) {
    const fallback = {
      photo: "",
      specialty: "",
      name: "",
      signaturePad: "",
      signatureText: "",
      services: [],
      social: {
        instagram: "",
        whatsapp: "",
        site: "",
        tiktok: "",
        youtube: "",
        facebook: "",
        registro: ""
      }
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(fallback, null, 2), "utf-8");
  }
};

const normalizeProfile = (data = {}) => {
  const services = Array.isArray(data.services)
    ? data.services.map((service) => ({
        name: String(service?.name ?? ""),
        price: Number(service?.price ?? 0)
      }))
    : [];

  const social = {
    instagram: String(data?.social?.instagram ?? ""),
    whatsapp: String(data?.social?.whatsapp ?? ""),
    site: String(data?.social?.site ?? ""),
    tiktok: String(data?.social?.tiktok ?? ""),
    youtube: String(data?.social?.youtube ?? ""),
    facebook: String(data?.social?.facebook ?? ""),
    registro: String(data?.social?.registro ?? "")
  };

  return {
    photo: String(data.photo ?? ""),
    specialty: String(data.specialty ?? ""),
    name: String(data.name ?? ""),
    signaturePad: String(data.signaturePad ?? ""),
    signatureText: String(data.signatureText ?? ""),
    services,
    social
  };
};

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      await ensureDataFile();
      const content = await fs.readFile(DATA_FILE, "utf-8");
      const parsed = JSON.parse(content);
      return res.status(200).json(normalizeProfile(parsed));
    } catch (error) {
      return res.status(500).json({ message: "Não foi possível carregar o perfil." });
    }
  }

  if (req.method === "POST") {
    try {
      await ensureDataFile();
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const normalized = normalizeProfile(body);
      await fs.writeFile(DATA_FILE, JSON.stringify(normalized, null, 2), "utf-8");
      return res.status(200).json(normalized);
    } catch (error) {
      return res.status(500).json({ message: "Não foi possível salvar o perfil." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}












