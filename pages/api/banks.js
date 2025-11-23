import fs from "fs/promises";
import path from "path";

const BANKS_FILE = path.join(process.cwd(), "data", "banks.json");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const raw = await fs.readFile(BANKS_FILE, "utf-8");
    const data = JSON.parse(raw);
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Não foi possível carregar a lista de bancos.", error: error.message });
  }
}

















